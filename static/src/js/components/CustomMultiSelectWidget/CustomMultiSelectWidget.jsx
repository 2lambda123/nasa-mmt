import React, { useRef } from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'
import { startCase } from 'lodash-es'

import CustomWidgetWrapper from '../CustomWidgetWrapper/CustomWidgetWrapper'

/**
 * CustomMultiSelectWidget
 * @typedef {Object} CustomArrayFieldTemplate
 * @property {String} id The id of the widget.
 * @property {String} label The label of the widget.
 * @property {Boolean} onBlur Should blur a field.
 * @property {Function} onChange A callback function triggered when the user selects an option.
 * @property {String} placeholder A placeholder text for the multiselect.
 * @property {Object} registry An Object that has all the props that are in registry.
 * @property {Boolean} required Is the CustomMultiSelectWidget field required
 * @property {Object} schema A UMM Schema for the widget being previewed.
 * @property {Object} uiSchema A uiSchema for the field being shown.
 * @property {String} value An option is saved to the draft.
 */

/**
 * Renders Custom Multi Select Widget
 * @param {CustomMultiSelectWidget} props
 */
const CustomMultiSelectWidget = ({
  id,
  label,
  onBlur,
  onChange,
  placeholder,
  registry,
  required,
  schema,
  uiSchema,
  value
}) => {
  const { items } = schema
  const { schemaUtils } = registry
  const retrievedSchema = schemaUtils.retrieveSchema(items)

  const selectScrollRef = useRef(null)
  const focusRef = useRef(null)

  const selectOptions = []
  const {
    enum: schemaEnums = retrievedSchema?.enum ?? [],
    description
  } = schema
  const { formContext } = registry

  const {
    setFocusField
  } = formContext

  let title = startCase(label.split(/-/)[0])
  if (uiSchema['ui:title']) {
    title = uiSchema['ui:title']
  }

  // Helper function that will add the list of enums to selectedOption
  const selectOptionList = (enums) => {
    enums.forEach((enumValue) => {
      selectOptions.push({
        value: enumValue,
        label: enumValue
      })
    })
  }

  // If enumOptions are define in uiSchema, these options take precedence over schema enums.
  selectOptionList(schemaEnums)

  const handleChange = (event) => {
    const result = []
    event.forEach((current) => {
      result.push(current.value)
    })

    onChange(result)
  }

  const handleBlur = () => {
    setFocusField(null)

    onBlur(id)
  }

  // If the value already has data, this will store it as an object for react-select
  const existingValues = value.filter(Boolean).map((currentValue) => ({
    value: currentValue,
    label: currentValue
  }))

  return (
    <CustomWidgetWrapper
      description={description}
      id={id}
      label={label}
      required={required}
      scrollRef={selectScrollRef}
      title={title}
    >
      <Select
        id={id}
        isClearable
        isMulti
        onBlur={handleBlur}
        onChange={handleChange}
        openMenuOnClick
        openMenuOnFocus
        options={selectOptions}
        placeholder={placeholder || `Select ${title}`}
        ref={focusRef}
        value={existingValues}
      />
    </CustomWidgetWrapper>
  )
}

CustomMultiSelectWidget.defaultProps = {
  placeholder: '',
  uiSchema: {
    'ui:title': null
  },
  value: []
}

CustomMultiSelectWidget.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  registry: PropTypes.shape({
    schemaUtils: PropTypes.shape({
      retrieveSchema: PropTypes.func
    }).isRequired,
    formContext: PropTypes.shape({
      focusField: PropTypes.string,
      setFocusField: PropTypes.func
    }).isRequired
  }).isRequired,
  required: PropTypes.bool.isRequired,
  schema: PropTypes.shape({
    items: PropTypes.shape({}).isRequired,
    description: PropTypes.string,
    maxLength: PropTypes.number,
    enum: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  uiSchema: PropTypes.shape({
    'ui:title': PropTypes.string
  }),
  value: PropTypes.arrayOf(PropTypes.string)
}

export default CustomMultiSelectWidget
