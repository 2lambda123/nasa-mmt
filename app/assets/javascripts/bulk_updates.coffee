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
      .text('This field supports wildcard searching, add `*` to your search to return more results.')
      .insertAfter($queryField)

$(document).ready ->
  displayHelpText($('#bulk-updates-search-field'))

  $('#bulk-updates-search').validate
    errorPlacement: (error, element) ->
      error.insertAfter(element.closest('fieldset'))

    rules:
      query:
        required: true

    messages:
      query:
        required: 'Search Query is required.'

  $('#bulk-updates-search-field').on 'change', ->
    displayHelpText($(this))