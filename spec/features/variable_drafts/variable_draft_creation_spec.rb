require 'rails_helper'

describe 'Variable Draft creation', reset_provider: true, js: true do
  before do
    login
  end

  context 'when creating a new variable draft from scratch' do
    before do
      visit new_variable_draft_path
    end

    it 'creates a new blank variable draft' do
      within '.eui-breadcrumbs' do
        expect(page).to have_content('Variable Drafts')
        expect(page).to have_content('New')
      end
    end

    it 'renders the "Variable Information" form' do
      within '.umm-form fieldset h3' do
        expect(page).to have_content('Variable Information')
      end
    end

    context 'when saving data into the variable draft' do
      before do
        fill_in 'Name', with: 'test var draft'

        within '.nav-top' do
          click_on 'Done'
        end

        click_on 'Yes'
      end

      it 'displays a confirmation message' do
        expect(page).to have_content('Variable Draft Created Successfully!')
      end
    end
  end
end
