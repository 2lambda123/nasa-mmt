import React from 'react'
import { render, screen } from '@testing-library/react'

import PermissionList from '@/js/components/PermissionList/PermissionList'

import PermissionListPage from '../PermissionListPage'

vi.mock('../../../components/PermissionList/PermissionList')

const setup = () => {
  render(
    <PermissionListPage />
  )
}

describe('PermissionListPage', () => {
  describe('show permission list page', () => {
    test('render the page and calls PermissionList', async () => {
      setup()

      expect(screen.getAllByText('Collection Permissions')[0]).toBeInTheDocument()
      expect(PermissionList).toHaveBeenCalled(1)
    })
  })
})
