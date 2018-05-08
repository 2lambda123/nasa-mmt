module Cmr
  class UrsClient < BaseClient
    def urs_login_path(callback_url = ENV['urs_callback_url'])
      "#{@root}/oauth/authorize?client_id=#{@client_id}&redirect_uri=#{callback_url}&response_type=code"
    end

    def get_oauth_tokens(auth_code, callback_url = ENV['urs_callback_url'])
      post("/oauth/token?grant_type=authorization_code&code=#{auth_code}&redirect_uri=#{callback_url}", {})
    end

    def refresh_token(refresh_token)
      post("/oauth/token?grant_type=refresh_token&refresh_token=#{refresh_token}", {})
    end

    def get_profile(endpoint, token)
      get(endpoint, { client_id: @client_id }, 'Authorization' => "Bearer #{token}")
    end

    def get_urs_users(uids)
      # Ensures a consistent query string for VCR
      uids.sort! if Rails.env.test?

      client_token = get_client_token
      get('/api/users', { uids: uids }, 'Authorization' => "Bearer #{client_token}")
    end

    def search_urs_users(query)
      client_token = get_client_token
      get('/api/users', { search: query }, 'Authorization' => "Bearer #{client_token}")
    end

    def get_urs_uid_from_nams_auid(auid)
      client_token = get_client_token
      response = get("/api/users/user_by_nams_auid/#{auid}", {}, 'Authorization' => "Bearer #{client_token}")
      # Rails.logger.info "urs uid from auid response: #{response.inspect}"
      response
    end

    # TODO find a more appropriate place to put this method
    def get_keep_alive
      get('https://apps.launchpad-sbx.nasa.gov/icam/api/sm/v1/keepalive', {}, 'Origin' => Figaro.env.SAML_SP_ISSUER_BASE) # get(url, params = {}, headers = {})
    end

    def get_launchpad_healthcheck
      get('https://apps.launchpad-sbx.nasa.gov/healthcheck')
    end

    protected

    def get_client_token
      # URS API says that the client token expires in 3600 (1 hr)
      # so cache token for one hour, and if needed will run request again
      client_access = Rails.cache.fetch('client_token', expires_in: 55.minutes) do
        post('/oauth/token?grant_type=client_credentials', {})
      end

      if client_access.success?
        client_access_token = client_access.body['access_token']
      else
        # Log error message
        Rails.logger.error("Client Token Request Error: #{client_access.inspect}")
      end

      client_access_token
    end

    def build_connection
      super.tap do |conn|
        conn.basic_auth(ENV['urs_username'], ENV['urs_password'])
      end
    end
  end
end
