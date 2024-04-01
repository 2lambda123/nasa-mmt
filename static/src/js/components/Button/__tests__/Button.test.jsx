import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaStar } from 'react-icons/fa'

import Button from '../Button'

vi.mock('react-icons/fa')

const setup = (overrideProps = {}) => {
  const props = {
    onClick: vi.fn(),
    ...overrideProps
  }

  render(
    <Button {...props}>
      Click me!
    </Button>
  )

  return {
    props,
    user: userEvent.setup()
  }
}

describe('Button', () => {
  describe('when the button has children', () => {
    test('renders the button', () => {
      setup()

      expect(screen.getByText('Click me!')).toBeInTheDocument()
    })
  })

  describe('when the button has an icon', () => {
    beforeEach(() => {
      FaStar.mockImplementation(
        vi.importActual('react-icons/fa').FaStar
      )
    })

    test('renders the icon', () => {
      setup({
        Icon: FaStar,
        iconTitle: 'Star'
      })

      expect(FaStar).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('img', { name: 'Star' })).toBeInTheDocument()
    })

    test('has the correct margin', () => {
      setup({
        Icon: FaStar,
        iconTitle: 'Star'
      })

      const icon = screen.getByRole('img', { name: 'Star' })
      expect(icon).toHaveClass('me-1')
    })

    describe('when rendered in a large button', () => {
      test('has the correct margin', () => {
        setup({
          Icon: FaStar,
          iconTitle: 'Star',
          size: 'lg'
        })

        const icon = screen.getByRole('img', { name: 'Star' })
        expect(icon).toHaveClass('me-2')
      })
    })
  })

  describe('when the button is clicked', () => {
    test('executes onClick callback', async () => {
      const { props, user } = setup()

      await user.click(screen.getByRole('button'))

      expect(props.onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('when set the specified size and variant to the button', () => {
    test('applies to the button', () => {
      setup({
        size: 'lg',
        variant: 'danger'
      })

      const button = screen.getByRole('button')

      expect(button).toHaveClass('btn-lg')
      expect(button).toHaveClass('btn-danger')
    })
  })

  describe('when set naked prop is true to the button', () => {
    test('applies naked style to the button', () => {
      setup({
        naked: true
      })

      const button = screen.getByRole('button')

      expect(button).toHaveClass('button--naked')
    })
  })
})
