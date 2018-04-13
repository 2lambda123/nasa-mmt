module Helpers
  module CmrHelper
    def cmr_client
      Cmr::Client.client_for_environment(Rails.configuration.cmr_env, Rails.configuration.services)
    end

    # Synchronously wait for CMR to complete the ingest work
    def wait_for_cmr
      ActiveSupport::Notifications.instrument 'mmt.performance', activity: 'Helpers::CmrHelper#wait_for_cmr' do
        # Wait for the CMR queue to be empty
        cmr_conn = Faraday.new(url: 'http://localhost:2999')
        cmr_response = cmr_conn.post('message-queue/wait-for-terminal-states')

        Rails.logger.error "Error checking CMR Queue [#{cmr_response.status}] #{cmr_response.body}" unless cmr_response.success?

        # Refresh the ElasticSearch index
        elastic_conn = Faraday.new(url: 'http://localhost:9210')
        elastic_response = elastic_conn.post('_refresh')

        Rails.logger.error "Error refreshing ElasticSearch [#{elastic_response.status}] #{elastic_response.body}" unless elastic_response.success?
      end
    end

    def cmr_success_response(response_body)
      Cmr::Response.new(Faraday::Response.new(status: 200, body: JSON.parse(response_body)))
    end

    def create_provider(provider_name)
      ActiveSupport::Notifications.instrument 'mmt.performance', activity: 'Helpers::CmrHelper#create_provider' do
        cmr_conn = Faraday.new
        provider_response = cmr_conn.post do |req|
          req.url('http://localhost:3002/providers')
          req.headers['Content-Type'] = 'application/json'
          req.headers['Echo-Token'] = 'mock-echo-system-token'

          # CMR expects double quotes in the JSON body
          req.body = "{\"provider-id\": \"#{provider_name}\", \"short-name\": \"#{provider_name}\", \"cmr-only\": true}"
        end

        raise Array.wrap(JSON.parse(provider_response.body)['errors']).join(' /// ') unless provider_response.success?

        wait_for_cmr
      end
    end

    def delete_provider(provider_id)
      ActiveSupport::Notifications.instrument 'mmt.performance', activity: 'Helpers::CmrHelper#delete_provider' do
        cmr_conn = Faraday.new
        provider_response = cmr_conn.delete do |req|
          req.headers['Echo-Token'] = 'mock-echo-system-token'
          req.url("http://localhost:3002/providers/#{provider_id}")
        end

        raise Array.wrap(JSON.parse(provider_response.body)['errors']).join(' /// ') unless provider_response.success?

        wait_for_cmr
      end
    end

    def build_large_json_response(number_of_collections, provider = 'MMT_2')
      response = { hits: number_of_collections, took: 12, items: [] }

      number_of_collections.times do |index|
        response[:items] << build_collection_json(index + 1, provider)
      end

      response.to_json
    end

    def build_collection_json(index, provider)
      {
        'meta' => {
          'revision-id' => 1,
          'deleted' => false,
          'format' => 'application/vnd.nasa.cmr.umm+json',
          'provider-id' => provider,
          'user-id' => 'test_user',
          'native-id' => "mmt_collection_#{index}",
          'concept-id' => "C12#{index.to_s.rjust(8, '0')}-#{provider}",
          'revision-date' => '2016-01-06T21:32:30Z',
          'concept-type' => 'collection'
        },
        'umm' => {
          'entry-title' => 'ipsum',
          'entry-id' => "lorem_#{index}",
          'short-name' => "lorem_#{index}",
          'version-id' => index
        }
      }
    end
  end
end
