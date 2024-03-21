import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import fetchCmrKeywords from '../../utils/fetchCmrKeywords'
import parseCmrResponse from '../../utils/parseCmrResponse'
import './PlatformField.scss'

/** This is custom field found with Collections >> acquisitionInformation
 *
 * @typedef {Object} PlatformField
 * @property {Function} onChange A callback function triggered when the user inputs a text.
 * @property {Object} uiSchema uiSchema for the field being shown.
 * @property {Object} formData Saved Draft
 */
const PlatformField = ({ onChange, uiSchema, formData }) => {
  const { Type, ShortName, LongName } = formData
  const [type, setType] = useState(Type || '')
  const [shortName, setShortName] = useState(ShortName || '')
  const [longName, setLongName] = useState(LongName || '')
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState([])
  const [showMenu, setShowMenu] = useState(false)
  const [shouldFocus, setShouldFocus] = useState(false)
  const [longNameMap, setLongNameMap] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const controlled = uiSchema['ui:controlled']
      const { name, controlName } = controlled

      setLoading(true)

      const keywords = await fetchCmrKeywords(name)
      const paths = parseCmrResponse(keywords, controlName)
      const newPaths = []

      // Creating a '>' delimiter map for the platform keywords.
      // For example: if the values from the parseCmrResponse are
      //                basis="Air-based Platform",
      //                Category="Jet", shortName="A340-600"
      //                LongName="Airbus A340-600"
      // the '>' delimited path would for this case would be
      //                Air-based Platforms>Jet>A340-600>Airbus A340-600
      // This path is being used in the render to display the Short Names (A340-600)
      // and based on the selected Short Name it will auto populate the Type (JET)
      // and Long Name (Airbus A340-600) field

      paths.forEach((path) => {
        let newPath = ''
        path.forEach((value, index) => {
          newPath += `>${value}`
          if (index === 3) {
            setLongNameMap((prevMap) => ({
              ...prevMap,
              [path[2]]: value
            }))
          }

          if (!newPaths.includes(newPath.slice(1))) {
            newPaths.push(newPath.slice(1))
          }
        })
      })

      setLoading(false)
      setKeyword(newPaths)
    }

    fetchData()
  }, [])

  const onHandleMouseDown = (values) => {
    const [valueType, valueShortName] = values
    const valueLongName = longNameMap[valueShortName] || ''
    setType(valueType)
    setShortName(valueShortName)
    setLongName(valueLongName)
    setShowMenu(false)
    setShouldFocus(false)

    const data = {
      Type: valueType,
      ShortName: valueShortName,
      LongName: valueLongName
    }

    onChange(data)
  }

  const onHandleFocus = () => {
    setShowMenu(true)
    setShouldFocus(true)
  }

  const onHandleBlur = () => {
    setShowMenu(false)
    setShouldFocus(false)
  }

  const onHandleClear = () => {
    setType('')
    setShortName('')
    setLongName('')
    setShowMenu(false)
    setShouldFocus(false)

    const data = {
      Type: '',
      ShortName: '',
      LongName: ''
    }
    onChange(data)
  }

  const displayTitle = (value) => (
    <div className="platform-field-select-title">
      {value}
    </div>
  )

  const displaySelectOption = (value) => (
    <button
      type="button"
      className="platform-field-select-option"
      onMouseDown={() => onHandleMouseDown(value)}
    >
      {value[1]}
    </button>
  )

  const displayClearOption = () => (
    <button
      type="button"
      className="platform-field-clear-option"
      onClick={onHandleClear}
    >
      Clear Short Name
    </button>
  )

  const existingValue = {
    value: shortName,
    label: shortName
  }

  const selectOptions = [{
    value: '',
    label: ''
  }, ...keyword.map((currentEnum) => ({
    value: currentEnum,
    label: currentEnum
  }))]

  // This is using the react-select components={{ Option }}, this allows us to
  // render a custom dropdown. For the case of Short Name, we need hierarchical structure
  // where it has a title (in this case it's the Type) followed by all the Short Name in that Type
  // For Example: JET
  //               A340-600
  //               NASA S-B VIKING
  // This Option function will render the list of Types and Short Name in this hierarchy
  // using the > delimited path that was created during useEffect()

  const Option = ({ ...data }) => {
    const paths = data.value.split('>')
    const value = paths.splice(1)

    if (paths[0] === '') {
      return displayClearOption()
    }

    if (value.length > 2) {
      return null
    }

    if (value.length === 1) {
      return displayTitle(value[0])
    }

    return displaySelectOption(value)
  }

  return (
    <div className="platform-field">
      {/* Short Name field */}
      Short Name
      <i className="eui-icon eui-required-o required-icon" />
      <div className="mt-1">
        <Select
          id="shortName"
          key={`platform_short-name--${shouldFocus}`}
          autoFocus={shouldFocus}
          placeholder="Select Short Name"
          options={selectOptions}
          isLoading={loading}
          components={{ Option }}
          value={existingValue.value ? existingValue : null}
          onFocus={onHandleFocus}
          onBlur={onHandleBlur}
          menuIsOpen={showMenu}
        />
      </div>

      {/* Type field */}
      <div className="mt-2">
        Type
        <input
          className="platForm-field-text-field"
          name="type"
          placeholder="No available Type"
          disabled
          value={type}
        />
      </div>

      {/* Long Name field */}
      <div className="mt-2">
        Long Name
        <input
          className="platForm-field-text-field"
          name="longName"
          placeholder="No available Long Name"
          disabled
          value={longName}
        />
      </div>
    </div>
  )
}

PlatformField.defaultProps = {
  formData: {}
}

PlatformField.propTypes = {
  formData: PropTypes.shape({
    Type: PropTypes.string,
    ShortName: PropTypes.string,
    LongName: PropTypes.string
  }),
  uiSchema: PropTypes.shape({
    'ui:controlled': PropTypes.shape({
      name: PropTypes.string.isRequired,
      controlName: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  }).isRequired,
  onChange: PropTypes.func.isRequired
}

export default PlatformField
