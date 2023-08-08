import React from 'react'
import {
  render, screen, waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  BrowserRouter, MemoryRouter, Route, Routes
} from 'react-router-dom'
import CustomTextWidget from '../CustomTextWidget'
import UmmToolsModel from '../../../model/UmmToolsModel'
import MetadataEditor from '../../../MetadataEditor'
import MetadataEditorForm from '../../MetadataEditorForm'

describe('Custom Text Widget Component', () => {
  it('renders the custom Text widget when required field with title', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const props = {
      label: 'my test data label',
      registry: {
        formContext: { editor }
      },
      id: 'my_title',
      required: true,
      schema: {
        maxLength: 10
      },
      onChange: {}
    }
    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    const headerElement = getByTestId('custom-text-widget__my-test-data-label--text-header')

    expect(headerElement).toHaveTextContent('My Test Data Label0/10')
    expect(headerElement).toHaveTextContent('0/10')
    expect(container).toMatchSnapshot()
  })

  it('renders the custom text widget when not required field with no title', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const props = {
      label: 'my test data label',
      required: false,
      registry: {
        formContext: { editor }
      },
      id: 'mock_id',
      schema: {
        maxLength: 10
      },
      onChange: {}
    }
    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    const headerElement = getByTestId('custom-text-widget__my-test-data-label--text-header')

    expect(headerElement).not.toHaveTextContent('my test data label*')
    expect(headerElement).toHaveTextContent('0/10')
    expect(container).toMatchSnapshot()
  })

  it('renders the custom Text area widget when required field then there is no title', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const props = {
      label: 'my test data label',
      registry: {
        formContext: { editor }
      },
      id: 'my_title',
      required: true,
      schema: {
        maxLength: 10
      },
      onChange: {}
    }

    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    expect(getByTestId('custom-text-widget__my-test-data-label--text-header')).toHaveTextContent('My Test Data Label0/10')
    expect(container).toMatchSnapshot()
  })

  it('renders the custom Text area widget value is null', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const props = {
      label: 'my test data label',
      registry: {
        formContext: { editor }
      },
      id: 'my_title',
      required: true,
      schema: {
        maxLength: 10
      },
      onChange: {},
      value: null
    }

    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    expect(getByTestId('custom-text-widget__my-test-data-label--text-header')).toHaveTextContent('My Test Data Label0/10')
    expect(container).toMatchSnapshot()
  })

  it('Make sure inputted text is shorter than max length', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const mockedOnChange = jest.fn()
    const props = {
      label: 'my test data label',
      registry: {
        formContext: { editor }
      },
      id: 'my_title',
      required: false,
      schema: {
        maxLength: 20
      },
      onChange: mockedOnChange,
      value: 'Tuesday'
    }
    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    const inputElement = getByTestId('custom-text-widget__my-test-data-label--text-input')
    const headerElement = getByTestId('custom-text-widget__my-test-data-label--text-header')
    await waitFor(async () => {
      expect(inputElement.value).toBe('Tuesday')
      userEvent.clear(inputElement)
      userEvent.type(inputElement, 'test@mail.com')
      expect(inputElement.value).toBe('test@mail.com')
      expect(headerElement).toHaveTextContent('13/20')
      userEvent.type(inputElement, '1234567890')
      expect(inputElement.value).toBe('test@mail.com1234567')
      expect(headerElement).toHaveTextContent('20/20')
    })
    expect(container).toMatchSnapshot()
  })

  it('Type number input', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const mockedOnChange = jest.fn()
    const props = {
      label: 'my test data label',
      registry: {
        formContext: { editor }
      },
      id: 'my_title',
      required: false,
      schema: {
        maxLength: 20
      },
      onChange: mockedOnChange,
      value: '1234.56',
      uiSchema: {
        'ui:type': 'number'
      }
    }
    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    const inputElement = getByTestId('custom-text-widget__my-test-data-label--text-input')

    await waitFor(async () => {
      expect(inputElement.value).toBe('1234.56')
      userEvent.clear(inputElement)
      userEvent.type(inputElement, 'abcdef')
      expect(inputElement.value).toBe('')
      expect(container).toMatchSnapshot()
    })
  })

  test('should call onChange on a first character', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    const mockedOnChange = jest.fn()
    const props = {
      label: 'my test data label',
      registry: {
        formContext: { editor }
      },
      id: 'my_title',
      required: false,
      schema: {
        maxLength: 20
      },
      onChange: mockedOnChange
    }

    const { getByTestId, container } = render(
      <BrowserRouter>
        <CustomTextWidget {...props} />
      </BrowserRouter>
    )
    const inputElement = getByTestId('custom-text-widget__my-test-data-label--text-input')
    const headerElement = getByTestId('custom-text-widget__my-test-data-label--text-header')
    await waitFor(async () => {
      expect(inputElement).toBeDefined()
      expect(inputElement).not.toBeNull()
      expect(mockedOnChange).toHaveBeenCalledTimes(0)
      userEvent.type(inputElement, 'test@mail.com')
      expect(mockedOnChange).toHaveBeenCalledWith('test@mail.com')
      userEvent.type(inputElement, 'abc')
      expect(mockedOnChange).toHaveBeenCalledWith('test@mail.comabc')
      expect(mockedOnChange).toHaveBeenCalledTimes(16)
      expect(headerElement).toHaveTextContent('16/20')
    })
    expect(container).toMatchSnapshot()
  })

  test('testing autofocus for a custom text widget', async () => {
    const model = new UmmToolsModel()
    const editor = new MetadataEditor(model)
    HTMLElement.prototype.scrollIntoView = jest.fn()
    const { container } = render(
      <MemoryRouter initialEntries={['/tool_drafts/2/edit/Tool_Information']}>
        <Routes>
          <Route path="/tool_drafts/:id/edit/:sectionName" element={<MetadataEditorForm editor={editor} />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(async () => {
      screen.queryByTestId('error-list-item__name').click()
      userEvent.tab()
    })
    expect(container).toHaveTextContent('The name of the downloadable tool or web user interface.')
    expect(container).toMatchSnapshot()
  })

  test('testing autofocus against array section', async () => {
    const model = new UmmToolsModel()
    model.fullData = {
      PotentialAction: {
        Target: {
          ResponseContentType: [
            'response content type'
          ],
          HttpMethod: [
            'GET'
          ],
          Type: 'EntryPoint',
          Description: 'target description',
          UrlTemplate: 'url template'
        },
        Type: 'SearchAction'
      }
    }
    const editor = new MetadataEditor(model)
    editor.setFocusField('PotentialAction_Target_ResponseContentType')
    HTMLElement.prototype.scrollIntoView = jest.fn()
    const { container } = render(
      <MemoryRouter initialEntries={['/tool_drafts/2/edit/Potential_Action']}>
        <Routes>
          <Route path="/tool_drafts/:id/edit/:sectionName" element={<MetadataEditorForm editor={editor} />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(async () => {
      expect(HTMLElement.prototype.scrollIntoView).toBeCalled()
    })
    expect(container).toMatchSnapshot()
  })

  test('testing autofocus with an illegal array section', async () => {
    const model = new UmmToolsModel()
    model.fullData = {
      PotentialAction: {
        Target: {
          ResponseContentType: [
            'response content type'
          ],
          HttpMethod: [
            'GET'
          ],
          Type: 'EntryPoint',
          Description: 'target description',
          UrlTemplate: 'url template'
        },
        Type: 'SearchAction'
      }
    }
    const editor = new MetadataEditor(model)
    editor.setFocusField('PotentialAction_Target_IllegalFieldName')
    HTMLElement.prototype.scrollIntoView = jest.fn()
    const { container } = render(
      <MemoryRouter initialEntries={['/tool_drafts/2/edit/Potential_Action']}>
        <Routes>
          <Route path="/tool_drafts/:id/edit/:sectionName" element={<MetadataEditorForm editor={editor} />} />
        </Routes>
      </MemoryRouter>
    )
    await waitFor(async () => {
      expect(HTMLElement.prototype.scrollIntoView).toBeCalledTimes(0)
    })
    expect(container).toMatchSnapshot()
  })
})
