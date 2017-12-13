class User < ActiveRecord::Base
  serialize :available_providers, JSON

  has_many :drafts

  def self.from_urs_uid(uid)
    return nil if uid.nil?
    User.find_or_create_by(urs_uid: uid)
  end

  def providers=(providers)
    self.available_providers = providers

    # TODO: If there are multiple, it seems as though it'd be kind to set it to the first?
    self.provider_id = providers.first if providers.size == 1
  end

  def set_available_providers(token = nil)
    cmr_client = Cmr::Client.client_for_environment(Rails.configuration.cmr_env, Rails.configuration.services)

    permission_options = {
      permitted_user: urs_uid,
      target: 'PROVIDER_CONTEXT',
      include_full_acl: true,
      page_size: 2000,
      page_num: 1
    }
    permissions_response = cmr_client.get_permissions(permission_options, token)

    providers = []

    # Request the permissions for the current user
    until permissions_response.error? || permissions_response.body.fetch('items', []).empty?
      # Concatenate this page of providers to the full list
      providers.push(*permissions_response.body.fetch('items', []).map { |permission| permission.fetch('acl', {}).fetch('provider_identity', {})['provider_id'] })

      # Increment the page number
      permission_options[:page_num] += 1

      # Request the next page
      permissions_response = cmr_client.get_permissions(permission_options, token)
    end

    if Rails.env.development?
      # set some default providers for development
      providers = %w(MMT_1 MMT_2 LARC SEDAC)
    end
    self.providers = providers

    # Reset provider, unless the current provider is still valid
    self.provider_id = nil unless providers.include?(self.provider_id)

    Rails.logger.info "Available providers for #{urs_uid}: #{providers}"

    save
  end
end
