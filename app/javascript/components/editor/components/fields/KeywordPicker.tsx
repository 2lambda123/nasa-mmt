/* eslint-disable dot-notation */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/sort-comp */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import _, { kebabCase } from 'lodash'
import { Button } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import './KeywordPicker.css'
import { FieldProps } from '@rjsf/utils'
import { MetadataService } from '../../services/MetadataService'
import { parseCmrResponse } from '../../utils/cmr_keywords'
import Status from '../../model/Status'

interface KeywordPickerProps extends FieldProps {
  formData: any,
  onChange: (value: string,) => void,
  schema: {
    description: string
  },
  uiSchema: any
}

type KeywordPickerState = {
  value: any,
  selectedKeywords: any,
  currentList: any,
  disableAddKeywordBtn: boolean,
  finalSelectedKeywords: any,
  finalSelectedValue: string,
  showSearchDropdown: boolean,
  fullPath: Array<string>,
  loading: boolean,
}

export default class KeywordsField extends React.Component<KeywordPickerProps, KeywordPickerState> {
  defaultMarginTop = 0
  defaultMarginLeft = 0

  constructor(props: KeywordPickerProps) {
    super(props)
    const { formData = [] } = props
    this.state = {
      value: formData,
      selectedKeywords: [],
      currentList: [],
      disableAddKeywordBtn: true,
      finalSelectedKeywords: [],
      finalSelectedValue: '',
      fullPath: [],
      showSearchDropdown: false,
      loading: false
    }
  }

  componentDidMount() {
    const { uiSchema, registry } = this.props
    const { formContext } = registry
    const { editor } = formContext
    const keywords = uiSchema['ui:keywords']
    if (keywords) {
      this.initializeKeywords(keywords)
      this.setState({ loading: false })
    } else {
      const service = uiSchema['ui:service'] as MetadataService
      const keywordScheme = uiSchema['ui:keyword_scheme']
      const keywordSchemeColumnNames = uiSchema['ui:keyword_scheme_column_names']
      this.setState({ loading: true }, () => {
        const initalValue = uiSchema['ui:picker_title']
        service.fetchCmrKeywords(keywordScheme).then((keywords: any) => {
          const intitalKeyword = keywordSchemeColumnNames.at(0)
          const keywordObject = {}
          keywordObject[intitalKeyword] = [{ value: initalValue, subfields: [keywordSchemeColumnNames.at(1)], ...keywords }]
          const filter = uiSchema['ui:filter'] as (path: string[]) => boolean
          let paths = parseCmrResponse(keywordObject, keywordSchemeColumnNames)
          if (filter) {
            paths = paths.filter(filter)
          }
          this.initializeKeywords(paths)
          this.setState({ loading: false })
        })
          .catch(() => {
            editor.status = new Status('warning', 'Error retrieving keywords.')
          })
      })
    }
  }

  initializeKeywords(keywords: any) {
    const { formData = [] } = this.props
    const fullPath: Array<string> = []
    const currList: Array<string> = []
    const selectedKeywords: Array<string> = []
    keywords.forEach((keyword: Array<string>) => {
      if (!currList.includes(keyword[1])) {
        currList.push(keyword[1])
      }
    })
    selectedKeywords.push(keywords[0][0])

    // creates a fullPath arrray with a > sperator
    keywords.forEach((keyword: Array<string>) => {
      const join = keyword.join('>')
      fullPath.push(join)
    })

    this.setState({
      value: formData,
      selectedKeywords,
      currentList: currList,
      disableAddKeywordBtn: true,
      finalSelectedKeywords: [],
      finalSelectedValue: '',
      fullPath,
      showSearchDropdown: false
    })
  }

  // When the user wants to navigate to the previous section this function sets the margins so the picker
  // is centered and navigates the user to the previous section.
  selectPrevious(item: string) {
    const { selectedKeywords, finalSelectedKeywords } = this.state
    let index = selectedKeywords.indexOf(item)
    if (index === 0) {
      index = 1
    }
    const tempItem = selectedKeywords[index - 1]
    selectedKeywords.splice(index - 1)
    this.setState({ selectedKeywords, finalSelectedKeywords, showSearchDropdown: false }, () => { this.selectItem(tempItem) })
  }

