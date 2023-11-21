import React, { useState } from 'react'
import Col from 'react-bootstrap/Col'
import PropTypes from 'prop-types'
import { cloneDeep, uniqueId } from 'lodash'

import For from '../For/For'
import CustomTextWidget from '../CustomTextWidget/CustomTextWidget'

import './StreetAddressField.scss'

const StreetAddressField = ({
  onChange,
  registry,
  schema,
  uiSchema = {},
  formData,
  noLines
}) => {
  // for (let i = 0; i < noLines - formData.count; i += 1) {
  //   formData.push('')
  // }

  const [lines, setLines] = useState(formData)

  const { description } = schema

  const handleUpdateAddressLine = (line, pos) => {
    lines[pos] = line
    const values = Object.values(lines)

    setLines(values)
    onChange(values)
  }

  const clonedSchema = cloneDeep(schema)
  clonedSchema.description = ''
  const id = uniqueId()

  return (
    <div>
      <span className="street-address-field__description-box">
        {description}

        <For each={[...new Array(3)]}>
          {
            (_value, index) => (
              <Col
                key={`address_line_${index}`}
                md={12}
                className="street-address-field__address-line"
              >
                <CustomTextWidget
                  name={`address_line_${index}`}
                  label={`Address Line ${index + 1}`}
                  schema={clonedSchema}
                  value={lines[index]}
                  required={false}
                  id={`${id}_${index}`}
                  disabled={false}
                  onChange={(value) => { handleUpdateAddressLine(value, index) }}
                  onBlur={() => undefined}
                  onFocus={() => undefined}
                  registry={registry}
                  uiSchema={uiSchema}
                  placeholder=""
                />
              </Col>
            )
          }
        </For>
      </span>
    </div>
  )
}

StreetAddressField.defaultProps = {
  formData: [],
  noLines: 3
}

StreetAddressField.propTypes = {
  formData: PropTypes.arrayOf(PropTypes.string),
  noLines: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  registry: PropTypes.shape({
    formContext: PropTypes.shape({
      focusField: PropTypes.string,
      setFocusField: PropTypes.func
    }).isRequired
  }).isRequired,
  schema: PropTypes.shape({
    description: PropTypes.string,
    maxLength: PropTypes.number
  }).isRequired,
  uiSchema: PropTypes.shape({}).isRequired
}

export default StreetAddressField