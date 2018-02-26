# Groups of assertions use in UMM-S form tests

def contact_groups_assertions
  within '.multiple.contact-groups > .multiple-item-0' do
    expect(page).to have_select('Roles', selected: ['TECHNICAL CONTACT', 'SCIENCE CONTACT'])
    expect(page).to have_field('Group Name', with: 'Group 1')
    expect(page).to have_field('Uuid', with: 'b1837851-91b3-4aa9-8e89-f805fae629c9')
    expect(page).to have_field('Non Service Organization Affiliation', with: 'NonServiceOrganizationAffiliation Group 1')

    contact_information_assertions
  end
  within '.multiple.contact-groups > .multiple-item-1' do
    expect(page).to have_select('Roles', selected: ['SERVICE PROVIDER CONTACT'])
    expect(page).to have_field('Group Name', with: 'Group 2')
  end
end

def contact_persons_assertions
  within '.multiple.contact-persons > .multiple-item-0' do
    expect(page).to have_select('Roles', selected: ['SERVICE PROVIDER'])
    expect(page).to have_field('First Name', with: 'First')
    expect(page).to have_field('Middle Name', with: 'Middle')
    expect(page).to have_field('Last Name', with: 'Last')
    expect(page).to have_field('Uuid', with: '39092bbc-97ec-41c3-ab85-e3e8cacf429a')
    expect(page).to have_field('Non Service Organization Affiliation', with: 'NonServiceOrganizationAffiliation Person 1')

    contact_information_assertions
  end
  within '.multiple.contact-persons > .multiple-item-1' do
    expect(page).to have_select('Roles', selected: ['DEVELOPER'])
    expect(page).to have_field('Last Name', with: 'Last 2')
  end
end

def contact_information_assertions
  within all('.contact-information').first do
    expect(page).to have_field('Service Hours', with: '9-6, M-F')
    expect(page).to have_field('Contact Instruction', with: 'Email only')

    within '.multiple.contact-mechanisms' do
      within '.multiple-item-0' do
        expect(page).to have_field('Type', with: 'Email')
        expect(page).to have_field('Value', with: 'example@example.com')
      end
      within '.multiple-item-1' do
        expect(page).to have_field('Type', with: 'Email')
        expect(page).to have_field('Value', with: 'example2@example.com')
      end
    end

    within '.multiple.addresses > .multiple-item-0' do
      within '.multiple.street-addresses' do
        within '.multiple-item-0' do
          expect(page).to have_selector('input[value="300 E Street Southwest"]')
        end
        within '.multiple-item-1' do
          expect(page).to have_selector('input[value="Room 203"]')
        end
        within '.multiple-item-2' do
          expect(page).to have_selector('input[value="Address line 3"]')
        end
      end
      expect(page).to have_field('City', with: 'Washington')
      expect(page).to have_field('State / Province', with: 'DC')
      expect(page).to have_field('Postal Code', with: '20546')
      expect(page).to have_field('Country', with: 'United States')
    end

    within '.multiple.addresses > .multiple-item-1' do
      within '.multiple.street-addresses' do
        within '.multiple-item-0' do
          expect(page).to have_selector('input[value="8800 Greenbelt Road"]')
        end
      end
      expect(page).to have_field('City', with: 'Greenbelt')
      expect(page).to have_field('State / Province', with: 'MD')
      expect(page).to have_field('Postal Code', with: '20771')
      expect(page).to have_field('Country', with: 'United States')
    end

    within '.multiple.related-urls > .multiple-item-0' do
      expect(page).to have_field('Description', with: 'Related URL 1 Description')
      expect(page).to have_field('Url Content Type', with: 'CollectionURL')
      expect(page).to have_field('Type', with: 'DATA SET LANDING PAGE')
      expect(page).to have_field('Url', with: 'http://example.com/')
    end
    within '.multiple.related-urls> .multiple-item-1' do
      expect(page).to have_field('Description', with: 'Related URL 2 Description')
      expect(page).to have_field('Url Content Type', with: 'DistributionURL')
      expect(page).to have_field('Type', with: 'GET SERVICE')
      expect(page).to have_field('Subtype', with: 'DIF')
      expect(page).to have_field('Url', with: 'https://example.com/')

      expect(page).to have_field('Mime Type', with: 'Not provided')
      expect(page).to have_field('Protocol', with: 'HTTPS')
      expect(page).to have_field('Full Name', with: 'Service Name')
      expect(page).to have_field('Data ID', with: 'data_id')
      expect(page).to have_field('Data Type', with: 'data type')
      expect(page).to have_selector('input.uri[value="uri1"]')
      expect(page).to have_selector('input.uri[value="uri2"]')
    end
    within '.multiple.related-urls > .multiple-item-2' do
      expect(page).to have_field('Description', with: 'Related URL 3 Description')
      expect(page).to have_field('Url Content Type', with: 'DistributionURL')
      expect(page).to have_field('Type', with: 'GET DATA')
      expect(page).to have_field('Subtype', with: 'EARTHDATA SEARCH')
      expect(page).to have_field('Url', with: 'https://search.earthdata.nasa.gov/')

      expect(page).to have_field('Format', with: 'ascii')
      expect(page).to have_field('Size', with: '42.0')
      expect(page).to have_field('Unit', with: 'KB')
      expect(page).to have_field('Fees', with: '0')
      expect(page).to have_field('Checksum', with: 'sdfgfgksghafgsdvbasf')
    end
  end
end
