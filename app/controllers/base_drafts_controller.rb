# :nodoc:
class BaseDraftsController < DraftsController
  before_action :add_top_level_breadcrumbs
  before_action :set_forms, only: :new
  before_action :set_resource, only: [:show, :edit, :update, :destroy]

  def index
    resources = policy_scope(resource_class).order('updated_at DESC').page(params[:page]).per(RESULTS_PER_PAGE)

    plural_resource = "@#{plural_resource_name}"
    instance_variable_set(plural_resource, resources)
  end

  def show
    if params[:not_authorized_request_params]
      @not_authorized_request = params[:not_authorized_request_params]
    else
      authorize get_resource
    end

    add_breadcrumb breadcrumb_name(get_resource.draft, resource_name), send("#{resource_name}_path", get_resource)
  end

  def new
    set_resource(resource_class.new(provider_id: current_user.provider_id, user: current_user, draft: {}))

    authorize get_resource

    add_breadcrumb 'New', send("new_#{resource_name}_path")
  end

  def edit
    authorize get_resource

    add_breadcrumb breadcrumb_name(get_resource.draft, resource_name), send("#{resource_name}_path", get_resource)

    add_breadcrumb @json_form.get_form(@current_form).title, send("edit_#{resource_name}_path", get_resource, @current_form)
  end

  def create
    set_resource(resource_class.new(provider_id: current_user.provider_id, user: current_user, draft: {}))

    authorize get_resource

    set_form

    draft = @json_form.sanitize_form_input(resource_params, params[:form])

    get_resource.draft = draft['draft']

    if get_resource.save
      # Successful flash message
      flash[:success] = I18n.t("controllers.draft.#{plural_resource_name}.create.flash.success")

      # TODO: Prevent this piece of code from being duplicated
      case params[:commit]
      when 'Done'
        redirect_to send("#{resource_name}_path", get_resource)
      when 'Previous'
        # Determine next form to go to
        next_form_name = params['previous_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, next_form_name)
      when 'Next'
        # tried to use render to avoid another request, but could not get form name in url even with passing in location
        get_resource_form = params['next_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, get_resource_form)
      when 'Save'
        get_current_form = params['current_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, get_current_form)
      else # Jump directly to a form
        next_form_name = params['jump_to_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, next_form_name)
      end
    else
      render 'new'
    end
  end

  def update
    authorize get_resource

    sanitized_params = @json_form.sanitize_form_input(resource_params.dup, params[:form], get_resource.draft)

    if get_resource.update(sanitized_params)
      # Successful flash message
      flash[:success] = I18n.t("controllers.draft.#{plural_resource_name}.update.flash.success")

      # TODO: Prevent this piece of code from being duplicated
      case params[:commit]
      when 'Done'
        redirect_to send("#{resource_name}_path", get_resource)
      when 'Previous'
        # Determine next form to go to
        next_form_name = params['previous_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, next_form_name)
      when 'Next'
        # tried to use render to avoid another request, but could not get form name in url even with passing in location
        get_resource_form = params['next_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, get_resource_form)
      when 'Save'
        get_current_form = params['current_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, get_current_form)
      else # Jump directly to a form
        next_form_name = params['jump_to_section']
        redirect_to send("edit_#{resource_name}_path", get_resource, next_form_name)
      end
    else
      render 'edit'
    end
  end

  def destroy
    authorize get_resource

    get_resource.destroy unless get_resource.new_record?

    Rails.logger.info("Audit Log: Draft #{get_resource.entry_title} was destroyed by #{current_user.urs_uid} in provider: #{current_user.provider_id}")

    respond_to do |format|
      format.html { redirect_to send("#{plural_resource_name}_path"), flash: { success: I18n.t("controllers.draft.#{plural_resource_name}.destroy.flash.success") } }
    end
  end

  private

  # Returns the resource from the created instance variable
  # @return [Object]
  def get_resource
    instance_variable_get("@#{resource_name}")
  end
  helper_method :get_resource

  # Returns the resources from the created instance variable
  # @return [Array]
  def get_resources
    instance_variable_get("@#{plural_resource_name}")
  end
  helper_method :get_resources

  # Returns the allowed parameters for searching
  # Override this method in each API controller
  # to permit additional parameters to search on
  # @return [Hash]
  def query_params
    {}
  end

  # The resource class based on the controller
  # @return [Class]
  def resource_class
    @resource_class ||= resource_name.classify.constantize
  end

  # The singular name for the resource class based on the controller
  # @return [String]
  def resource_name
    @resource_name ||= controller_name.singularize
  end
  helper_method :resource_name

  def plural_resource_name
    resource_name.pluralize
  end
  helper_method :plural_resource_name

  def published_resource_name
    resource_name.gsub('_draft', '')
  end
  helper_method :published_resource_name

  def plural_published_resource_name
    plural_resource_name.gsub('_draft', '')
  end
  helper_method :plural_published_resource_name

  # Only allow a trusted parameter "white list" through.
  # If a single resource is loaded for #create or #update,
  # then the controller for the resource must implement
  # the method "#{resource_name}_params" to limit permitted
  # parameters for the individual model.
  def resource_params
    # @resource_params ||= params
    @resource_params ||= send("#{resource_name}_params")
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_resource(resource = nil)
    resource ||= resource_class.find(params[:id])
    instance_variable_set("@#{resource_name}", resource)
  end

  def add_top_level_breadcrumbs
    add_breadcrumb plural_resource_name.titleize, send("#{plural_resource_name}_path")
  end

  def set_forms
    @forms = resource_class.forms
  end

  # Custom error messaging for Pundit
  def user_not_authorized(exception)
    policy_name = exception.policy.class.to_s.underscore

    if exception.query == 'show?' || exception.query == 'edit?'
      if available_provider?(get_resource.provider_id)
        # no flash message because it will be handled by the show view and params we are passing
        redirect_to send("#{resource_name}_path", get_resource, not_authorized_request_params: request.params)
      else
        flash[:error] = t("#{policy_name}.#{exception.query}", scope: 'pundit', default: :default)

        redirect_to send("manage_#{plural_published_resource_name}_path")
      end
    else
      flash[:error] = t("#{policy_name}.#{exception.query}", scope: 'pundit', default: :default)

      redirect_to send("manage_#{plural_published_resource_name}_path")
    end
  end
end
