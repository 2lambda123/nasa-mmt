require 'rails_helper'

describe 'Variable Search Results sorting', reset_provider: true, js: true do
  context 'when sorting search variables results' do
    before :all do
      publish_variable_draft(name: 'First!')
      sleep 1
      publish_variable_draft(name: '000_Adder Var Name')
      publish_variable_draft(name: 'Zebra Var Name')

      publish_variable_draft(name: "Larc Sorting Test Var #{Faker::Number.number(6)}", provider_id: 'LARC')
      publish_variable_draft(name: "Sedac Sorting Test Var #{Faker::Number.number(6)}", provider_id: 'SEDAC')

      publish_variable_draft(long_name: '000_Agouti Var Long Name')
      publish_variable_draft(long_name: 'Zebra Var Long Name')
      sleep 1
      publish_variable_draft(name: 'Last!')
    end

    before do
      login

      visit manage_variables_path

      click_on 'Search Variables'
    end

    context 'when sorting by Name' do
      before do
        click_on 'Sort by Name Asc'
      end

      it 'displays the correct search param' do
        expect(page).to have_collection_search_query(nil, 'Sort Key: Name Asc')
      end

      it 'sorts the result by Name Asc' do
        within '#search-results tbody tr:nth-child(1)' do
          expect(page).to have_content('000_Adder Var Name')
        end
      end

      context 'when sorting again' do
        before do
          click_on 'Sort by Name Desc'
        end

        it 'displays the correct search param' do
          expect(page).to have_collection_search_query(nil, 'Sort Key: Name Desc')
        end

        it 'sorts the results by Name Desc' do
          within '#search-results tbody tr:nth-child(1)' do
            expect(page).to have_content('Zebra Var Name')
          end
        end
      end
    end

    context 'when sorting by Long Name' do
      before do
        click_on 'Sort by Long Name Asc'
      end

      it 'displays the correct search param' do
        expect(page).to have_collection_search_query(nil, 'Sort Key: Long Name Asc')
      end

      it 'sorts the result by Long Name Asc' do
        within '#search-results tbody tr:nth-child(1)' do
          expect(page).to have_content('000_Agouti Var Long Name')
        end
      end

      context 'when sorting again' do
        before do
          click_on 'Sort by Long Name Desc'
        end

        it 'displays the correct search param' do
          expect(page).to have_collection_search_query(nil, 'Sort Key: Long Name Desc')
        end

        it 'sorts the results by Long Name Desc' do
          within '#search-results tbody tr:nth-child(1)' do
            expect(page).to have_content('Zebra Var Long Name')
          end
        end
      end
    end

    context 'when sorting by Provider' do
      before do
        click_on 'Sort by Provider Asc'
      end

      it 'displays the correct search param' do
        expect(page).to have_collection_search_query(nil, 'Sort Key: Provider Asc')
      end

      it 'sorts the result by Provider Asc' do
        within '#search-results tbody tr:nth-child(1) td:nth-child(3)' do
          # we are only checking the correct provider, in case other variables
          # have been published to the provider
          expect(page).to have_content('LARC')
        end
      end

      context 'when sorting again' do
        before do
          click_on 'Sort by Provider Desc'
        end

        it 'displays the correct search param' do
          expect(page).to have_collection_search_query(nil, 'Sort Key: Provider Desc')
        end

        it 'sorts the results by Provider Desc' do
          within '#search-results tbody tr:nth-child(1) td:nth-child(3)' do
            # we are only checking the correct provider, in case other variables
            # have been published to the provider
            expect(page).to have_content('SEDAC')
          end
        end
      end
    end

    context 'when sorting by Last Modified' do
      before do
        click_on 'Sort by Last Modified Asc'
      end

      it 'displays the correct search param' do
        expect(page).to have_collection_search_query(nil, 'Sort Key: Last Modified Asc')
      end
      # we cannot deterministically test sorting results by Last Modified Asc
      # because we cannot modify the variable revision date, and there may be
      # variables published to providers that are not removed by reset_provider

      context 'when sorting again' do
        before do
          click_on 'Sort by Last Modified Desc'
        end

        it 'displays the correct search param' do
          expect(page).to have_collection_search_query(nil, 'Sort Key: Last Modified Desc')
        end

        it 'sorts the results by Last Modified Desc' do
          within '#search-results tbody tr:nth-child(1)' do
            expect(page).to have_content('Last!')
          end
        end
      end
    end
  end
end
