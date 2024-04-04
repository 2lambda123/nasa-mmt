import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CustomDateTimeWidget from '../CustomDateTimeWidget'
import CustomWidgetWrapper from '../../CustomWidgetWrapper/CustomWidgetWrapper'

vi.mock('../../CustomWidgetWrapper/CustomWidgetWrapper')

const setup = (overrideProps = {}) => {
  const formContext = {
    focusField: '',
    setFocusField: vi.fn()
  }

  const props = {
    id: 'mock-id',
    label: 'Test field',
    onBlur: vi.fn(),
    onChange: vi.fn(),
    registry: {
      formContext
    },
    required: false,
    schema: {
      description: 'Test Description'
    },
    uiSchema: {},
    value: undefined,
    ...overrideProps
  }

  render(
    <CustomDateTimeWidget {...props} />
  )

  return {
    props,
    user: userEvent.setup()
  }
}

beforeEach(() => {
  CustomWidgetWrapper.mockImplementation(
    vi.importActual('../../CustomWidgetWrapper/CustomWidgetWrapper').default
  )
})

describe('CustomDateTimeWidget', () => {
  describe('when the field is required', () => {
    test('renders the dateTime widget with a required icon', () => {
      setup({
        required: true
      })

      expect(screen.getByRole('img', { name: 'Required' })).toBeInTheDocument()

      expect(CustomWidgetWrapper).toHaveBeenCalledTimes(1)
      expect(CustomWidgetWrapper).toHaveBeenCalledWith(expect.objectContaining({
        charactersUsed: null,
        maxLength: null,
        required: true,
        label: 'Test field',
        description: 'Test Description'
      }), {})
    })
  })

  describe('when a field is focused', () => {
    test('shows the field description', async () => {
      setup()

      const field = screen.getByPlaceholderText('YYYY-MM-DDTHH:MM:SSZ')

      await waitFor(async () => {
        field.focus()
      })

      expect(field).toHaveFocus()

      expect(CustomWidgetWrapper).toHaveBeenCalledTimes(2)
      expect(CustomWidgetWrapper).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Test Description'
      }), {})
    })
  })

  describe('when the field is blurred', () => {
    test('blurs the field', async () => {
      const { props } = setup()

      const field = screen.getByPlaceholderText('YYYY-MM-DDTHH:MM:SSZ')

      await waitFor(async () => {
        field.focus()
        field.blur()
      })

      expect(props.registry.formContext.setFocusField).toHaveBeenCalledTimes(1)
      expect(props.registry.formContext.setFocusField).toHaveBeenCalledWith(null)

      expect(props.onBlur).toHaveBeenCalledTimes(1)
      expect(props.onBlur).toHaveBeenCalledWith('mock-id')
    })
  })

  describe('when the field is changed', () => {
    test('calls onChange', async () => {
      const { props, user } = setup()

      const field = screen.getByPlaceholderText('YYYY-MM-DDTHH:MM:SSZ')

      await user.type(field, '1')

      expect(props.onChange).toHaveBeenCalledTimes(1)
      expect(props.onChange).toHaveBeenCalledWith('2001-01-01T00:00:00.000Z')
    })
  })

  describe('when the field has a custom title', () => {
    test('uses the schema title', () => {
      setup({
        uiSchema: {
          'ui:title': 'Schema Title'
        }
      })

      expect(CustomWidgetWrapper).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Schema Title')).toBeInTheDocument()
    })
  })

  describe('when the field should be focused', () => {
    test('shows the calender', async () => {
      setup({
        registry: {
          formContext: {
            focusField: 'mock-id'
          }
        }
      })

      // Checks if the widget is focused by checking if the description is present.
      await waitFor(() => {
        expect(CustomWidgetWrapper).toHaveBeenCalledTimes(2)
        expect(CustomWidgetWrapper).toHaveBeenCalledWith(expect.objectContaining({
          description: 'Test Description'
        }), {})
      })
    })
  })

  describe('When a date is already save in the form', () => {
    test('shows the date', () => {
      setup({
        value: '2023-12-05T00:00:00.000Z'
      })

      const field = screen.getByPlaceholderText('YYYY-MM-DDTHH:MM:SSZ')

      expect(field).toHaveValue('2023-12-05T00:00:00.000Z')
    })
  })
})