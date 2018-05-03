require 'rails_helper'

describe 'Service Identification Form', js: true do
  before do
    login
    draft = create(:empty_service_draft, user: User.where(urs_uid: 'testuser').first)
    visit edit_service_draft_path(draft, 'service_identification')
    click_on 'Expand All'
  end

  context 'when submitting the form' do
    before do
      select 'Reviewed', from: 'Quality Flag'
      fill_in 'Traceability', with: 'traceability'
      fill_in 'Lineage', with: 'lineage'

      fill_in 'service_draft_draft_access_constraints', with: 'access constraint 1'

      fill_in 'service_draft_draft_use_constraints', with: 'use constraint 1'

      within '.nav-top' do
        click_on 'Save'
      end
      click_on 'Expand All'
    end

    it 'displays a confirmation message' do
      expect(page).to have_content('Service Draft Updated Successfully!')
    end

    context 'when viewing the form' do
      include_examples 'Service Identification Form'
    end
  end
end
