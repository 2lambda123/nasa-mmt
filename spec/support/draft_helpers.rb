module Helpers
  module DraftHelpers
    def output_schema_validation(draft)
      schema = 'lib/assets/schemas/umm-c-json-schema.json'
      JSON::Validator.fully_validate(schema, draft).each do |error|
        puts error
      end
    end

    def create_new_draft
      visit '/manage_metadata'
      choose 'New Collection Record'
      click_on 'Create Record'
    end

    # Publishes a draft and returns the new created collection as well as the most recent draft
    def publish_draft(revision_count: 1, include_new_draft: false, provider_id: 'MMT_2', native_id: nil, modified_date: nil, short_name: nil, entry_title: nil, version: nil)
      ActiveSupport::Notifications.instrument 'mmt.performance', activity: 'Helpers::DraftHelpers#publish_draft' do
        user = User.where(urs_uid: 'testuser').first

        # Only return te most recent concept
        ingest_response = nil
        revision_count.times do
          # Default draft attributes
          draft_attributes = {
            user: user,
            provider_id: provider_id,
            native_id: native_id || Faker::Crypto.md5
          }

          # Conditional additions to the draft attributes
          draft_attributes[:draft_short_name] = short_name unless short_name.nil?
          draft_attributes[:draft_entry_title] = entry_title unless entry_title.nil?
          draft_attributes[:version] = version unless version.nil?

          # Create a new draft with the provided attributes
          # NOTE: We don't save the draft object, there is no reason to hit the database
          # here knowing that we're going to delete it as soon as it's published anyway
          draft = build(:full_draft, draft_attributes)

          # Adds metadata dates (this method saves the object)
          draft.add_metadata_dates(date: modified_date, save_record: false) unless modified_date.nil?

          ingest_response = cmr_client.ingest_collection(draft.draft.to_json, draft.provider_id, draft.native_id, 'token')

          # We need the native id of the draft to create another draft below
          native_id = draft.native_id

          # Draft has been published, destroy it
          # draft.destroy
        end

        raise Array.wrap(ingest_response.body['errors']).join(' /// ') unless ingest_response.success?

        # Synchronous way of waiting for CMR to complete the ingest work
        wait_for_cmr

        # Retrieve the concept from CMR so that we can create a new draft, if test requires it
        concept_id = ingest_response.body['concept-id']
        revision_id = ingest_response.body['revision-id']
        content_type = "application/#{Rails.configuration.umm_version}; charset=utf-8"
        concept_response = cmr_client.get_concept(concept_id, 'token', content_type, revision_id)

        raise Array.wrap(concept_response.body['errors']).join(' /// ') if concept_response.body.key?('errors')

        # If the test needs an unpublished draft as well, we'll create it and return it here
        if include_new_draft
          # Create a new draft (same as editing a collection)
          Draft.create_from_collection(concept_response.body, user, native_id)
        end

        return [ingest_response.body, concept_response]
      end
    end

    # Open any accordions on the page, but try again if they aren't open
    # Also try again if there are no accordions on the page (page hasn't loaded yet)
    # http://stackoverflow.com/a/28174679
    def open_accordions
      Timeout.timeout(Capybara.default_max_wait_time) do
        loop do
          do_open_accordions
          return if accordions_open?
          # puts 'sleeping'
          # sleep 2
        end
      end
    rescue Timeout::Error
      raise 'Failed to open the accordions on the page'
    end

    def do_open_accordions
      script = "$('.eui-accordion.is-closed').removeClass('is-closed');"
      page.execute_script script
    end

    def accordions_open?
      # Are there accordions on the page, and are they open?
      expect(page).to have_css('.eui-accordion')
      expect(page).to have_no_css('.eui-accordion.is-closed')

      # are active jQuery requests finished?
      expect(page.evaluate_script('jQuery.active').zero?).to be true
    rescue
      false
    end

    def add_data_center(value)
      find('.select2-container .select2-selection').click
      find(:xpath, '//body').find('.select2-dropdown li.select2-results__option', text: value).click
    end

    def add_person
      fill_in 'First Name', with: 'First Name'
      fill_in 'Middle Name', with: 'Middle Name'
      fill_in 'Last Name', with: 'Last Name'
    end

    def add_contact_information(type = nil, single = nil, button_type = nil)
      within '.contact-information' do
        fill_in 'Service Hours', with: '9-5, M-F'
        fill_in 'Contact Instructions', with: 'Email only'
        add_contact_mechanisms
        add_addresses
        add_related_urls("RelatedUrlFieldsHelper::#{type.upcase}_FORM".safe_constantize, single, button_type)
      end
    end

    def add_dates
      within '.multiple.dates' do
        select 'Creation', from: 'Type'
        fill_in 'Date', with: '2015-07-01T00:00:00Z'

        click_on 'Add another Date'
        within '.multiple-item-1' do
          select 'Future Review', from: 'Type'
          fill_in 'Date', with: '2015-07-02T00:00:00Z'
        end
      end
    end

    def add_metadata_dates
      within '.multiple.dates' do
        select 'Future Review', from: 'Type'
        fill_in 'Date', with: '2015-07-01T00:00:00Z'

        click_on 'Add another Date'
        within '.multiple-item-1' do
          select 'Planned Deletion', from: 'Type'
          fill_in 'Date', with: '2015-07-02T00:00:00Z'
        end
      end
    end

    def add_contact_mechanisms
      within '.multiple.contact-mechanisms' do
        select 'Email', from: 'Type'
        fill_in 'Value', with: 'example@example.com'
        click_on 'Add another Contact Mechanism'
        within '.multiple-item-1' do
          select 'Email', from: 'Type'
          fill_in 'Value', with: 'example2@example.com'
        end
      end
    end

    def add_addresses
      within '.multiple.addresses' do
        fill_in 'Street Address - Line 1', with: '300 E Street Southwest'
        fill_in 'Street Address - Line 2', with: 'Room 203'
        fill_in 'Street Address - Line 3', with: 'Address line 3'
        select 'United States', from: 'Country'
        fill_in 'City', with: 'Washington'
        select 'District of Columbia', from: 'State / Province'
        fill_in 'Postal Code', with: '20546'
        click_on 'Add another Address'
        within '.multiple-item.eui-accordion.multiple-item-1' do
          fill_in 'Street Address - Line 1', with: '8800 Greenbelt Road'
          select 'United States', from: 'Country'
          fill_in 'City', with: 'Greenbelt'
          select 'Maryland', from: 'State / Province'
          fill_in 'Postal Code', with: '20771'
        end
      end
    end

    def add_related_urls(type, single = nil, button_type = nil)
      within "#{'.multiple' unless single}.related-url#{'s' unless single}" do
        if type.include? 'title'
          fill_in 'Title', with: 'Example Title'
        end
        if type.include? 'description'
          fill_in 'Description', with: 'Example Description'
        end

        if type.include? 'relation'
          fill_in 'Relation', with: 'Example Relation'
          all('input.relation').last.set('Example Relation 2')
        end

        if type.include? 'urls'
          within '.multiple.urls' do
            within '.multiple-item-0' do
              find('.url').set 'http://example.com'
              click_on 'Add another URL'
            end
            within '.multiple-item-1' do
              find('.url').set 'http://another-example.com'
            end
          end
        end

        if type.include? 'mime_type'
          select 'text/html', from: 'Mime Type'
        end

        if type.include? 'file_size'
          within '.file-size' do
            fill_in 'Size', with: '42'
            select 'MB', from: 'Unit'
          end
        end

        unless single
          button_title = 'Related URL'
          button_title = 'Distribution URL' if type == RelatedUrlFieldsHelper::DISTRIBUTION_FORM
          button_type += ' ' unless button_type.nil?
          # Add another RelatedUrl
          click_on "Add another #{button_type}#{button_title}"

          if type.include? 'urls'
            within '.multiple-item-1' do
              within '.multiple.urls' do
                within '.multiple-item-0' do
                  find('.url').set 'http://example.com/1'
                end
              end
            end
          end
        end
      end
    end

    def add_collection_citations
      within '.multiple.collection-citations' do
        fill_in 'Version', with: 'v1'
        fill_in 'draft_collection_citations_0_title', with: 'Citation title' # Title
        fill_in 'Creator', with: 'Citation creator'
        fill_in 'Editor', with: 'Citation editor'
        fill_in 'Series Name', with: 'Citation series name'
        fill_in 'Release Date', with: '2015-07-01T00:00:00Z'
        fill_in 'Release Place', with: 'Citation release place'
        fill_in 'Publisher', with: 'Citation publisher'
        fill_in 'Issue Identification', with: 'Citation issue identification'
        fill_in 'Data Presentation Form', with: 'Citation data presentation form'
        fill_in 'Other Citation Details', with: 'Citation other details'
        fill_in 'DOI', with: 'Citation DOI'
        fill_in 'Authority', with: 'Citation DOI Authority'
        add_related_urls(RelatedUrlFieldsHelper::COLLECTION_CITATION_FORM, true)

        click_on 'Add another Collection Citation'
        within '.multiple-item-1' do
          fill_in 'Version', with: 'v2'
          fill_in 'draft_collection_citations_1_title', with: 'Citation title 1' # Title
          fill_in 'Creator', with: 'Citation creator 1'
          add_related_urls(RelatedUrlFieldsHelper::COLLECTION_CITATION_FORM, true)
        end
      end
    end

    def add_metadata_association
      within '.multiple.metadata-associations' do
        select 'Science Associated', from: 'Type'
        fill_in 'Description', with: 'Metadata association description'
        fill_in 'Entry Id', with: '12345'
        click_on 'Add another Metadata Association'
        within '.multiple-item-1' do
          select 'Larger Citation Works', from: 'Type'
          fill_in 'Entry Id', with: '123abc'
        end
      end
    end

    def add_publication_reference
      within '.multiple.publication-references' do
        fill_in 'draft_publication_references_0_title', with: 'Publication reference title' # Title
        fill_in 'Publisher', with: 'Publication reference publisher'
        fill_in 'DOI', with: 'Publication reference DOI'
        fill_in 'Authority', with: 'Publication reference authority'
        fill_in 'Author', with: 'Publication reference author'
        fill_in 'Publication Date', with: '2015-07-01T00:00:00Z'
        fill_in 'Series', with: 'Publication reference series'
        fill_in 'Edition', with: 'Publication reference edition'
        fill_in 'Volume', with: 'Publication reference volume'
        fill_in 'Issue', with: 'Publication reference issue'
        fill_in 'Report Number', with: 'Publication reference report number'
        fill_in 'Publication Place', with: 'Publication reference publication place'
        fill_in 'Pages', with: 'Publication reference pages'
        fill_in 'ISBN', with: '1234567890123'
        fill_in 'Other Reference Details', with: 'Publication reference details'
        add_related_urls(RelatedUrlFieldsHelper::PUBLICATION_REFERENCE_FORM, true)

        click_on 'Add another Publication Reference'
        within '.multiple-item-1' do
          fill_in 'draft_publication_references_1_title', with: 'Publication reference title 1' # Title
          fill_in 'ISBN', with: '9876543210987'
        end
      end
    end

    def add_platforms
      within '.multiple.platforms' do
        select 'Aircraft', from: 'Type'
        fill_in 'draft_platforms_0_short_name', with: 'Platform short name'
        fill_in 'draft_platforms_0_long_name', with: 'Platform long name'
        add_characteristics
        add_instruments

        click_on 'Add another Platform'
        within '.multiple-item-1' do
          fill_in 'draft_platforms_1_short_name', with: 'Platform short name 1'
          add_instruments('1')
        end
      end
    end

    def add_characteristics
      within first('.multiple.characteristics') do
        fill_in 'Name', with: 'Characteristics name'
        fill_in 'Description', with: 'Characteristics description'
        fill_in 'Value', with: 'Characteristics value'
        fill_in 'Unit', with: 'unit'
        fill_in 'Data Type', with: 'Characteristics data type'

        click_on 'Add another Characteristic'
        within '.multiple-item-1' do
          fill_in 'Name', with: 'Characteristics name 1'
          fill_in 'Description', with: 'Characteristics description 1'
          fill_in 'Value', with: 'Characteristics value 1'
          fill_in 'Unit', with: 'unit 1'
          fill_in 'Data Type', with: 'Characteristics data type 1'
        end
      end
    end

    def add_instruments(platform = '0')
      within '.multiple.instruments' do
        fill_in "draft_platforms_#{platform}_instruments_0_short_name", with: 'Instrument short name'
        fill_in "draft_platforms_#{platform}_instruments_0_long_name", with: 'Instrument long name'
        fill_in "draft_platforms_#{platform}_instruments_0_technique", with: 'Instrument technique'
        fill_in 'Number Of Sensors', with: 2468
        within '.multiple.operational-modes' do
          within '.multiple-item-0' do
            find('.operational-mode').set 'Instrument mode 1'
            click_on 'Add another Operational Mode'
          end
          within '.multiple-item-1' do
            find('.operational-mode').set 'Instrument mode 2'
          end
        end

        add_characteristics
        add_sensors(platform)

        click_on 'Add another Instrument'
        within '.multiple-item-1' do
          fill_in "draft_platforms_#{platform}_instruments_1_short_name", with: 'Instrument short name 1'
        end
      end
    end

    def add_sensors(platform)
      within '.multiple.sensors' do
        fill_in "draft_platforms_#{platform}_instruments_0_sensors_0_short_name", with: 'Sensor short name'
        fill_in "draft_platforms_#{platform}_instruments_0_sensors_0_long_name", with: 'Sensor long name'
        fill_in "draft_platforms_#{platform}_instruments_0_sensors_0_technique", with: 'Sensor technique'
        add_characteristics

        click_on 'Add another Sensor'
        within '.multiple-item-1' do
          fill_in "draft_platforms_#{platform}_instruments_0_sensors_1_short_name", with: 'Sensor short name 1'
        end
      end
    end

    def add_points
      script = '$(".geometry-picker.points").click();'
      page.execute_script script

      within first('.multiple.points') do
        fill_in 'Longitude', with: '-77.047878'
        fill_in 'Latitude', with: '38.805407'
        click_on 'Add another Point'
        within '.multiple-item-1' do
          fill_in 'Longitude', with: '-76.9284587'
          fill_in 'Latitude', with: '38.968602'
        end
      end
    end

    def add_bounding_rectangles
      script = '$(".geometry-picker.bounding-rectangles").click();'
      page.execute_script script

      within first('.multiple.bounding-rectangles') do
        fill_in 'West', with: '-180.0'
        fill_in 'North', with: '90.0'
        fill_in 'East', with: '180.0'
        fill_in 'South', with: '-90.0'
        click_on 'Add another Bounding Rectangle'
        within '.multiple-item-1' do
          fill_in 'West', with: '-96.9284587'
          fill_in 'North', with: '58.968602'
          fill_in 'East', with: '-56.9284587'
          fill_in 'South', with: '18.968602'
        end
      end
    end

    def add_g_polygons
      script = '$(".geometry-picker.g-polygons").click();'
      page.execute_script script

      within first('.multiple.g-polygons') do
        within '.boundary .multiple.points' do
          fill_in 'Longitude', with: '10.0'
          fill_in 'Latitude', with: '10.0'
          click_on 'Add another Point'
          within '.multiple-item-1' do
            fill_in 'Longitude', with: '-10.0'
            fill_in 'Latitude', with: '10.0'
          end
          click_on 'Add another Point'
          within '.multiple-item-2' do
            fill_in 'Longitude', with: '-10.0'
            fill_in 'Latitude', with: '-10.0'
          end
          click_on 'Add another Point'
          within '.multiple-item-3' do
            fill_in 'Longitude', with: '10.0'
            fill_in 'Latitude', with: '-10.0'
          end
        end
        within '.exclusive-zone' do
          within '.multiple.boundaries' do
            fill_in 'Longitude', with: '5.0'
            fill_in 'Latitude', with: '5.0'
            click_on 'Add another Point'
            within '.multiple-item-1' do
              fill_in 'Longitude', with: '-5.0'
              fill_in 'Latitude', with: '5.0'
            end
            click_on 'Add another Point'
            within '.multiple-item-2' do
              fill_in 'Longitude', with: '-5.0'
              fill_in 'Latitude', with: '-5.0'
            end
            click_on 'Add another Point'
            within '.multiple-item-3' do
              fill_in 'Longitude', with: '5.0'
              fill_in 'Latitude', with: '-5.0'
            end
          end
        end

        click_on 'Add another G Polygon'
        within all('.multiple-item-1').last do
          within '.boundary .multiple.points' do
            fill_in 'Longitude', with: '38.98828125'
            fill_in 'Latitude', with: '-77.044921875'
            click_on 'Add another Point'
            within '.multiple-item-1' do
              fill_in 'Longitude', with: '38.935546875'
              fill_in 'Latitude', with: '-77.1240234375'
            end
            click_on 'Add another Point'
            within '.multiple-item-2' do
              fill_in 'Longitude', with: '38.81689453125'
              fill_in 'Latitude', with: '-77.02734375'
            end
            click_on 'Add another Point'
            within '.multiple-item-3' do
              fill_in 'Longitude', with: '38.900390625'
              fill_in 'Latitude', with: '-76.9130859375'
            end
          end
        end
      end
    end

    def add_lines
      script = '$(".geometry-picker.lines").click();'
      page.execute_script script

      within first('.multiple.lines') do
        within '.multiple.points' do
          fill_in 'Longitude', with: '24.0'
          fill_in 'Latitude', with: '24.0'
          click_on 'Add another Point'
          within '.multiple-item-1' do
            fill_in 'Longitude', with: '26.0'
            fill_in 'Latitude', with: '26.0'
          end
        end
        click_on 'Add another Line'
        within all('.multiple-item-1').last do
          within '.multiple.points' do
            fill_in 'Longitude', with: '24.0'
            fill_in 'Latitude', with: '26.0'
            click_on 'Add another Point'
            within '.multiple-item-1' do
              fill_in 'Longitude', with: '26.0'
              fill_in 'Latitude', with: '24.0'
            end
          end
        end
      end
    end

    def upload_shapefile(path)
      # Set ID for tests and remove styles that hide the input
      script = "$('.dz-hidden-input').attr('id', 'shapefile').attr('style', '');"
      page.execute_script(script)

      begin
        attach_file('shapefile', Rails.root.join(path))
        wait_for_ajax
      rescue Capybara::Poltergeist::ObsoleteNode
        nil
      end
    end

    def add_science_keywords
      choose_keyword 'EARTH SCIENCE SERVICES'
      choose_keyword 'DATA ANALYSIS AND VISUALIZATION'
      choose_keyword 'GEOGRAPHIC INFORMATION SYSTEMS'
      click_on 'Add Keyword'

      choose_keyword 'EARTH SCIENCE SERVICES'
      choose_keyword 'DATA ANALYSIS AND VISUALIZATION'
      choose_keyword 'GEOGRAPHIC INFORMATION SYSTEMS'
      choose_keyword 'MOBILE GEOGRAPHIC INFORMATION SYSTEMS'
      choose_keyword 'DESKTOP GEOGRAPHIC INFORMATION SYSTEMS'
      click_on 'Add Keyword'
    end


    def add_science_keywords_suggestion
      choose_keyword 'EARTH SCIENCE SERVICES'
      choose_keyword 'DATA ANALYSIS AND VISUALIZATION'
      choose_keyword 'GEOGRAPHIC INFORMATION SYSTEMS'

      find('#science-keyword-search').set('mobile')
      find('#science-keyword-search').click()
      find('.tt-open').click()
    end


    def add_location_keywords
      choose_keyword 'GEOGRAPHIC REGION'
      choose_keyword 'ARCTIC'
      click_on 'Add Keyword'

      choose_keyword 'OCEAN'
      choose_keyword 'ATLANTIC OCEAN'
      choose_keyword 'NORTH ATLANTIC OCEAN'
      choose_keyword 'BALTIC SEA'
      click_on 'Add Keyword'
    end

    def choose_keyword(text)
      script = "$('.eui-item-list-pane li.item:contains(#{text}) > a').click()"
      page.execute_script(script)
    end
  end
end
