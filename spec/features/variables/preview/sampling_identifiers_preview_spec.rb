describe 'Valid Variable Sampling Identifiers Preview', reset_provider: true do
  before do
    login
    collection_ingest_response, _collection_concept_response = publish_collection_draft
    ingest_response, _concept_response = publish_variable_draft(collection_concept_id: collection_ingest_response['concept-id'])
    visit variable_path(ingest_response['concept-id'])
  end

  context 'When examining the Sampling Identifiers section' do
    include_examples 'Variable Sampling Identifiers Full Preview'
  end
end
