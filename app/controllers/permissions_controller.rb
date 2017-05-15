# :nodoc:
class PermissionsController < ManageCmrController
  include PermissionManagement
  include GroupsHelper

  before_filter :groups_for_permissions, only: [:new, :edit, :update, :create]

  add_breadcrumb 'Collection Permissions', :permissions_path

  RESULTS_PER_PAGE = 25

  def index
    # Default the page to 1
    page = params.fetch('page', 1)

    @opts = {
      'provider'         => current_user.provider_id,
      'page_num'         => page,
      'page_size'        => RESULTS_PER_PAGE,
      'identity_type'    => 'catalog_item',
      'include_full_acl' => true
    }

    permissions_response = cmr_client.get_permissions(@opts, token)

    @permissions = if permissions_response.success?
                     permissions_response.body['items']
                   else
                     []
                   end

    @permissions = Kaminari.paginate_array(@permissions, total_count: permissions_response.body.fetch('hits', 0)).page(page).per(RESULTS_PER_PAGE)
  end

  def show
    @permission = {}
    @permission_concept_id = params[:id]

    permission_response = cmr_client.get_permission(@permission_concept_id, token)

    if permission_response.success?
      @permission = permission_response.body

      hydrate_groups(@permission)

      add_breadcrumb @permission.fetch('catalog_item_identity', {})['name'], permission_path(@permission_concept_id)
    else
      Rails.logger.error("Error retrieving a permission: #{permission_response.inspect}")
    end
  end

  def new
    @permission = {}

    add_breadcrumb 'New', new_permissions_path
  end

  def create
    @permission = construct_request_object(current_user.provider_id)

    response = cmr_client.add_group_permissions(@permission, token)

    if response.success?
      Rails.logger.info("#{current_user.urs_uid} CREATED catalog item ACL (Collection Permission) for #{current_user.provider_id}. #{response.body}")

      redirect_to permission_path(response.body['concept_id']), flash: { success: 'Collection Permission was successfully created.' }
    else
      Rails.logger.error("Collection Permission Creation Error: #{response.inspect}")

      # Look up the error code. If we have a friendly version, use it. Otherwise,
      # just use the error message as it comes back from the CMR.
      permission_creation_error = PermissionsHelper::ErrorCodeMessages[response.status]
      permission_creation_error ||= Array.wrap(response.body['errors'])[0]

      flash.now[:error] = permission_creation_error

      render :new
    end
  end

  def edit
    @permission = {}

    @permission_concept_id = params[:id]
    permission_response = cmr_client.get_permission(@permission_concept_id, token)

    if permission_response.success?
      @permission = permission_response.body

      add_breadcrumb @permission.fetch('catalog_item_identity', {})['name'], permission_path(@permission_concept_id)
      add_breadcrumb 'Edit', edit_permission_path(@permission_concept_id)

      hydrate_groups(@permission)
    else
      Rails.logger.error("Error retrieving a permission: #{permission_response.inspect}")
    end
  end

  def update
    @permission = {}
    @permission_concept_id = params[:id]
    permission_provider = params[:permission_provider]

    @permission = construct_request_object(permission_provider)

    update_response = cmr_client.update_permission(@permission, @permission_concept_id, token)

    if update_response.success?
      Rails.logger.info("#{current_user.urs_uid} UPDATED catalog item ACL (Collection Permission) for #{permission_provider}. #{response.body}")

      redirect_to permission_path(@permission_concept_id), flash: { success: 'Collection Permission was successfully updated.' }
    else
      hydrate_groups(@permission)

      Rails.logger.error("Collection Permission Update Error: #{update_response.inspect}")
      permission_update_error = Array.wrap(update_response.body['errors'])[0]

      if permission_update_error == 'Permission to update ACL is denied'
        redirect_to permission_path(@permission_concept_id), flash: { error: 'You are not authorized to update permissions. Please contact your system administrator.' }
      else
        flash[:error] = permission_update_error

        render :edit
      end
    end
  end

  def destroy
    response = cmr_client.delete_permission(params[:id], token)

    if response.success?
      flash[:success] = 'Collection Permission was successfully deleted.'
      Rails.logger.info("#{current_user.urs_uid} DELETED catalog item ACL for #{current_user.provider_id}. #{response.body}")
      redirect_to permissions_path
    else
      Rails.logger.error("Permission Deletion Error: #{response.inspect}")
      permission_deletion_error = Array.wrap(response.body['errors'])[0]
      flash[:error] = permission_deletion_error
      render :show
    end
  end

  private

  # Iterates through the groups associated with the provided collection
  # and hydrates the `group` key with the group details and `is_hidden`
  # with a boolean representing the users ability to see this group
  def hydrate_groups(permission)
    permission.fetch('group_permissions', []).each do |group_permission|
      next unless group_permission.key?('group_id')

      group_response = cmr_client.get_group(group_permission['group_id'], token)

      hydrate_group_permissions(group_permission)

      group_permission['group'] = group_response.body if group_response.success?

      # If this user does not have access to view this group mark it for hiding
      group_permission['is_hidden'] = true if group_permission['group_id'] =~ /(-CMR)$/ && !policy(:system_group).read?
    end
  end

  def hydrate_group_permissions(group_permission)
    # If order is given, read (search) is assumed, but this isn't always reflected in the data
    # so we'll create that data here
    group_permission.fetch('permissions', []) | ['read'] if group_permission.fetch('permissions', []).include?('order')

    # Ignore any other permissions that could be in this value from legacy data
    group_permission['permissions'].delete_if { |permission| !%w(read order).include?(permission) }
  end

  # CMR requires that these values be as primitive values instead of string
  # so we'll convert the few values we need to before sending to the API
  def hydrate_constraint_values(constraints)
    constraints.each do |key, val|
      constraints[key] = if val == 'true'
                           true
                         else
                           val.to_f
                         end
    end
  end

  def get_groups
    all_groups = []

    filters = {
      'provider'  => current_user.provider_id,
      'page_num'  => 1,
      'page_size' => 50
    }

    # get groups for provider AND System Groups if user has Read permissions on System Groups
    filters['provider'] = [current_user.provider_id, 'CMR'] if policy(:system_group).read?

    # Retrieve the first page of groups
    groups_response = cmr_client.get_cmr_groups(filters, token)

    # Request groups
    until groups_response.error? || groups_response.body['items'].blank?
      # Add the retrieved groups
      all_groups.concat(groups_response.body['items'])

      # Tests within this controller family mock the response of `get_cmr_groups`
      # which means that the criteria set to break on will never be met and will
      # result in an infinite loop
      break if Rails.env.test?

      # Increment page number
      filters['page_num'] += 1

      # Request the next page
      groups_response = cmr_client.get_cmr_groups(filters, token)
    end

    all_groups
  end

  def groups_for_permissions
    all_groups = get_groups

    all_groups.each do |group|
      group['name'] += ' (SYS)' if check_if_system_group?(group, group['concept_id'])
    end

    @groups = all_groups.map { |group| [group['name'], group['concept_id']] }

    # add options for registered users and guest users
    @groups.unshift(['All Registered Users', 'registered'])
    @groups.unshift(['All Guest Users', 'guest'])
  end

  def construct_request_object(provider)
    collection_applicable = params[:collection_applicable] == 'true'

    granule_applicable = params[:granule_applicable] == 'true'

    req_obj = {
      'group_permissions' => [],
      'catalog_item_identity' => {
        'name'                  => params[:permission_name],
        'provider_id'           => provider,
        'granule_applicable'    => granule_applicable,
        'collection_applicable' => collection_applicable
      }
    }

    collection_access_constraints = params[:collection_access_value].delete_if { |_key, value| value.blank? }

    if params.fetch(:collectionsChooser_toList, []).any? || params.fetch(:hidden_collections, []).any? || collection_access_constraints.any?
      # Create an empty hash for the nested key that we'll populate below
      req_obj['catalog_item_identity']['collection_identifier'] = {}

      # Selected collections as well as hidden collections
      selected_collections = params.fetch(:collectionsChooser_toList, []) + params.fetch(:hidden_collections, [])

      if selected_collections.any?
        req_obj['catalog_item_identity']['collection_identifier'] = {
          'entry_titles' => selected_collections
        }
      end

      if collection_access_constraints.any?
        req_obj['catalog_item_identity']['collection_identifier']['access_value'] = hydrate_constraint_values(collection_access_constraints)
      end
    end

    if granule_applicable
      granule_access_constraints = params[:granule_access_value].delete_if { |_key, value| value.blank? }

      if granule_access_constraints.any?
        req_obj['catalog_item_identity']['granule_identifier'] = {
          'access_value' => hydrate_constraint_values(granule_access_constraints)
        }
      end
    end

    search_groups = params[:search_groups] || []
    search_and_order_groups = params[:search_and_order_groups] || []

    # Append any groups with search access that the user does not have access to see
    search_groups += params.fetch(:hidden_search_groups, [])

    # Append any groups with search and order access that the user does not have access to see
    search_and_order_groups += params.fetch(:hidden_search_and_order_groups, [])

    search_groups.each do |search_group|
      # we are preventing a user from selecting a group for both search AND search & order
      # if that still happens, we should only keep the group as a search_and_order_group in the ACL
      next if search_and_order_groups.include?(search_group)

      req_obj['group_permissions'] << construct_request_group_permission(search_group, %w(read)) # aka 'search'
    end

    search_and_order_groups.each do |search_and_order_group|
      # PUMP allows for other permissions (Create, Update, Delete) but we don't use them
      # because those permissions are actually controlled by INGEST_MANAGEMENT_ACL
      req_obj['group_permissions'] << construct_request_group_permission(search_and_order_group, %w(read order)) # aka 'search and order'
    end

    req_obj
  end

  # Groups can refer to actual groups or the user type `Guest Users` and `Registers Users`
  # so we need to ensure that we distinguish between the two. When using the pseudo
  # groups mentioned the key for the group permission is `user_type` vs the
  # standard `group_id`
  def construct_request_group_permission(group_id, permissions)
    group_permission = {
      'permissions' => permissions
    }

    if %w(guest registered).include?(group_id)
      group_permission['user_type'] = group_id
    else
      group_permission['group_id'] = group_id
    end

    group_permission
  end
end
