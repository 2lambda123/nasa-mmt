require 'rails_helper'

describe 'Delete variable', js: true do
  before :all do
    @ingested_variable_with_associations, _concept_response = publish_variable_draft

    ingested_collection_1, _concept_response = publish_collection_draft
    ingested_collection_2, _concept_response = publish_collection_draft

    create_variable_collection_association(@ingested_variable_with_associations['concept-id'],
                                           ingested_collection_1['concept-id'],
                                           ingested_collection_2['concept-id'])

    @ingested_variable_without_associations, _concept_response = publish_variable_draft

    @ingested_variable_for_delete_messages, _concept_response = publish_variable_draft
  end

  before do
    login
  end

  context 'when viewing a published variable' do
    context 'when the variable has associated collections' do
      before do
        visit variable_path(@ingested_variable_with_associations['concept-id'])
      end

      it 'displays a delete link' do
        expect(page).to have_content('Delete Variable Record')
      end

      context 'when clicking the delete link' do
        before do
          click_on 'Delete Variable Record'
        end

        it 'displays a confirmation modal' do
          expect(page).to have_content('Are you sure you want to delete this variable record?')
        end

        it 'informs the user of the number of collection associations that will also be deleted' do
          # 2 associated collections
          expect(page).to have_content('This variable is associated with 2 collections. Deleting this variable will also delete the collection associations.')
        end

        context 'when clicking Yes' do
          before do
            within '#delete-record-modal' do
              click_on 'Yes'
            end
          end

          it 'redirects to the revisions page and displays a confirmation message' do
            expect(page).to have_content('Revision History')

            expect(page).to have_content('Variable Deleted Successfully!')
          end
        end
      end
    end

    context 'when the variable does not have associated collections' do
      before do
        visit variable_path(@ingested_variable_without_associations['concept-id'])
      end

      it 'displays a delete link' do
        expect(page).to have_content('Delete Variable Record')
      end

      context 'when clicking the delete link' do
        before do
          click_on 'Delete Variable Record'
        end

        it 'displays a confirmation modal' do
          expect(page).to have_content('Are you sure you want to delete this variable record?')
        end

        it 'does not display a message about collection associations that will also be deleted' do
          expect(page).to have_no_content('This variable is associated with')
          expect(page).to have_no_content('collections. Deleting this variable will also delete the collection associations.')
        end

        context 'when clicking Yes' do
          before do
            within '#delete-record-modal' do
              click_on 'Yes'
            end
          end

          it 'redirects to the revisions page and displays a confirmation message' do
            expect(page).to have_content('Revision History')

            expect(page).to have_content('Variable Deleted Successfully!')
          end
        end
      end
    end

    context 'when deleting the variable will fail' do
      before do
        visit variable_path(@ingested_variable_for_delete_messages['concept-id'])
      end

      context 'when CMR provides a message' do
        before do
          error_body = '{"errors": ["You do not have permission to perform that action."]}'
          error_response = Cmr::Response.new(Faraday::Response.new(status: 401, body: JSON.parse(error_body), response_headers: {}))
          allow_any_instance_of(Cmr::CmrClient).to receive(:delete_variable).and_return(error_response)

          click_on 'Delete Variable Record'

          within '#delete-record-modal' do
            click_on 'Yes'
          end
        end

        it 'displays the CMR error message' do
          expect(page).to have_css('.eui-banner--danger', text: 'You do not have permission to perform that action.')
        end
      end

      context 'when CMR does not provide a message' do
        before do
          error_body = '{"message": "useless message"}'
          error_response = Cmr::Response.new(Faraday::Response.new(status: 401, body: JSON.parse(error_body), response_headers: {}))
          allow_any_instance_of(Cmr::CmrClient).to receive(:delete_variable).and_return(error_response)

          click_on 'Delete Variable Record'

          within '#delete-record-modal' do
            click_on 'Yes'
          end
        end

        it 'displays the CMR error message' do
          expect(page).to have_css('.eui-banner--danger', text: 'Variable was not deleted successfully')
        end
      end
    end
  end
end
