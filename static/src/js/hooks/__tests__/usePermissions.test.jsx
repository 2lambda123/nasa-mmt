import React from 'react'
import { render, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'

import { GET_PERMISSIONS } from '@/js/operations/queries/getPermissions'

import AppContext from '@/js/context/AppContext'

import usePermissions from '../usePermissions'

const TestComponent = () => {
  const { hasSystemGroup, loading } = usePermissions({
    systemGroup: ['read']
  })

  return (
    <div>
      {
        loading && (
          <span>Loading</span>
        )
      }
      {
        hasSystemGroup && (
          <span>
            hasSystemGroup is true
          </span>
        )
      }
      {
        !hasSystemGroup && (
          <span>
            hasSystemGroup is false
          </span>
        )
      }
    </div>
  )
}

const setup = ({
  overrideMocks,
  user = { uid: 'mock-user' }
}) => {
  const mocks = [
    {
      request: {
        query: GET_PERMISSIONS,
        variables: {
          groupPermissionParams: {
            systemObject: 'GROUP',
            userId: 'mock-user'
          }
        }
      },
      result: {
        data: {
          groupPermissions: {
            count: 1,
            items: [
              {
                systemObject: 'GROUP',
                permissions: [
                  'read',
                  'create'
                ],
                __typename: 'Permission'
              }
            ],
            __typename: 'PermissionList'
          }
        }
      }
    }
  ]

  render(
    <AppContext.Provider value={
      {
        user
      }
    }
    >
      <MockedProvider
        mocks={overrideMocks || mocks}
      >
        <TestComponent />
      </MockedProvider>
    </AppContext.Provider>
  )
}

describe('usePermissions', () => {
  describe('systemGroup', () => {
    describe('when the user has the given permission', () => {
      test('returns true', async () => {
        setup({})

        expect(screen.getByText('Loading')).toBeInTheDocument()

        await waitForResponse()

        expect(screen.getByText('hasSystemGroup is true')).toBeInTheDocument()
        expect(screen.queryByText('hasSystemGroup is false')).not.toBeInTheDocument()
        expect(screen.queryByText('Loading')).not.toBeInTheDocument()
      })
    })

    describe('when the user does not have the given permission', () => {
      test('returns false', async () => {
        setup({
          overrideMocks: [
            {
              request: {
                query: GET_PERMISSIONS,
                variables: {
                  groupPermissionParams: {
                    systemObject: 'GROUP',
                    userId: 'mock-user'
                  }
                }
              },
              result: {
                data: {
                  groupPermissions: {
                    count: 1,
                    items: [
                      {
                        systemObject: 'GROUP',
                        permissions: [],
                        __typename: 'Permission'
                      }
                    ],
                    __typename: 'PermissionList'
                  }
                }
              }
            }
          ]
        })

        expect(screen.getByText('Loading')).toBeInTheDocument()

        await waitForResponse()

        expect(screen.queryByText('hasSystemGroup is true')).not.toBeInTheDocument()
        expect(screen.getByText('hasSystemGroup is false')).toBeInTheDocument()
        expect(screen.queryByText('Loading')).not.toBeInTheDocument()
      })
    })
  })

  describe('when the user is not logged in', () => {
    test('loading is set to false and the items are displayed', async () => {
      setup({
        overrideMocks: [],
        user: {}
      })

      expect(screen.queryByText('hasSystemGroup is true')).not.toBeInTheDocument()
      expect(screen.getByText('hasSystemGroup is false')).toBeInTheDocument()
      expect(screen.queryByText('Loading')).not.toBeInTheDocument()
    })
  })
})
