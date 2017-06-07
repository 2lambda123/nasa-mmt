# :nodoc:
class GroupsController < ManageCmrController
  include GroupsHelper
  include GroupEndpoints
  include PermissionManagement

  skip_before_filter :is_logged_in, :setup_query, :refresh_urs_if_needed, only: [:urs_search, :provided_urs_users]

  add_breadcrumb 'Groups', :groups_path

  RESULTS_PER_PAGE = 25

  def index
    @filters = params[:filters] || {}

    @member_filter_details = if @filters['member']
                               @filters['options'] = { 'member' => { 'and' => true } }

                               retrieve_urs_users(@filters['member']).map { |m| [urs_user_full_name(m), m['uid']] }
                             else
                               []
                             end

    @filters[:page_size] = RESULTS_PER_PAGE

    # Default the page to 1
    page = params.fetch('page', 1)

    @filters[:page_num] = page.to_i

    groups_response = cmr_client.get_cmr_groups(@filters, token)

    group_list = if groups_response.success?
                   groups_response.body.fetch('items', [])
                 else
                   []
                 end

    @groups = Kaminari.paginate_array(group_list, total_count: groups_response.body.fetch('hits', 0)).page(page).per(RESULTS_PER_PAGE)
  end

  def show
    @concept_id = params[:id]
    group_response = cmr_client.get_group(@concept_id, token)

    if group_response.success?
      @group = group_response.body

      request_group_members(@concept_id)

      set_permissions

      add_breadcrumb @group.fetch('name'), group_path(@concept_id)
    else
      Rails.logger.error("Get Group Error: #{group_response.inspect}")
      redirect_to groups_path, flash: { error: Array.wrap(group_response.body['errors'])[0] }
    end
  end

  def new
    @group = {}

    @members = []

    @is_system_group = false # initially set checkbox to unchecked

    add_breadcrumb 'New', new_group_path
  end

  def create
    @group = group_params
    @is_system_group = params[:system_group]
    @group['provider_id'] = current_user.provider_id unless @is_system_group

    group_creation_response = cmr_client.create_group(@group, token)

    if group_creation_response.success?
      redirect_to group_path(group_creation_response.body.fetch('concept_id', nil)), flash: { success: 'Group was successfully created.' }
    else
      # Log error message
      Rails.logger.error("Group Creation Error: #{group_creation_response.inspect}")
      group_creation_error = Array.wrap(group_creation_response.body['errors'])[0]
      flash[:error] = group_creation_error
      set_previously_selected_members(group_params.fetch('members', []))

      render :new
    end
  end

  def edit
    @concept_id = params[:id]
    group_response = cmr_client.get_group(@concept_id, token)

    if group_response.success?
      @group = group_response.body

      add_breadcrumb @group.fetch('name'), group_path(@concept_id)
      add_breadcrumb 'Edit', edit_group_path(@concept_id)

      @is_system_group = check_if_system_group?(@group, @concept_id)

      group_members_response = cmr_client.get_group_members(@concept_id, token)
      if group_members_response.success?
        group_member_uids = group_members_response.body

        set_previously_selected_members(group_member_uids)
      else
        Rails.logger.error("Group Members Request: #{group_members_response.inspect}")

        error = Array.wrap(group_members_response.body['errors'])[0]
        flash[:error] = error
      end
    else
      Rails.logger.error("Error retrieving group to edit: #{group_response.inspect}")
      redirect_to groups_path, flash: { error: Array.wrap(group_response.body['errors'])[0] }
    end
  end

  def update
    params[:group][:members] ||= []
    @group = group_params

    # Append non authorized users if any were provided
    (@group['members'] << params[:non_authorized_members]).flatten! unless params[:non_authorized_members].blank?

    @is_system_group = params[:system_group] || false

    @group['provider_id'] = current_user.provider_id unless @is_system_group

    update_response = cmr_client.update_group(params[:id], @group, token)

    if update_response.success?
      redirect_to group_path(update_response.body.fetch('concept_id', nil)), flash: { success: 'Group was successfully updated.' }
    else
      Rails.logger.error("Group Update Error: #{update_response.inspect}")

      flash[:error] = Array.wrap(update_response.body['errors'])[0]

      set_previously_selected_members(@group.fetch('members', []))

      render :edit
    end
  end

  def destroy
    concept_id = params[:id]
    delete_group_response = cmr_client.delete_group(concept_id, token)
    if delete_group_response.success?
      redirect_to groups_path, flash: { success: "Group #{params[:name]} successfully deleted." }
    else
      # Log error message
      Rails.logger.error("Group Deletion Error: #{delete_group_response.inspect}")
      redirect_to group_path(concept_id), flash: { error: Array.wrap(delete_group_response.body['errors'])[0] }
    end
  end

  def invite
    user = params['invite']
    manager = {}
    manager['name'] = session[:name]
    manager['email'] = session[:email_address]
    manager['provider'] = current_user.provider_id

    invite = UserInvite.new_invite(user, manager)
    invite.send_invite

    respond_to do |format|
      format.js
    end
  end

  def accept_invite
    @invite = UserInvite.where(token: params[:token]).first

    urs_search_response = cmr_client.search_urs_users(@invite.user_email)

    recipient_uid = urs_search_response.body.fetch('users', []).find { |user| user['email_address'] == @invite.user_email }['uid']

    @added = recipient_uid && @invite.accept_invite(cmr_client, recipient_uid, token)
  end

  def urs_search
    render json: render_users_from_urs(
      search_urs(params[:search])
    )
  end

  def provided_urs_users
    render json: render_users_from_urs(
      retrieve_urs_users(params[:uids])
    )
  end

  private

  def group_params
    params.require(:group).permit(:name, :description, :provider_id, members: [])
  end

  def set_members(group_member_uids)
    @members = if group_member_uids.any?
                 retrieve_urs_users(group_member_uids).sort_by { |member| member['first_name'] }
               else
                 []
               end
               
    @non_authorized_members = group_member_uids.reject { |uid| @members.map { |m| m['uid'] }.include?(uid) }.reject(&:blank?).map { |uid| { 'uid' => uid } }
  end

  def set_previously_selected_members(group_member_uids)
    set_members(group_member_uids)

    @members.map! { |m| [urs_user_full_name(m), m['uid']] }
  end

  def request_group_members(concept_id)
    @members = []

    group_members_response = cmr_client.get_group_members(concept_id, token)

    if group_members_response.success?
      group_member_uids = group_members_response.body

      set_members(group_member_uids)

      (@members << @non_authorized_members).flatten!
    else
      Rails.logger.error("Get Group Members Error: #{group_members_response.inspect}")
    end
  end

  # Get all of the permissions for the current group
  def set_permissions
    # Initialize the permissions array to provide to the view
    @permissions = []
    all_permissions = []

    # Default the params that we'll send to CMR
    permission_params = {
      'permitted_group' => @concept_id,
      'identity_type' => 'catalog_item',
      'include_full_acl' => true,
      page_num: 1,
      page_size: 50
    }

    # Retrieve the first page of permissions
    response = cmr_client.get_permissions(permission_params, token)

    # Request permissions
    until response.error? || response.body['items'].empty?
      # Add the retrieved permissions to our array
      all_permissions.concat(response.body['items'])

      # Increment the page number
      permission_params[:page_num] += 1

      # Request the next page
      response = cmr_client.get_permissions(permission_params, token)
    end

    all_permissions.each do |permission|
      group_permissions = permission.fetch('acl', {}).fetch('group_permissions', [{}])

      # collection permissions should show as associated permission on the group page
      # only if the group has Search or Search & Order permissions (if a group has only Order permissions, that implies having Search)
      if group_permissions.any? { |group_permission| group_permission['group_id'] == @concept_id && (group_permission['permissions'].include?('read') || group_permission['permissions'].include?('order')) }
        @permissions << permission
      end
    end

    @permissions.sort_by! { |permission| permission['name'] }
  end
end
