import { getApplicationConfig } from '../getConfig'
import refreshToken from '../refreshToken'
import * as getConfig from '../getConfig'

describe('refreshToken in production mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))

    vi.spyOn(getConfig, 'getApplicationConfig').mockImplementation(() => ({
      version: 'sit'
    }))

    const config = getApplicationConfig()
    config.version = 'test'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  global.fetch = vi.fn(() => Promise.resolve({
    headers: new Headers({
      token: 'new_token'
    }),
    json: () => Promise.resolve({
      ok: true,
      status: 200
    })
  }))

  test('in production given a valid token, returns a new token', async () => {
    const newToken = await refreshToken('mock_token')
    expect(newToken.tokenValue).toEqual('new_token')
    expect(newToken.tokenExp).toEqual(1704068100000)
  })

  test('in development given a valid token, returns a new token', async () => {
    vi.spyOn(getConfig, 'getApplicationConfig').mockImplementation(() => ({
      version: 'development'
    }))

    const newToken = await refreshToken('mock_token')
    expect(newToken.tokenValue).toEqual('ABC-1')
  })

  test('return error response', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('error')))
    await refreshToken('mock_token').catch((error) => {
      expect(error.message).toEqual('error')
    })

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
