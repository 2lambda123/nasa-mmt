displayHelpText = (searchFieldElement) ->
  # The select element that lists the fields to search on
  $selectedFieldData = searchFieldElement.find('option:selected').data()

  # The query (value) field and its form-description
  $queryField = searchFieldElement.closest('div').find('#bulk-updates-search-field')
  $queryFieldDescription = $('#bulk-update-query-description')

  # Set the form-description if the field has one
  if($selectedFieldData.hasOwnProperty('description'))
    $queryFieldDescription.text($selectedFieldData['description'])
  else
    $queryFieldDescription.text('')

  searchFieldElement.next('.form-description').remove()

  if($selectedFieldData.hasOwnProperty('supports_wildcard') && $selectedFieldData['supports_wildcard'] == true)
    $('<p>').addClass('form-description')
      .text('This field supports wildcard searches. Use an asterisk (*) to find collections that match zero or more characters at the beginning, middle or end of your term.')
      .insertAfter($queryField)

$(document).ready ->
  if $('#bulk-updates-search').length > 0
    displayHelpText($('#bulk-updates-search-field'))

    $('#bulk-updates-search').validate
      errorPlacement: (error, element) ->
        error.insertAfter(element.closest('fieldset'))

      rules:
        query:
          required: true

      messages:
        query:
          required: 'Search Term is required.'

    $('#bulk-updates-search-field').on 'change', ->
      displayHelpText($(this))

  if $('#bulk-updates-search-results').length > 0
      $('#bulk-updates-search-results').tablesorter
        # Prevent sorting on the checkboxes
        headers:
          0:
            sorter: false
          3:
            sorter: 'text'

        widgets: ['zebra']
