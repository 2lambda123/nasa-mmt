require 'rails_helper'

describe 'Invalid Variable Draft Set Preview' do
  before do
    login
    @draft = create(:invalid_variable_draft, user: User.where(urs_uid: 'testuser').first)
    visit variable_draft_path(@draft)
  end

  context 'When examining the Set section' do
    it 'displays the form title as an edit link' do
      within '#sets-progress' do
        expect(page).to have_link('Sets', href: edit_variable_draft_path(@draft, 'sets'))
      end
    end

    it 'displays the corrent status icon' do
      within '#sets-progress' do
        within '.status' do
          expect(page).to have_content('Sets is incomplete')
        end
      end
    end

    it 'displays no progress indicators for required fields' do
      within '#sets-progress .progress-indicators' do
        expect(page).to have_no_css('.eui-icon.eui-required-o.icon-green')
      end
    end

    it 'displays no progress indicators for non required fields' do
      within '#sets-progress .progress-indicators' do
        expect(page).to have_no_css('.eui-icon.eui-fa-circle.icon-grey')
      end
    end

    it 'displays the correct progress indicators for invalid fields' do
      within '#sets-progress .progress-indicators' do
        expect(page).to have_css('.eui-icon.eui-fa-minus-circle.icon-red.variable_draft_draft_sets')
      end
    end

    it 'displays the stored values correctly within the preview' do
      within '.umm-preview.sets' do
        expect(page).to have_css('.umm-preview-field-container', count: 1)

        within '#variable_draft_draft_sets_preview' do
          expect(page).to have_css('h5', text: 'Sets')
          expect(page).to have_link(nil, href: edit_variable_draft_path(@draft, 'sets', anchor: 'variable_draft_draft_sets'))

          expect(page).to have_css('h6', text: 'Set 1')

          within '#variable_draft_draft_sets_0_name_preview' do
            expect(page).to have_css('h5', text: 'Name')
            expect(page).to have_css('p', text: 'No value for Name provided.')
          end

          within '#variable_draft_draft_sets_0_type_preview' do
            expect(page).to have_css('h5', text: 'Type')
            expect(page).to have_css('p', text: 'No value for Type provided.')
          end

          within '#variable_draft_draft_sets_0_size_preview' do
            expect(page).to have_css('h5', text: 'Size')
            expect(page).to have_css('p', text: 'string')
          end

          within '#variable_draft_draft_sets_0_index_preview' do
            expect(page).to have_css('h5', text: 'Index')
            expect(page).to have_css('p', text: 'string')
          end
        end
      end
    end
  end
end
