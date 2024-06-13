import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom'

import usePermissions from '@/js/hooks/usePermissions'

import AuthContext from '@/js/context/AuthContext'
import userEvent from '@testing-library/user-event'
import Layout from '../Layout'
import PrimaryNavigation from '../../PrimaryNavigation/PrimaryNavigation'

import * as getConfig from '../../../../../../sharedUtils/getConfig'

vi.mock('@/js/hooks/usePermissions')
vi.mock('../../Footer/Footer')
vi.mock('../../Header/Header')
vi.mock('../../PrimaryNavigation/PrimaryNavigation')

const setup = (loggedIn) => {
  vi.spyOn(getConfig, 'getUmmVersionsConfig').mockImplementation(() => ({
    ummC: 'mock-umm-c',
    ummS: 'mock-umm-s',
    ummT: 'mock-umm-t',
    ummV: 'mock-umm-v'
  }))

  vi.setSystemTime('2024-01-01')

  const now = new Date().getTime()

  const tokenExpires = loggedIn ? now + 1 : now - 1

  const context = {
    user: {
      name: 'User Name'
    },
    login: vi.fn(),
    tokenExpires
  }

  const user = userEvent.setup()

  render(
    <AuthContext.Provider value={context}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                (
                  <>
                    This is some content
                  </>
                )
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )

  return {
    user
  }
}

describe('Layout component', () => {
  test('renders the content to the React Router Outlet', async () => {
    usePermissions.mockReturnValue({ hasSystemGroup: true })

    setup()

    expect(screen.getByText('This is some content')).toBeInTheDocument()

    expect(usePermissions).toHaveBeenCalledTimes(1)
    expect(usePermissions).toHaveBeenCalledWith({
      systemGroup: ['read']
    })

    expect(PrimaryNavigation).toHaveBeenCalledTimes(1)
    expect(PrimaryNavigation).toHaveBeenCalledWith({
      items: [
        [
          {
            title: 'Collections',
            version: 'vmock-umm-c',
            children: [
              {
                title: 'All Collections',
                to: '/collections'
              },
              {
                to: '/drafts/collections',
                title: 'Drafts'
              },
              {
                to: '/templates/collections',
                title: 'Templates'
              },
              {
                title: 'Permissions',
                to: '/permissions'
              }
            ]
          },
          {
            title: 'Variables',
            version: 'vmock-umm-v',
            children: [
              {
                title: 'All Variables',
                to: '/variables'
              },
              {
                to: '/drafts/variables',
                title: 'Drafts'
              }
            ]
          },
          {
            title: 'Services',
            version: 'vmock-umm-s',
            children: [
              {
                title: 'All Services',
                to: '/services'
              },
              {
                to: '/drafts/services',
                title: 'Drafts'
              }
            ]
          },
          {
            title: 'Tools',
            version: 'vmock-umm-t',
            children: [
              {
                title: 'All Tools',
                to: '/tools'
              },
              {
                to: '/drafts/tools',
                title: 'Drafts'
              }
            ]
          },
          {
            title: 'Order Options',
            children: [
              {
                title: 'All Order Options',
                to: '/order-options'
              }
            ]
          },
          {
            title: 'Groups',
            children: [
              {
                title: 'All Groups',
                to: '/groups'
              }
            ]
          }
        ],
        [
          {
            title: 'Admin',
            visible: true,
            children: [
              {
                to: '/admin/groups',
                title: 'System Groups',
                visible: true
              }
            ]
          }
        ]
      ]
    }, {})
  })

  describe('when the user does not have system group permissions', () => {
    test('does not render the admin links', async () => {
      usePermissions.mockReturnValue({ hasSystemGroup: false })

      setup()

      expect(screen.getByText('This is some content')).toBeInTheDocument()

      expect(PrimaryNavigation).toHaveBeenCalledTimes(1)
      expect(PrimaryNavigation).toHaveBeenCalledWith({
        items: [
          [
            {
              title: 'Collections',
              version: 'vmock-umm-c',
              children: [
                {
                  title: 'All Collections',
                  to: '/collections'
                },
                {
                  to: '/drafts/collections',
                  title: 'Drafts'
                },
                {
                  to: '/templates/collections',
                  title: 'Templates'
                },
                {
                  title: 'Permissions',
                  to: '/permissions'
                }
              ]
            },
            {
              title: 'Variables',
              version: 'vmock-umm-v',
              children: [
                {
                  title: 'All Variables',
                  to: '/variables'
                },
                {
                  to: '/drafts/variables',
                  title: 'Drafts'
                }
              ]
            },
            {
              title: 'Services',
              version: 'vmock-umm-s',
              children: [
                {
                  title: 'All Services',
                  to: '/services'
                },
                {
                  to: '/drafts/services',
                  title: 'Drafts'
                }
              ]
            },
            {
              title: 'Tools',
              version: 'vmock-umm-t',
              children: [
                {
                  title: 'All Tools',
                  to: '/tools'
                },
                {
                  to: '/drafts/tools',
                  title: 'Drafts'
                }
              ]
            },
            {
              title: 'Order Options',
              children: [
                {
                  title: 'All Order Options',
                  to: '/order-options'
                }
              ]
            },
            {
              title: 'Groups',
              children: [
                {
                  title: 'All Groups',
                  to: '/groups'
                }
              ]
            }
          ],
          [
            {
              title: 'Admin',
              visible: false,
              children: [
                {
                  to: '/admin/groups',
                  title: 'System Groups',
                  visible: false
                }
              ]
            }
          ]
        ]
      }, {})
    })
  })
})
