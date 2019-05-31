# NOTE: Most tests are being commented out because of preview gem overhaul
# We should keep the tests to ensure everything is being tested, but old
# tests should be removed when final changes are made.

# describe 'Descriptive keywords preview' do
#   context 'when viewing the preview page' do
#     context 'when there is no metadata' do
#       before do
#         login
#         draft = create(:collection_draft, user: User.where(urs_uid: 'testuser').first)
#         visit collection_draft_path(draft)
#       end
#
#       it 'does not display metadata' do
#         expect(page).to have_content('There are no science keywords for this collection.')
#       end
#     end
#
#     context 'when there is metadata' do
#       before do
#         login
#         draft = create(:full_collection_draft, user: User.where(urs_uid: 'testuser').first)
#
#         visit collection_draft_path(draft)
#       end
#
#       it 'displays the metadata' do
#         within 'ul.science-keywords-preview li.science-keywords' do
#           within all('ul.arrow-tag-group-list')[0] do
#             expect(page).to have_content('EARTH SCIENCE ATMOSPHERE ATMOSPHERIC TEMPERATURE SURFACE TEMPERATURE MAXIMUM/MINIMUM TEMPERATURE 24 HOUR MAXIMUM TEMPERATURE', normalize_ws: true)
#           end
#           within all('ul.arrow-tag-group-list')[1] do
#             expect(page).to have_content('EARTH SCIENCE SOLID EARTH ROCKS/MINERALS/CRYSTALS SEDIMENTARY ROCKS SEDIMENTARY ROCK PHYSICAL/OPTICAL PROPERTIES LUMINESCENCE', normalize_ws: true)
#           end
#         end
#
#         within 'div.other-descriptive-keywords-preview' do
#           within 'ul.ancillary-keywords' do
#             expect(page).to have_content('Ancillary keyword 1')
#             expect(page).to have_content('Ancillary keyword 2')
#           end
#
#           within 'ul.iso-topic-categories' do
#             expect(page).to have_content('farming')
#             expect(page).to have_content('climatologyMeteorologyAtmosphere')
#             expect(page).to have_content('health')
#           end
#         end
#
#         within 'ul.additional-attributes-preview' do
#           within 'li.additional-attribute-0' do
#             within '.card-header' do
#               expect(page).to have_content('Attribute 1')
#               expect(page).to have_content('INT')
#             end
#             within '.card-body' do
#               expect(page).to have_content('Description')
#               within '.card-table tbody' do
#                 expect(page).to have_content('Measurement Resolution 1 5 Parameter Units Of Measure Parameter Value Accuracy', normalize_ws: true)
#               end
#               expect(page).to have_content('Value Accuracy Explanation')
#             end
#             within '.card-footer' do
#               expect(page).to have_content('Group')
#               expect(page).to have_content('Updated 2015-09-14')
#             end
#           end
#
#           within 'li.additional-attribute-1' do
#             within '.card-header' do
#               expect(page).to have_content('Attribute 2')
#               expect(page).to have_content('STRING')
#             end
#           end
#         end
#       end
#     end
#   end
# end
