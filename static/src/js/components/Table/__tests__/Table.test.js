import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Table from '../Table'

const setup = (overrideProps = {}) => {
  const props = {
    headers: [
      'column 1',
      'column 2'
    ],
    loading: false,
    data: [
      {
        key: 'conceptId001',
        cells: [
          {
            value: ('Row 1 Cell 1')
          },
          {
            value: ('Row 1 Cell 2')
          }
        ]
      },
      {
        key: 'conceptId002',
        cells: [
          {
            value: ('Row 2 Cell 1')
          },
          {
            value: ('Row 2 Cell 2')
          }
        ]
      }

    ],
    ...overrideProps
  }

  render(
    <Table {...props} />
  )

  return {
    props,
    user: userEvent.setup()
  }
}

describe('Table', () => {
  describe('when the table component is passed markup and data', () => {
    test('renders filled table', () => {
      setup()

      expect(screen.getByText('column 1')).toBeInTheDocument()
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Row 2 Cell 2')).toBeInTheDocument()
    })
  })

  describe('when the table component is passed a custom error mesage with no data', () => {
    test('renders custom error message', () => {
      setup({
        data: [],
        error: 'Custom Error Message'
      })

      expect(screen.getByText('Custom Error Message')).toBeInTheDocument()
    })
  })

  describe('when the table component is passed loading:true', () => {
    test('renders loading screen', () => {
      setup({
        loading: true
      })

      expect(screen.getByRole('table', { className: 'table table-striped' })).toBeInTheDocument()
      expect(screen.queryAllByRole('cell', { className: 'col-md-4' })).toHaveLength(4)
    })
  })
})