  // This is a helper function that will get the children for the current path
  // Example:
  //    parent: Tool Keyword > Earth Science Services > DATA ANALYSIS AND VISUALIZATION > CALIBRATION/VALIDATION
  //    previousSelected: Tool Keyword > Earth Science Services
  //    In this case the function will return [DATA ANALYSIS AND VISUALIZATION  CALIBRATION/VALIDATION]
  getChildren(fullSelectedPath: string) {
    const { fullPath } = this.state

    const updatedList: Array<string> = []

    fullPath.forEach((value: string) => {
      if (value.startsWith(fullSelectedPath)) {
        let editPath = value.replace(`${fullSelectedPath}`, '')
        if (editPath.startsWith('>')) {
          editPath = editPath.substring(1)
        }
        const toArray = editPath.split('>')
        const keyword = toArray.at(0)
        if (keyword.length > 0 && !updatedList.includes(keyword)) {
          updatedList.push(toArray.at(0))
        }
      }
    })
    return updatedList
  }

  isLeaf(fullSelectedPath: string) {
    return this.getChildren(fullSelectedPath).length === 0
  }

  // This is a helper function that joins the selected path with a '>' seprator
  getFullSelectedPath(item: string) {
    const { selectedKeywords } = this.state
    const copy = _.cloneDeep(selectedKeywords)
    copy.push(item)
    return copy.join('>')
  }

  // This gets called when a parent element is clicked to get the next set of element.
  // Example: if EARTH SCIENCE SERVICES is clicked
  //            returns [DATA ANALYSIS AND VISUALIZATION, DATA MANAGEMENT/DATA HANDLING]
  selectItem(item: string) {
    const {
      selectedKeywords
    } = this.state
    let updatedList: Array<string> = []
    const fullSelectedPath = this.getFullSelectedPath(item)

    updatedList = this.getChildren(fullSelectedPath)
    selectedKeywords.push(item)

    this.setState({
      currentList: updatedList,
      selectedKeywords,
      finalSelectedValue: '',
      finalSelectedKeywords: [],
      disableAddKeywordBtn: true
    })
  }

  displayItems(item: string) {
    const fullSelectedPath = this.getFullSelectedPath(item)
    const hasChildren = this.isLeaf(fullSelectedPath)

    const { finalSelectedValue } = this.state
    if (hasChildren) {
      if (item === finalSelectedValue) {
        return (
          <a
            className="final-option-selected"
            data-testid={`tool-keyword__final-option-selected--${kebabCase(item)}`}
            onClick={() => this.setState({ finalSelectedValue: '', finalSelectedKeywords: [], disableAddKeywordBtn: true })}
          >
            {' '}
            {item}
          </a>
        )
      }
      return (
        <a
          className="final-option"
          data-testid={`tool-keyword__final-option--${kebabCase(item)}`}
          onClick={() => this.createKeywordList(item)}
        >
          {' '}
          {item}
        </a>
      )
    }
    return (
      <a
        className="item.parent"
        data-testid={`tool-keyword__parent-item--${item}`}
        onClick={() => this.selectItem(item)}
      >
        {' '}
        {item}
      </a>
    )
  }

  createKeywordList(item: string) {
    const { finalSelectedKeywords, selectedKeywords } = this.state
    selectedKeywords.forEach((element: string) => {
      finalSelectedKeywords.push(element)
    })
    finalSelectedKeywords.push(item)
    this.setState({ finalSelectedValue: item, finalSelectedKeywords, disableAddKeywordBtn: false })
  }

  isKeywordAdded(keyword: Array<string>) {
    let { formData } = this.props
    let found = false
    if (!formData) {
      formData = []
    }
    formData.forEach((item: any) => {
      if (Object.values(item).join('>').includes(keyword.join('>'))) {
        found = true
      }
    })
    return found
  }

  // This is a helper function that will add the selected keywords in the desired format
  // Example: "ToolCategory": "EARTH SCIENCE SERVICES",
  //          "ToolTopic": "DATA ANALYSIS AND VISUALIZATION",
  //          "ToolTerm": "CALIBRATION/VALIDATION"
  addKeywords(finalSelectedKeywords: any) {
    const found = this.isKeywordAdded(finalSelectedKeywords)
    const { uiSchema } = this.props
    const schemaValues = uiSchema['ui:scheme_values']
    const map: { [key: string]: string } = {}
    if (found) {
      return null
    }

    schemaValues.forEach((item: string) => {
      map[item] = null
    })
    Object.keys(map).forEach((item, index) => {
      map[item] = finalSelectedKeywords[index]
    })
    return map
  }

  clickSelectedItem(text: any) {
    const { fullPath } = this.state
    const { value } = this.state
    const { onChange } = this.props
    const split: string[] = text.toString().split('>')

    // fullPath state variable will have the complete list of all of the keyword variation
    // This is needed beacuse if the user searches inside a level, the paths state variable will only have values that level down.
    // Therefore, having a complete list of all keyword variation allows us to find the user seletect value and add it to formData
    const filter = fullPath.filter((path) => path.indexOf(split[split.length - 1]) !== -1)

    const filterArr: string[] = filter[0].toString().split('>').slice(1)
    const keywords = this.addKeywords(filterArr)
    if (keywords) {
      value.push(keywords)
    }
    this.setState(value, () => onChange(value))
    this.setState({ showSearchDropdown: false })
  }

