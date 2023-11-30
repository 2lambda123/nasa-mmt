import shouldHideGetService from '../shouldHideGetService'

describe('shouldHideGetService', () => {
  describe('when URLContentType is not DistributionURL and Type is not USE SERVICE API', () => {
    test('should hide GetService form', () => {
      const props = {
        URLContentType: 'OtherContentType',
        Type: 'OtherType'
      }
      const getService = shouldHideGetService(props)
      expect(getService).toBe(true)
    })
  })

  describe('when URLContentType is DistributionURL and Type is USE SERVICE API', () => {
    test('should not hide GetService from ', () => {
      const props = {
        URLContentType: 'DistributionURL',
        Type: 'USE SERVICE API'
      }
      const getService = shouldHideGetService(props)
      expect(getService).toBe(false)
    })
  })
})
