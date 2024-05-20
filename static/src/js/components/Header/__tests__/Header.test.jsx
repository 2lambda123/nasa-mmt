import React from 'react'
import {
  render,
  screen,
  waitFor
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing'

import Header from '../Header'
import AppContext from '../../../context/AppContext'
import { providerResults } from './__mocks__/providerResults'

vi.mock('react-router-dom', async () => ({
  ...await vi.importActual('react-router-dom'),
  useNavigate: vi.fn()
}))

const setup = ({
  overrideMocks,
  overrideContext = {},
  overrideInitalEntries = ['/'],
  loggedIn = false
} = {}) => {
  const mocks = [
    providerResults
  ]

  let defaultUser = {}

  if (loggedIn) {
    let expires = new Date()
    expires.setMinutes(expires.getMinutes() + 15)
    expires = new Date(expires)

    defaultUser = {
      name: 'User Name',
      providerId: 'MMT_2',
      token: {
        tokenValue: 'ABC-1',
        tokenExp: expires
      }
    }
  }

  const context = {
    user: defaultUser,
    login: vi.fn(),
    logout: vi.fn(),
    setProviderId: vi.fn(),
    ...overrideContext
  }
  render(
    <AppContext.Provider value={context}>
      <MockedProvider
        mocks={overrideMocks || mocks}
      >
        <MemoryRouter initialEntries={[...overrideInitalEntries]}>
          <Routes>
            <Route path="/" element={<Header />} />
            <Route path="/:type" element={<Header />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </AppContext.Provider>
  )

  return {
    context,
    user: userEvent.setup()
  }
}

describe('Header component', () => {
  test('displays the NASA Earthdata MMT logo', () => {
    setup()

    expect(screen.getByText('Metadata Management Tool')).toBeInTheDocument()
    expect(screen.getByText('Metadata Management Tool')).toHaveClass('nasa')
    expect(screen.getByText('Metadata Management Tool').textContent).toEqual('EarthdataMetadata Management Tool')
  })

  describe('when the user is logged out', () => {
    test('shows the log in button', () => {
      setup()

      const button = screen.getByRole('button', { name: /Log in with Launchpad/ })
      expect(button).toBeInTheDocument()
    })

    describe('when the login button is clicked', () => {
      test('calls the login function on the context', async () => {
        const { context } = setup()

        const user = userEvent.setup()
        const button = screen.getByRole('button', { name: /Log in with Launchpad/ })

        await user.click(button)

        expect(context.login).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('when the user is logged in', () => {
    let expires = new Date()
    expires.setMinutes(expires.getMinutes() + 15)
    expires = new Date(expires)

    beforeEach(async () => {
      vi.clearAllMocks()
    })

    test('displays the user name badge', () => {
      setup({
        overrideContext: {
          user: {
            name: 'User Name',
            token: {
              tokenValue: 'ABC-1',
              tokenExp: expires.valueOf()
            },
            providerId: 'MMT_2'
          },
          login: vi.fn(),
          logout: vi.fn()
        }
      })

      expect(screen.getByText('User Name')).toBeInTheDocument()
      expect(screen.getByText('User Name').className).toContain('badge')
    })

    test('displays the search form', () => {
      setup({
        overrideContext: {
          user: {
            name: 'User Name',
            token: {
              tokenValue: 'ABC-1',
              tokenExp: expires.valueOf()
            },
            providerId: 'MMT_2'
          },
          login: vi.fn(),
          logout: vi.fn()
        }
      })

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Enter a search term')
    })

    test('displays the search submit button', () => {
      setup({
        overrideContext: {
          user: {
            name: 'User Name',
            token: {
              tokenValue: 'ABC-1',
              tokenExp: expires.valueOf()
            },
            providerId: 'MMT_2'
          },
          login: vi.fn(),
          logout: vi.fn()
        }
      })

      expect(screen.getByRole('button', { name: 'Search Collections' })).toBeInTheDocument()
    })

    test('does not display the search options dropdown', () => {
      setup({
        overrideContext: {
          user: {
            name: 'User Name',
            token: {
              tokenValue: 'ABC-1',
              tokenExp: expires.valueOf()
            },
            providerId: 'MMT_2'
          },
          login: vi.fn(),
          logout: vi.fn()
        }
      })

      expect(screen.getByText('Search Collections')).not.toHaveClass('show')
    })

    describe('when the search submit dropdown button is clicked', () => {
      test('displays the search submit button', async () => {
        const user = userEvent.setup()

        setup({
          overrideContext: {
            user: {
              name: 'User Name',
              token: {
                tokenValue: 'ABC-1',
                tokenExp: expires.valueOf()
              },
              providerId: 'MMT_2'
            },
            login: vi.fn(),
            logout: vi.fn()
          }
        })

        const searchOptionsButton = screen.queryByRole('button', { name: 'Search Options' })

        await user.click(searchOptionsButton)

        expect(searchOptionsButton).toHaveAttribute('aria-expanded', 'true')
      })
    })

    describe('when the user types a search query', () => {
      test('updates the input', async () => {
        const user = userEvent.setup()

        setup({
          overrideContext: {
            user: {
              name: 'User Name',
              token: {
                tokenValue: 'ABC-1',
                tokenExp: expires.valueOf()
              },
              providerId: 'MMT_2'
            },
            login: vi.fn(),
            logout: vi.fn()
          }
        })

        const searchInput = await screen.getByRole('textbox', { name: 'Search' })

        await user.type(searchInput, 'search query')

        expect(searchInput).toHaveValue('search query')
      })

      describe('when the user submits search query using the input', () => {
        test('updates the input', async () => {
          const navigateMock = vi.fn()

          useNavigate.mockReturnValue(navigateMock)

          const user = userEvent.setup()

          setup({
            overrideContext: {
              user: {
                name: 'User Name',
                token: {
                  tokenValue: 'ABC-1',
                  tokenExp: expires.valueOf()
                },
                providerId: 'MMT_2'
              },
              login: vi.fn(),
              logout: vi.fn()
            }
          })

          const searchInput = await screen.getByRole('textbox', { name: 'Search' })
          const searchSubmitButton = await screen.getByRole('button', { name: 'Search Collections' })

          await user.type(searchInput, 'search query')

          expect(searchInput).toHaveValue('search query')

          await user.click(searchSubmitButton)

          expect(navigateMock).toHaveBeenCalledTimes(1)
          expect(navigateMock).toHaveBeenCalledWith('/collections?keyword=search+query')
        })
      })

      // TODO MMT-3615 - The "enter" keypress is not bubbling up to the Form. It appears this is
      // not the expected behavior and the event should bubble up and the submission should be able
      // to be verified.
      // describe('when the user submits search query using the enter key', () => {
      //   test('updates the input', async () => {
      //     const navigateMock = vi.fn()

      //     useNavigate.mockReturnValue(navigateMock)

      //     const user = userEvent.setup()
      //     const searchInput = await screen.getByRole('textbox', { name: 'Search' })

      //     await user.type(searchInput, 'search query{enter}')

      //     await waitFor(() => {
      //       expect(navigateMock).toHaveBeenCalledTimes(1)
      //       expect(navigateMock).toHaveBeenCalledWith('/search?type=collections&keyword=search+query')
      //     })
      //   })
      // })
    })
  })

  describe('when the clicks log out', () => {
    test('displays the search submit button', async () => {
      let expires = new Date()
      expires.setMinutes(expires.getMinutes() + 15)
      expires = new Date(expires)

      const { context } = setup({
        overrideContext: {
          user: {
            name: 'User Name',
            token: {
              tokenValue: 'ABC-1',
              tokenExp: expires.valueOf()
            }
          },
          login: vi.fn(),
          logout: vi.fn()
        }
      })

      const user = userEvent.setup()

      const userDropdownButton = screen.queryByRole('button', { name: 'User Name' })

      await user.click(userDropdownButton)

      const logoutButton = screen.queryByRole('button', { name: 'Logout' })

      await user.click(logoutButton)

      expect(context.logout).toHaveBeenCalledTimes(1)
      expect(context.logout).toHaveBeenCalledWith()
    })
  })

  describe('when a search type is defined', () => {
    beforeEach(async () => {
      vi.clearAllMocks()
    })

    test('shows sets the search type in the button', async () => {
      setup({
        loggedIn: true,
        overrideInitalEntries: ['/services']
      })

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Search Services' })).toBeInTheDocument()
      })
    })

    describe('when the button is clicked', () => {
      test('performs the correct search', async () => {
        const navigateMock = vi.fn()

        useNavigate.mockReturnValue(navigateMock)

        const { user } = setup({
          loggedIn: true,
          overrideInitalEntries: ['/services']
        })

        const button = screen.queryByRole('button', { name: 'Search Services' })

        await user.click(button)

        expect(navigateMock).toHaveBeenCalledTimes(1)
        expect(navigateMock).toHaveBeenCalledWith('/services?keyword=')
      })

      describe('when the a user has a search query', () => {
        test('performs the correct search', async () => {
          const navigateMock = vi.fn()

          useNavigate.mockReturnValue(navigateMock)

          const { user } = setup({
            loggedIn: true,
            overrideInitalEntries: ['/services']
          })

          const searchInput = await screen.getByRole('textbox', { name: 'Search' })

          await user.type(searchInput, 'service search query')

          const button = screen.queryByRole('button', { name: 'Search Services' })

          await user.click(button)

          expect(navigateMock).toHaveBeenCalledTimes(1)
          expect(navigateMock).toHaveBeenCalledWith('/services?keyword=service+search+query')
        })
      })
    })
  })

  describe('when setting the search type', () => {
    beforeEach(async () => {
      vi.clearAllMocks()
    })

    test('selects the search type', async () => {
      const navigateMock = vi.fn()

      useNavigate.mockReturnValue(navigateMock)

      const { user } = setup({
        loggedIn: true
      })

      const searchOptionsButton = screen.queryByRole('button', { name: 'Search Options' })

      await user.click(searchOptionsButton)

      const variableRadio = screen.queryByRole('radio', { name: 'Variables' })
      const variableLabel = screen.queryByText('Variables')

      await user.click(variableLabel)

      await waitFor(() => {
        expect(variableRadio).toHaveProperty('checked', true)
      })

      const button = screen.queryByRole('button', { name: 'Search Variables' })

      await user.click(button)

      expect(navigateMock).toHaveBeenCalledTimes(1)
      expect(navigateMock).toHaveBeenCalledWith('/variables?keyword=')
    })

    describe('when submitting the search', () => {
      test('sets the search type', async () => {
        const { user } = setup({
          loggedIn: true
        })

        const searchOptionsButton = screen.queryByRole('button', { name: 'Search Options' })

        await user.click(searchOptionsButton)

        const variableRadio = screen.queryByRole('radio', { name: 'Variables' })
        const variableLabel = screen.queryByText('Variables')

        await user.click(variableLabel)

        await waitFor(() => {
          expect(variableRadio).toHaveProperty('checked', true)
          expect(screen.queryByRole('button', { name: 'Search Variables' })).toBeInTheDocument()
        })
      })
    })
  })

  describe('when setting the provider', () => {
    test('selects the search provider select', async () => {
      const { user } = setup({
        loggedIn: true,
        overrideInitalEntries: ['/?provider=TESTPROV']
      })

      const searchOptionsButton = screen.queryByRole('button', { name: 'Search Options' })

      await user.click(searchOptionsButton)

      const providerDropdown = screen.getByRole('combobox')

      await waitFor(() => {
        expect(providerDropdown).toHaveValue('TESTPROV')
      })
    })

    test('selects the provider', async () => {
      const { user } = setup({
        loggedIn: true
      })

      const searchOptionsButton = screen.queryByRole('button', { name: 'Search Options' })

      await user.click(searchOptionsButton)

      const providerDropdown = screen.getByRole('combobox')

      await userEvent.selectOptions(providerDropdown, ['TESTPROV2'])

      expect(screen.getByRole('option', { name: 'TESTPROV2' }).selected).toBe(true)
      expect(screen.getByRole('option', { name: 'TESTPROV' }).selected).toBe(false)
      expect(screen.getByRole('option', { name: 'TESTPROV3' }).selected).toBe(false)
    })

    describe('when submitting the search', () => {
      test('sets the provider', async () => {
        const navigateMock = vi.fn()

        useNavigate.mockReturnValue(navigateMock)

        const { user } = setup({
          loggedIn: true
        })

        const searchOptionsButton = screen.queryByRole('button', { name: 'Search Options' })

        await user.click(searchOptionsButton)

        const providerDropdown = screen.getByRole('combobox')

        await userEvent.selectOptions(providerDropdown, ['TESTPROV2'])

        await waitFor(() => {
          expect(screen.getByRole('option', { name: 'TESTPROV2' }).selected).toBe(true)
        })

        const button = screen.queryByRole('button', { name: 'Search Collections' })

        await user.click(button)

        await waitFor(() => {
          expect(navigateMock).toHaveBeenCalledTimes(1)
          expect(navigateMock).toHaveBeenCalledWith('/collections?keyword=&provider=TESTPROV2')
        })
      })
    })
  })
})
