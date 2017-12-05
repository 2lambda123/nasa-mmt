require 'rails_helper'

describe 'Bulk updating Platforms' do
  before :all do
    _ingest_response, @find_and_remove_concept_response = publish_collection_draft
    _ingest_response, @find_and_update_concept_response = publish_collection_draft
    _ingest_response, @find_and_update_concept_response_2 = publish_collection_draft
  end

  before do
    login

    visit new_bulk_updates_search_path
  end

  context 'when previewing a Find & Remove bulk update', js: true do
    let(:bulk_update_name) { 'Bulk Update Platforms Test Find & Remove 001' }

    before do
      # Search collections
      select 'Entry Title', from: 'Search Field'
      find(:css, "input[id$='query_text']").set(@find_and_remove_concept_response.body['EntryTitle'])
      click_button 'Submit'

      # select search result
      check 'checkall'
      click_on 'Next'

      # Bulk Update form
      fill_in 'bulk_update_name', with: bulk_update_name
      select 'Platforms', from: 'Field to Update'
      select 'Find & Remove', from: 'Update Type'
      fill_in 'Short Name', with: 'SMAP'
      click_on 'Preview'
    end

    it 'displays the preview information' do
      expect(page).to have_content('Preview of New MMT_2 Bulk Update')

      expect(page).to have_content("Name #{bulk_update_name}")
      expect(page).to have_content('Field to Update Platforms')
      expect(page).to have_content('Update Type Find And Remove')
      within '.find-values-preview' do
        expect(page).to have_content('Short Name: SMAP')
      end

      within '.bulk-update-preview-table' do
        expect(page).to have_content(@find_and_remove_concept_response.body['EntryTitle'])
        expect(page).to have_content(@find_and_remove_concept_response.body['ShortName'])
      end
    end

    context 'when submitting the bulk update' do
      before do
        click_on 'Submit'

        # need to wait until the task status is 'COMPLETE'
        task_id = page.current_path.split('/').last
        wait_for_complete_bulk_update(task_id: task_id)

        # Reload the page, because CMR
        page.evaluate_script('window.location.reload()')
      end

      it 'displays the bulk update status page' do
        expect(page).to have_css('h2', text: bulk_update_name)

        within '.eui-info-box' do
          expect(page).to have_content('Status Complete')
          expect(page).to have_content('Field to Update Platforms')
          expect(page).to have_content('Update Type Find And Remove')
        end

        within '.find-values-preview' do
          expect(page).to have_content('Find Values to Remove')
          expect(page).to have_content('Short Name: SMAP')
        end

        # we can't test the time accurately, but we can check the date
        expect(page).to have_content(today_string)
      end

      context 'when viewing the collection' do
        before do
          within '#bulk-update-status-table' do
            click_on @find_and_remove_concept_response.body['EntryTitle']
          end
        end

        it 'does not display the removed platform' do
          within '.platform-cards' do
            expect(page).to have_content('A340-600')
            expect(page).to have_content('Aircraft')

            expect(page).to have_no_content('SMAP')
            expect(page).to have_no_content('Earth Observation Satellites')
          end
        end
      end
    end
  end

  context 'when previewing a Find & Update bulk update that has a long name', js: true do
    let(:bulk_update_name) { 'Bulk Update Platforms Test Find & Update 002' }
    before do
      # Search collections
      select 'Entry Title', from: 'Search Field'
      find(:css, "input[id$='query_text']").set(@find_and_update_concept_response.body['EntryTitle'])
      click_button 'Submit'

      # select search result
      check 'checkall'
      click_on 'Next'

      # Bulk Update form
      fill_in 'bulk_update_name', with: bulk_update_name
      select 'Platforms', from: 'Field to Update'
      select 'Find & Update', from: 'Update Type'
      fill_in 'Short Name', with: 'A340-600'
      # Select new Short Name from Select2
      find('.select2-container .select2-selection').click
      find(:xpath, '//body').find('.select2-dropdown li.select2-results__option', text: 'DMSP 5B/F3', match: :first).click

      click_on 'Preview'
    end

    it 'displays the preview information' do
      expect(page).to have_content('Preview of New MMT_2 Bulk Update')

      expect(page).to have_content("Name #{bulk_update_name}")
      expect(page).to have_content('Field to Update Platforms')
      expect(page).to have_content('Update Type Find And Update')

      # Find Values to Update
      within '.find-values-preview' do
        expect(page).to have_content('Short Name: A340-600')
      end

      # New Values
      within '.new-values-preview' do
        expect(page).to have_content('Type: Earth Observation Satellites')
        expect(page).to have_content('Short Name: DMSP 5B/F3')
        expect(page).to have_content('Long Name: Defense Meteorological Satellite Program-F3')
      end

      within '.bulk-update-preview-table' do
        expect(page).to have_content(@find_and_update_concept_response.body['EntryTitle'])
        expect(page).to have_content(@find_and_update_concept_response.body['ShortName'])
      end
    end

    context 'when submitting the bulk update' do
      before do
        click_on 'Submit'

        # need to wait until the task status is 'COMPLETE'
        task_id = page.current_path.split('/').last
        wait_for_complete_bulk_update(task_id: task_id)

        # Reload the page, because CMR
        page.evaluate_script('window.location.reload()')
      end

      it 'displays the bulk update status page' do
        expect(page).to have_css('h2', text: bulk_update_name)

        within '.eui-info-box' do
          expect(page).to have_content('Status Complete')
          expect(page).to have_content('Field to Update Platforms')
          expect(page).to have_content('Update Type Find And Update')
        end

        within '.find-values-preview' do
          expect(page).to have_content('Find Values to Update')
          expect(page).to have_content('Short Name: A340-600')
        end

        within '.new-values-preview' do
          expect(page).to have_content('New Value')
          expect(page).to have_content('Type: Earth Observation Satellites')
          expect(page).to have_content('Short Name: DMSP 5B/F3')
          expect(page).to have_content('Long Name: Defense Meteorological Satellite Program-F3')
        end

        # we can't test the time accurately, but we can check the date
        expect(page).to have_content(today_string)
      end

      context 'when viewing a draft form of the collection' do
        before do
          within '#bulk-update-status-table' do
            click_on @find_and_update_concept_response.body['EntryTitle']
          end
          click_on 'Edit Collection Record'
          click_on 'Acquisition Information'
          click_on 'Expand All'
        end

        it 'displays the updated platform with a long name' do
          expect(page).to have_content('Type: Earth Observation Satellites')
          expect(page).to have_field('draft_platforms_0_short_name', with: 'DMSP 5B/F3')
          expect(page).to have_field('draft_platforms_0_long_name', with: 'Defense Meteorological Satellite Program-F3')
        end
      end
    end
  end

  context 'when previewing a Find & Update bulk update that does not have a long name', js: true do
    let(:bulk_update_name) { 'Bulk Update Platforms Test Find & Update 003' }
    before do
      # Search collections
      select 'Entry Title', from: 'Search Field'
      find(:css, "input[id$='query_text']").set(@find_and_update_concept_response_2.body['EntryTitle'])
      click_button 'Submit'

      # select search result
      check 'checkall'
      click_on 'Next'

      # Bulk Update form
      fill_in 'bulk_update_name', with: bulk_update_name
      select 'Platforms', from: 'Field to Update'
      select 'Find & Update', from: 'Update Type'
      fill_in 'Short Name', with: 'A340-600'
      # Select new Short Name from Select2
      find('.select2-container .select2-selection').click
      find(:xpath, '//body').find('.select2-dropdown ul.select2-results__options--nested li.select2-results__option', text: 'DIADEM-1D').click

      click_on 'Preview'
    end

    it 'displays the preview information' do
      expect(page).to have_content('Preview of New MMT_2 Bulk Update')

      expect(page).to have_content("Name #{bulk_update_name}")
      expect(page).to have_content('Field to Update Platforms')
      expect(page).to have_content('Update Type Find And Update')

      # Find Values to Update
      within '.find-values-preview' do
        expect(page).to have_content('Short Name: A340-600')
      end

      # New Values
      within '.new-values-preview' do
        expect(page).to have_content('Type: Earth Observation Satellites')
        expect(page).to have_content('Short Name: DIADEM-1D')
        expect(page).to have_content('Long Name:')
      end

      within '.bulk-update-preview-table' do
        expect(page).to have_content(@find_and_update_concept_response_2.body['EntryTitle'])
        expect(page).to have_content(@find_and_update_concept_response_2.body['ShortName'])
      end
    end

    context 'when submitting the bulk update' do
      before do
        click_on 'Submit'

        # need to wait until the task status is 'COMPLETE'
        task_id = page.current_path.split('/').last
        wait_for_complete_bulk_update(task_id: task_id)

        # Reload the page, because CMR
        page.evaluate_script('window.location.reload()')
      end

      it 'displays the bulk update status page' do
        expect(page).to have_css('h2', text: bulk_update_name)

        within '.eui-info-box' do
          expect(page).to have_content('Status Complete')
          expect(page).to have_content('Field to Update Platforms')
          expect(page).to have_content('Update Type Find And Update')
        end

        within '.find-values-preview' do
          expect(page).to have_content('Find Values to Update')
          expect(page).to have_content('Short Name: A340-600')
        end

        within '.new-values-preview' do
          expect(page).to have_content('New Value')
          expect(page).to have_content('Type: Earth Observation Satellites')
          expect(page).to have_content('Short Name: DIADEM-1D')
          expect(page).to have_content('Long Name:')
        end

        # we can't test the time accurately, but we can check the date
        expect(page).to have_content(today_string)
      end

      context 'when viewing a draft form of the collection' do
        before do
          within '#bulk-update-status-table' do
            click_on @find_and_update_concept_response_2.body['EntryTitle']
          end
          click_on 'Edit Collection Record'
          click_on 'Acquisition Information'
          click_on 'Expand All'
        end

        it 'displays the updated platform without a long name' do
          expect(page).to have_content('Type: Earth Observation Satellites')
          expect(page).to have_field('draft_platforms_0_short_name', with: 'DIADEM-1D')
          expect(page).to have_field('draft_platforms_0_long_name', with: '')
        end
      end
    end
  end
end