  // This is a helper function that filter the list of keyword for Search Keyword typeahead.
  filterKeywords(path: string) {
    const { selectedKeywords } = this.state
    const filteredPath: Array<string> = []
    const joinedPath = selectedKeywords.join('>')
    if (path.startsWith(joinedPath)) {
      const replace = path.replace(`${joinedPath}>`, '')
      filteredPath.push(replace)
    }
    return filteredPath
  }

  render() {
    const {
      selectedKeywords, currentList, disableAddKeywordBtn, finalSelectedKeywords, fullPath, showSearchDropdown, value, loading
    } = this.state
    let marginTop = this.defaultMarginTop
    let marginLeft = this.defaultMarginLeft
    const {
      formData = [],
      onChange,
      schema,
      uiSchema,
      required
    } = this.props
    const { description } = schema
    const title = uiSchema['ui:title']
    const headerClassName = uiSchema['ui:header-classname'] ? uiSchema['ui:header-classname'] : 'h2-title'
    // checks if the Draft is empty, if yes then, removes the empty object
    if (JSON.stringify(formData[0]) === '{}') {
      formData.splice(0)
    }

    const searchResult: Array<string> = []
    fullPath.forEach((keyword: string) => {
      const path: Array<string> = this.filterKeywords(keyword)
      if (path.length > 0) {
        searchResult.push(path.at(0))
      }
    })

    marginTop -= (50 * (selectedKeywords.length - 1))
    marginLeft += (50 * (selectedKeywords.length - 1))

    return (
      <div id="keyword-picker">
        <div>
          <div className="h2-box">
            <span className={headerClassName}>
              {title}
              {required ? <i className="eui-icon eui-required-o required-icon" /> : ''}
            </span>
          </div>
          <div>
            <span className="description-box">
              {description}
            </span>
          </div>
        </div>
        <div className="added-keywords" data-testid="added-tool-keywords">
          {
            Object.values(formData).map((item: object, index: number) => (
              <li key={JSON.stringify(Object.values(item))}>
                {Object.values(item).join(' > ')}
                <a
                  onClick={() => this.setState(value.splice(index, 1), () => onChange(value))}
                  data-testid={`tool-keyword__added-keyword--${index}`}
                >
                  <i className="fa fa-times-circle remove-button" />
                </a>
              </li>
            ))

          }
        </div>
        <div>
          <div className="eui-nested-item-picker" style={{ marginLeft }}>
            <ul className="eui-item-path">
              {
                selectedKeywords.map((item: string) => (
                  <li key={item}>
                    <a
                      data-testid={`tool-keyword__select-previous--${kebabCase(item)}`}
                      onClick={() => this.selectPrevious(item)}
                    >
                      {item}
                    </a>
                  </li>
                ))
              }
            </ul>
            <div className="eui-item-list-pane" style={{ marginTop }}>
              <div id="search-keywords" data-testid="tool-keyword__search-keyword-field">
                <Typeahead
                  id="typeahead"
                  placeholder={loading ? 'Fetching Keywords...' : 'Search for Keywords...'}
                  onChange={(text) => (text.length > 0 ? this.clickSelectedItem(text) : null)}
                  options={searchResult}
                  clearButton
                  isLoading={loading}
                  onInputChange={(text) => {
                    if (text === '') {
                      this.setState({ showSearchDropdown: false })
                    } else {
                      this.setState({ showSearchDropdown: true })
                    }
                  }}
                  className="typeahead"
                  open={showSearchDropdown}
                  onBlur={() => this.setState({ showSearchDropdown: false })}
                />
              </div>
              <ul>
                {
                  currentList.map((item: string) => (
                    <li key={item}>{this.displayItems(item)}</li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
        <Button
          className="eui-btn--blue add-science-keyword"
          data-testid="tool-keyword__add-keyword-btn"
          disabled={disableAddKeywordBtn}
          onClick={() => {
            const keywords = this.addKeywords(finalSelectedKeywords.splice(1))
            if (keywords) {
              value.push(keywords)
            }
            this.setState(value, () => onChange(value))
            this.setState({ finalSelectedKeywords: [], finalSelectedValue: '', disableAddKeywordBtn: true })
          }}
        >
          <span className="add-button-icon">
            <i className="fa-solid fa-circle-plus fa-sm" />
          </span>
          Add Keyword
        </Button>
      </div>
    )
  }
}
