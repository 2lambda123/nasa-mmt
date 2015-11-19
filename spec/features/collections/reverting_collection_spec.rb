# MMT-89 MMT-90

require 'rails_helper'

describe 'Reverting to previous collections', js: true, reset_provider: true do
  before do
    login

    draft = create(:full_draft, user: User.where(urs_uid: 'testuser').first)
    visit draft_path(draft)

    click_on 'Publish'
  end

  context 'when the latest revision is a published collection' do
    before do
      # go back to the draft and publish it a second time
      draft = Draft.first
      visit draft_path(draft)
      click_on 'Publish'
      click_on 'Revisions (2)'
    end

    it 'displays the correct phrasing for reverting records' do
      expect(page).to have_content('Revert to this Revision', count: 1)
    end

    context 'when reverting the collection' do
      before do
        click_on 'Revert to this Revision'
        # Accept
        click_on 'Yes'
      end

      it 'displays a confirmation message' do
        expect(page).to have_content('Revision was successfully created')
      end

      it 'displays the new latest revision' do
        expect(page).to have_content('Published', count: 1)
        expect(page).to have_content('Revision View', count: 2)
        expect(page).to have_content('Revert to this Revision', count: 2)
      end
    end
  end

  context 'when the latest revision is a deleted collection' do
    before do
      click_on 'Delete Record'
      # Accept
      click_on 'Yes'
    end

    it 'displays the correct phrasing for reverting records' do
      expect(page).to have_content('Reinstate', count: 1)
    end

    context 'when reverting the collection' do
      before do
        click_on 'Reinstate'
        # Accept
        click_on 'Yes'
      end

      it 'displays a confirmation message' do
        expect(page).to have_content('Revision was successfully created')
      end

      it 'displays the new latest revision' do
        expect(page).to have_content('Published', count: 1)
        expect(page).to have_content('Deleted', count: 1)
        expect(page).to have_content('Revision View', count: 1)
        expect(page).to have_content('Revert to this Revision', count: 1)
      end
    end
  end
end
