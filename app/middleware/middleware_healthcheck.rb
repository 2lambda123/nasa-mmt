class MiddlewareHealthcheck
  def initialize(app)
    @app = app
  end

  def call(env)
    Rails.logger.tagged "middleware health check" do
      if env['PATH_INFO'.freeze] == '/status'.freeze
        response = [503, {'Content-Type' => 'application/json'}]

        # checks the database health
        begin
          db_healthy = ActiveRecord::Migrator.current_version != 0
        rescue StandardError => e
          Rails.logger.error "Database error: #{e}"
          db_healthy = false
        end

        # checks the health of launchpad
        cmr_client = Cmr::Client.client_for_environment(Rails.configuration.cmr_env, Rails.configuration.services)
        cmr_client.timeout = 10
        begin
          launchpad_healthy = cmr_client.launchpad_healthcheck.body == 'OK'.freeze
        rescue Faraday::Error::TimeoutError
          Rails.logger.error "Faraday timeout healthcheck error: #{e}"
          launchpad_healthy = false
        rescue Faraday::Error::ConnectionFailed
          Rails.logger.error "Faraday connection failed healthcheck error: #{e}"
          launchpad_healthy = false
        rescue StandardError => e
          Rails.logger.error "Other healthcheck error: #{e.class} #{e}"
          launchpad_healthy = false
        end
        response[2] = ["{\"database\": #{db_healthy}, \"launchpad\": #{launchpad_healthy}}"]

        # If launchpad is disabled then we will not report a 503 error if launchpad still fails
        if db_healthy && (ENV['launchpad_login_required'] != 'true' || launchpad_healthy)
          response[0] = 200
        end
        Rails.logger.info "The Status page returned a #{response[0]} Response:#{response.inspect}"
        response
      else
        @app.call(env)
      end
    end
  end
end
