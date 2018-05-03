$(document).ready ->

  isMetadataForm = ->
    $('.metadata-form').length > 0

  isUmmForm = ->
    $('.umm-form').length > 0

  isUmmSForm = ->
    $('.umm-form.service-form').length > 0

  isUmmVarForm = ->
    $('.umm-form.variable-form').length > 0

  getPageJson = ->
    if isMetadataForm()
      json = JSON.parse($('.metadata-form').find('input, textarea, select').filter ->
        return this.value
      .serializeJSON()).Draft
    else if isUmmForm()
      json = $('.umm-form').find('input, textarea, select').filter ->
        return this.value
      json = JSON.parse(json.serializeJSON())
      if isUmmSForm()
        json = json.ServiceDraft?.Draft or {}
        fixRelatedURL(json)
      else if isUmmVarForm()
        json = json.VariableDraft?.Draft or {}

    json = {} unless json?

    fixNumbers(json)
    fixIntegers(json)
    fixNestedFields(json)

    return json

  fixRelatedURL = (json) ->
    if json?.RelatedUrls?
      json.RelatedURLs = json.RelatedUrls
      delete json.RelatedUrls

  # Nested non-array fields don't display validation errors because there is no form field for the top level field
  # Adding an empty object into the json changes the validation to display errors on the missing subfields
  fixNestedFields = (json) ->
    if isMetadataForm()
      json?.ProcessingLevel = {} unless json?.ProcessingLevel?
    else if isUmmSForm()
      json?.RelatedURLs = [] unless json?.RelatedURLs?


  fixNumbers = (json) ->
    if isMetadataForm()
      numberFields = $('.mmt-number.validate').filter ->
        this.value
    else if isUmmForm()
      numberFields = $('.validate[number="true"]').filter ->
        this.value

    for element in numberFields
      name = $(element).attr('name')
      re = /\[(.*?)\]/g
      path = []
      value = json
      while match = re.exec name
        newPath = humps.pascalize(match[1])
        unless newPath == 'Draft'
          value = value[newPath]
          path.push newPath

      if $.isNumeric(value)
        updateJson(json, path, parseFloat(value))

    return

  fixIntegers = (json) ->
    if isMetadataForm()
      integerFields = $('.mmt-integer.validate').filter ->
        this.value
    else if isUmmForm()
      integerFields = $('.validate[integer="true"]').filter ->
        this.value

    for element in integerFields
      name = $(element).attr('name')
      re = /\[(.*?)\]/g
      path = []
      value = json
      while match = re.exec name
        newPath = humps.pascalize(match[1])
        unless newPath == 'Draft'
          value = value[newPath]
          path.push newPath

      if $.isNumeric(value) and Math.floor(value) == +value
        updateJson(json, path, parseInt(value))

    return

  updateJson = (json, path, value) ->
    tempJson = json
    index = 0
    while index < path.length - 1
      tempJson = tempJson[path[index]]
      index++

    tempJson[path[path.length - 1]] = value
    return

  validationMessages = (error) ->
    keyword = error.keyword
    if error.title.length > 0
      field =  error.title
    else
      path = error.dataPath.split('/')
      field = path[path.length - 1]
      field = path[path.length - 2] if $.isNumeric(field)
    type = getFieldType(error.element)

    switch keyword
      when 'required' then "#{field} is required"
      when 'maxLength' then "#{field} is too long"
      when 'minLength' then "#{field} is too short"
      when 'pattern' then "#{field} must match the provided pattern"
      when 'format'
        if type == 'URI'
          "#{field} is an invalid URI"
        else
          "#{field} is an incorrect format"
      when 'minItems' then "#{field} has too few items"
      when 'maxItems' then "#{field} has too many items"
      when 'type' then "#{field} must be of type #{type}"
      when 'maximum' then "#{field} is too high"
      when 'minimum' then "#{field} is too low"
      when 'parameter-range-later' then "#{field} must be later than Parameter Range Begin"
      when 'parameter-range-larger' then "#{field} must be larger than Parameter Range Begin"
      when 'oneOf' # TODO check and remove 'Party' - was only for organization or personnel
        # oneOf Party means it wants oneOf OrganizationName or Person
        # Those errors don't matter to a user because they don't see
        # that difference in the forms
        if field == 'Party'
          "Party is incomplete"
        else
          "#{field} should have one type completed"
      when 'invalidPicklist' then "#{field} #{error.message}"
      when 'anyOf' then "#{error.message}"

  getFieldType = (element) ->
    classes = $(element).attr('class').split(/\s+/)
    if classes.indexOf('mmt-number') != -1 or $(element).attr('number') == 'true'
      type = 'number'
    if classes.indexOf('mmt-integer') != -1 or $(element).attr('integer') == 'true'
      type = 'integer'
    if classes.indexOf('mmt-boolean') != -1 or $(element).attr('boolean') == 'true'
      type = 'boolean'
    if classes.indexOf('mmt-date-time') != -1 or $(element).attr('date-time') == 'true'
      type = 'date-time'
    if classes.indexOf('mmt-uri') != -1 or $(element).attr('uri') == 'true'
      type = 'URI'
    if classes.indexOf('mmt-uuid') != -1 or $(element).attr('uuid') == 'true'
      type = 'uuid'
    type

  displayInlineErrors = (errors) ->
    for error in errors
      $element = $("##{error.id}")

      message = validationMessages(error)

      classes = 'eui-banner--danger validation-error'

      errorElement = $('<div/>',
        id: "#{error.id}_error"
        class: classes
        html: message
      )

      # if the error needs to be shown after the remove button
      if $element.parent().hasClass('multiple-item')
        afterElement = $element.parent().children('.remove')
      else
        afterElement = $element

      # if the error needs to be shown after the help icon
      if $element.next().hasClass('display-modal')
        afterElement = $element.next()

      # if the error needs to be shown after the select2
      if $element.next().hasClass('select2-container')
        afterElement = $element.next()

      $(errorElement).insertAfter(afterElement)

  displaySummary = (errors) ->
    summary = $('<div/>',
      class: 'eui-banner--danger summary-errors'
      html: '<h4><i class="fa fa-exclamation-triangle"></i> This draft has the following errors:</h4>'
    )

    errorList = $('<ul/>', class: 'no-bullet')
    for error in errors
      message = validationMessages(error)
      listElement = $('<li/>')
      $('<a/>',
        href: "##{error.id}"
        text: message
      ).appendTo(listElement)
      $(listElement).appendTo(errorList)

    $(errorList).appendTo(summary)

    $(summary).insertAfter('.nav-top')

  getErrorDetails = (error) ->
    if error.keyword == 'additionalProperties'
      error = null
      return

    # If the error is a Geometry anyOf error
    if error.keyword == 'anyOf'
      if error.dataPath.indexOf('Geometry') != -1
        error.message = 'At least one Geometry Type is required'
      else
        # anyOf errors are showing up in the data contacts form, but only when
        # there are other validation errors. as the error messages are duplicate
        # and don't have the specificity of the other error messages (or have
        # information useful to the user), it seems best to suppress these
        # more info at https://github.com/epoberezkin/ajv/issues/201#issuecomment-222544956
        error = null
        return

    # Hide individual required errors from an anyOf constraint
    # So we don't fill the form with errors that don't make sense to the user
    if error.keyword == 'required' && error.schemaPath.indexOf('anyOf') != -1
      error = null
      return

    error.dataPath += "/#{error.params.missingProperty}" if error.params.missingProperty?

    path = for p in error.dataPath.replace(/^\//, '').split('/')
      p = p.replace(/(\w)(\d)$/, '$1_$2')
      humps.decamelize(p)
    path = path.join('_')

    # Fix the path for special case keys
    path = path.replace(/u_r_ls/g, 'urls')
    path = path.replace(/u_r_l/g, 'url')
    path = path.replace(/u_r_l_content_type/g, 'url_content_type')
    path = path.replace(/d_o_i/g, 'doi')
    path = path.replace(/i_s_b_n/g, 'isbn')
    path = path.replace(/i_s_o_topic_categories/g, 'iso_topic_categories')
    path = path.replace(/data_i_d/g, 'data_id')
    error.path = path

    if isMetadataForm()
      id = "draft_#{path}"
    else if isUmmSForm()
      id = "service_draft_draft_#{path}"
    else if isUmmVarForm()
      id = "variable_draft_draft_#{path}"
    error.id = id
    error.element = $("##{id}")
    labelFor = id.replace(/\d+$/, "")
    error.title = $("label[for='#{labelFor}']").text()
    error

  validateParameterRanges = (errors) ->
    if $('#additional-attributes').length > 0
      $('.multiple.additional-attributes > .multiple-item').each (index, element) ->
        type = $(element).find('.additional-attribute-type-select').val()
        if type.length > 0
          $begin = $(element).find('.parameter-range-begin')
          $end = $(element).find('.parameter-range-end')
          beginValue = $begin.val()
          endValue = $end.val()

          if beginValue.length > 0 && endValue.length > 0 && beginValue >= endValue
            largerTypes = ['INT', 'FLOAT']
            keyword = 'parameter-range-later'
            keyword = 'parameter-range-larger' if largerTypes.indexOf(type) != -1
            newError =
              keyword: keyword,
              dataPath: "/AdditionalAttributes/#{index}/ParameterRangeEnd"
              params: {}
            errors.push newError

  validatePicklistValues = (errors) ->
    $('select > option:disabled:selected, select > optgroup > option:disabled:selected').each ->
      id = $(this).parents('select').attr('id')
      visitedFields.push id

      dataPath = switch
        when /processing_level_id/.test id
          '/ProcessingLevel/Id'
        when /metadata_language/.test id
          '/MetadataLanguage'
        when /data_language/.test id
          '/DataLanguage'
        when /collection_progress/.test id
          '/CollectionProgress'
        when /related_urls_(\d*)_url_content_type/.test id
          [_, index] = id.match /related_urls_(\d*)_url_content_type/
          "/RelatedUrls/#{index}/URLContentType"
        when /related_urls_(\d*)_get_service_mime_type/.test id
          [_, index] = id.match /related_urls_(\d*)_get_service_mime_type/
          "/RelatedUrls/#{index}/GetService/MimeType"
        when /related_urls_(\d*)_get_service_protocol/.test id
          [_, index] = id.match /related_urls_(\d*)_get_service_protocol/
          "/RelatedUrls/#{index}/GetService/Protocol"
        when /related_urls_(\d*)_get_data_format/.test id
          [_, index] = id.match /related_urls_(\d*)_get_data_format/
          "/RelatedUrls/#{index}/GetData/Format"
        when /related_urls_(\d*)_get_data_unit/.test id
          [_, index] = id.match /related_urls_(\d*)_get_data_unit/
          "/RelatedUrls/#{index}/GetData/Unit"
        when /draft_platforms_(\d*)_short_name/.test id
          [_, index] = id.match /platforms_(\d*)_short_name/
          "/Platforms/#{index}/ShortName"
        when /draft_platforms_(\d*)_instruments_(\d*)_short_name/.test id
          [_, index, index2] = id.match /platforms_(\d*)_instruments_(\d*)_short_name/
          "/Platforms/#{index}/Instruments/#{index2}/ShortName"
        when /draft_platforms_(\d*)_instruments_(\d*)_composed_of_(\d*)_short_name/.test id
          [_, index, index2, index3] = id.match /platforms_(\d*)_instruments_(\d*)_composed_of_(\d*)_short_name/
          "/Platforms/#{index}/Instruments/#{index2}/ComposedOf/#{index3}/ShortName"
        when /organizations_(\d*)_party_organization_name_short_name/.test id
          [_, index] = id.match /organizations_(\d*)_party_organization_name_short_name/
          "/Organizations/#{index}/Party/OrganizationName/ShortName"
        when /temporal_keywords/.test id
          '/TemporalKeywords'
        when /related_urls_(\d*)_file_size_unit/.test id
          [_, index] = id.match /related_urls_(\d*)_file_size_unit/
          "/RelatedUrls/#{index}/FileSize/Unit"
        when /spatial_extent_granule_spatial_representation/.test id
          '/SpatialExtent/GranuleSpatialRepresentation'
        when /data_centers_\d*_roles/.test id
          [_, index] = id.match /data_centers_(\d*)_roles/
          "/DataCenters/#{index}/Roles"
        when /data_centers_\d*_short_name/.test id
          [_, index] = id.match /data_centers_(\d*)_short_name/
          "/DataCenters/#{index}/ShortName"
        when /data_centers_\d*_contact_information_contact_mechanisms_\d*_type/.test id
          [_, index1, index2] = id.match /data_centers_(\d*)_contact_information_contact_mechanisms_(\d*)_type/
          "DataCenters/#{index1}/ContactInformation/ContactMechanisms/#{index2}/Type"
        when /data_centers_\d*_contact_information_addresses_\d*_country/.test id
          [_, index1, index2] = id.match /data_centers_(\d*)_contact_information_addresses_(\d*)_country/
          "/DataCenters/#{index1}/ContactInformation/Addresses/#{index2}/Country"
        when /data_centers_\d*_contact_information_addresses_\d*_state_province/.test id
          [_, index1, index2] = id.match /data_centers_(\d*)_contact_information_addresses_(\d*)_state_province/
          "/DataCenters/#{index1}/ContactInformation/Addresses/#{index2}/StateProvince"
        when /data_contacts_\d*_contact_person_data_center_short_name/.test id
          [_, index] = id.match /data_contacts_(\d*)_contact_person_data_center_short_name/
          "/DataContacts/#{index}/ContactPersonDataCenter/ShortName"
        when /data_contacts_\d*_contact_group_data_center_short_name/.test id
          [_, index] = id.match /data_contacts_(\d*)_contact_group_data_center_short_name/
          "/DataContacts/#{index}/ContactGroupDataCenter/ShortName"
        when /data_contacts_\d*_contact_person_data_center_contact_person_roles/.test id
          [_, index] = id.match /data_contacts_(\d*)_contact_person_data_center_contact_person_roles/
          "/DataContacts/#{index}/ContactPersonDataCenter/ContactPerson/Roles"
        when /data_contacts_\d*_contact_group_data_center_contact_group_roles/.test id
          [_, index] = id.match /data_contacts_(\d*)_contact_group_data_center_contact_group_roles/
          "/DataContacts/#{index}/ContactGroupDataCenter/ContactGroup/Roles"
        when /data_contacts_\d*_contact_person_roles/.test id
          [_, index] = id.match /data_contacts_(\d*)_contact_person_roles/
          "/DataContacts/#{index}/ContactPerson/Roles"
        when /data_contacts_\d*_contact_group_roles/.test id
          [_, index] = id.match /data_contacts_(\d*)_contact_group_roles/
          "/DataContacts/#{index}/ContactGroup/Roles"
        when /data_contacts_\d*_contact_person_data_center_contact_person_contact_information_contact_mechanisms_\d*_type/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_person_data_center_contact_person_contact_information_contact_mechanisms_(\d*)_type/
          "/DataContacts/#{index1}/ContactPersonDataCenter/ContactPerson/ContactInformation/ContactMechanisms/#{index2}/Type"
        when /data_contacts_\d*_contact_group_data_center_contact_group_contact_information_contact_mechanisms_\d*_type/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_group_data_center_contact_group_contact_information_contact_mechanisms_(\d*)_type/
          "/DataContacts/#{index1}/ContactGroupDataCenter/ContactGroup/ContactInformation/ContactMechanisms/#{index2}/Type"
        when /data_contacts_\d*_contact_person_contact_information_contact_mechanisms_\d*_type/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_person_contact_information_contact_mechanisms_(\d*)_type/
          "/DataContacts/#{index1}/ContactPerson/ContactInformation/ContactMechanisms/#{index2}/Type"
        when /data_contacts_\d*_contact_group_contact_information_contact_mechanisms_\d*_type/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_group_contact_information_contact_mechanisms_(\d*)_type/
          "/DataContacts/#{index1}/ContactGroup/ContactInformation/ContactMechanisms/#{index2}/Type"
        when /data_contacts_\d*_contact_person_data_center_contact_person_contact_information_addresses_\d*_country/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_person_data_center_contact_person_contact_information_addresses_(\d*)_country/
          "/DataContacts/#{index1}/ContactPersonDataCenter/ContactPerson/ContactInformation/Addresses/#{index2}/Country"
        when /data_contacts_\d*_contact_person_data_center_contact_person_contact_information_addresses_\d*_state_province/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_person_data_center_contact_person_contact_information_addresses_(\d*)_state_province/
          "/DataContacts/#{index1}/ContactPersonDataCenter/ContactPerson/ContactInformation/Addresses/#{index2}/StateProvince"
        when /data_contacts_\d*_contact_group_data_center_contact_group_contact_information_addresses_\d*_country/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_group_data_center_contact_group_contact_information_addresses_(\d*)_country/
          "/DataContacts/#{index1}/ContactGroupDataCenter/ContactGroup/ContactInformation/Addresses/#{index2}/Country"
        when /data_contacts_\d*_contact_group_data_center_contact_group_contact_information_addresses_\d*_state_province/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_group_data_center_contact_group_contact_information_addresses_(\d*)_state_province/
          "/DataContacts/#{index1}/ContactGroupDataCenter/ContactGroup/ContactInformation/Addresses/#{index2}/StateProvince"
        when /data_contacts_\d*_contact_person_contact_information_addresses_\d*_country/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_person_contact_information_addresses_(\d*)_country/
          "/DataContacts/#{index1}/ContactPerson/ContactInformation/Addresses/#{index2}/Country"
        when /data_contacts_\d*_contact_person_contact_information_addresses_\d*_state_province/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_person_contact_information_addresses_(\d*)_state_province/
          "/DataContacts/#{index1}/ContactPerson/ContactInformation/Addresses/#{index2}/StateProvince"
        when /data_contacts_\d*_contact_group_contact_information_addresses_\d*_country/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_group_contact_information_addresses_(\d*)_country/
          "/DataContacts/#{index1}/ContactGroup/ContactInformation/Addresses/#{index2}/Country"
        when /data_contacts_\d*_contact_group_contact_information_addresses_\d*_state_province/.test id
          [_, index1, index2] = id.match /data_contacts_(\d*)_contact_group_contact_information_addresses_(\d*)_state_province/
          "/DataContacts/#{index1}/ContactGroup/ContactInformation/Addresses/#{index2}/StateProvince"

      # Remove required error from the same dataPath
      errors = errors.filter (error) ->
        if error.keyword == 'required'
          dataPath.indexOf(error.dataPath) != -1
        else
          true

      error = {}
      error.keyword = 'invalidPicklist'
      error.message = "value [#{$(this).val()}] does not match a valid selection option"
      error.params = {}
      error.dataPath = dataPath
      errors.push error

    # combine TemporalKeywords invalidPicklist errors if more than one exist
    # find TemporalKeywords errors
    temporalKeywordErrors = errors.filter (error) ->
      error.dataPath == '/TemporalKeywords'

    if temporalKeywordErrors.length > 1
      # get all other errors
      errors = errors.filter (error) ->
        error.dataPath != '/TemporalKeywords'

      # combine temporalKeywordErrors into 1 error
      values = []
      for error in temporalKeywordErrors
        [_, value] = error.message.match /\[(.*)\]/
        values.push value

      newError = {}
      newError.keyword = 'invalidPicklist'
      newError.message = "values [#{values.join(', ')}] do not match a valid selection option"
      newError.params = {}
      newError.dataPath = '/TemporalKeywords'
      errors.push newError

    errors

  validatePage = (opts) ->
    $('.validation-error').remove()
    $('.summary-errors').remove()
    json = getPageJson()

    ajv = Ajv
      allErrors: true,
      jsonPointers: true,
      formats: 'uri' : URI_REGEX
    validate = ajv.compile(globalJsonSchema)
    validate(json)

    # adding validation for Data Contacts form with separate schema as it
    # does not follow UMM schema structure in the form
    # Data Contacts Schema is only passed on the data contacts form
    # validateDataContacts = ajv.compile(globalDataContactsFormSchema)
    if globalDataContactsFormSchema?
      validate = ajv.compile(globalDataContactsFormSchema)
      validate(json)

    errors = if validate.errors? then validate.errors else []
    # console.log 'errors! ', JSON.stringify(errors)

    validateParameterRanges(errors)
    errors = validatePicklistValues(errors)

    inlineErrors = []
    summaryErrors = []

    # Display errors, from visited fields
    for error, index in errors
      if error = getErrorDetails error
        # does the error id match the visitedFields
        visited = visitedFields.filter (e) ->
          return e == error.id
        .length > 0

        if (visited or opts.showConfirm) and inlineErrors.indexOf(error) == -1
          # don't duplicate errors
          inlineErrors.push error if $("##{error.id}").length > 0
          summaryErrors.push error if $("##{error.id}").length > 0

    if inlineErrors.length > 0 and opts.showInline
      displayInlineErrors inlineErrors
    if summaryErrors.length > 0 and opts.showSummary
      displaySummary summaryErrors
    if opts.showConfirm
      # 'visit' any invalid fields so they don't forget about their error
      for error in inlineErrors
        visitedFields.push error.id unless visitedFields.indexOf(error.id) != -1

    valid = summaryErrors.length == 0

    if !valid and opts.showConfirm
      # click on link to open modal
      $('#display-invalid-draft-modal').click()
      return false

    valid

  visitedFields = []

  validateFromFormChange = ->
    validatePage
      showInline: true
      showSummary: true
      showConfirm: false

  validateForNavigation = ->
    validatePage
      showInline: true
      showSummary: true
      showConfirm: true

  # Validate the whole page on page load
  if $('.metadata-form, .umm-form').length > 0
    # "visit" each field with a value on page load
    $('.validate').not(':disabled').filter ->
      return switch this.type
        when 'radio'
          # don't want to save fields that aren't translated into metadata
          this.name? and this.checked
        else
          this.value
    .each (index, element) ->
      visitedFields.push $(element).attr('id')

    validateFromFormChange()

  # // set up validation call
  $('.metadata-form, .umm-form').on 'blur', '.validate', ->
    id = $(this).attr('id')
    visitedFields.push id unless visitedFields.indexOf(id) != -1
    # if the field is a datepicker, and the datepicker is still open, don't validate yet
    return if $(this).attr('type') == 'datetime' and $('.datepicker:visible').length > 0
    validateFromFormChange()

  # 'blur' functionality for select2 fields
  $('.metadata-form .select2-select, .umm-form .select2-select').on 'select2:open', (event) ->
    id = $(this).attr('id')
    visitedFields.push id unless visitedFields.indexOf(id) != -1

  $('.metadata-form, .umm-form').on 'click', '.remove', ->
    validateFromFormChange()

  $('.metadata-form, .umm-form').find('input[type="radio"], select').not('.next-section, .jump-to-section').on 'change', ->
    validateFromFormChange()

  $(document).on 'mmtValidate', ->
    validateFromFormChange()

  $('.metadata-form .next-section').on 'change', ->
    $('#new_form_name').val(this.value)

    if validateForNavigation()
      $('.metadata-form').submit()

  $('.umm-form .jump-to-section').on 'change', ->
    $('.jump-to-section').val($(this).val())

    if validateForNavigation()
      $('.umm-form').submit()

  $('.metadata-form .save-form, .umm-form .save-form').on 'click', (e) ->
    $('#commit').val($(this).val())

    return validateForNavigation()

  # Handle modal 'Yes', submit form
  $('#invalid-draft-accept').on 'click', ->
    $('.metadata-form, .umm-form').submit()

  # If a user clicks on Save/Done, then jump_to_section, #commit needs to be cleared
  # Handle modal 'No'
  $('#invalid-draft-deny').on 'click', ->
    $('#commit').val('')

  # would be nice to add an explanation or cite source of the regex
  URI_REGEX = /^(?:[A-Za-z][A-Za-z0-9+\-.]*:(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?(?:\#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?|(?:\/\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*)(?::[0-9]*)?(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|\/(?:(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?|(?:[A-Za-z0-9\-._~!$&'()*+,;=@]|%[0-9A-Fa-f]{2})+(?:\/(?:[A-Za-z0-9\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*|)(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?(?:\#(?:[A-Za-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9A-Fa-f]{2})*)?)$/
