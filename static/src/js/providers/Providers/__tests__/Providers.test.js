import React from 'react'
import { render } from '@testing-library/react'
import { Cookies } from 'react-cookie'

import Providers from '../Providers'

import AppContextProvider from '../../AppContextProvider/AppContextProvider'
import NotificationsContextProvider from '../../NotificationsContextProvider/NotificationsContextProvider'

import encodeCookie from '../../../utils/encodeCookie'
import AuthContextProvider from '../../AuthContextProvider/AuthContextProvider'
import GraphQLProvider from '../../GraphQLProvider/GraphQLProvider'

global.fetch = jest.fn()

jest.mock('../../AuthContextProvider/AuthContextProvider', () => jest.fn(({ children }) => (
  <mock-Component data-testid="AuthContextProvider">
    {children}
  </mock-Component>
)))

jest.mock('../../GraphQLProvider/GraphQLProvider', () => jest.fn(({ children }) => (
  <mock-Component data-testid="GraphQLProvider">
    {children}
  </mock-Component>
)))

jest.mock('../../AppContextProvider/AppContextProvider', () => jest.fn(({ children }) => (
  <mock-Component data-testid="AppContextProvider">
    {children}
  </mock-Component>
)))

jest.mock('../../NotificationsContextProvider/NotificationsContextProvider', () => jest.fn(({ children }) => (
  <mock-Component data-testid="NotificationsContextProvider">
    {children}
  </mock-Component>
)))

describe('Providers', () => {
  test('renders all providers', () => {
    let expires = new Date()
    expires.setMinutes(expires.getMinutes() + 15)
    expires = new Date(expires)

    const cookie = new Cookies({
      loginInfo: encodeCookie({
        name: 'User Name',
        token: {
          tokenValue: 'ABC-1',
          tokenExp: expires
        },
        providerId: 'MMT_2'
      })
    })
    cookie.HAS_DOCUMENT_COOKIE = false

    render(
      <Providers>
        Test
      </Providers>
    )

    expect(AuthContextProvider).toHaveBeenCalledTimes(1)
    expect(AppContextProvider).toHaveBeenCalledTimes(1)
    expect(GraphQLProvider).toHaveBeenCalledTimes(1)
    expect(NotificationsContextProvider).toHaveBeenCalledTimes(1)
  })
})
