import React, { Suspense } from 'react'

import ErrorBoundary from '@/js/components/ErrorBoundary/ErrorBoundary'
import LoadingTable from '@/js/components/LoadingTable/LoadingTable'
import Page from '@/js/components/Page/Page'
import PageHeader from '@/js/components/PageHeader/PageHeader'
import PermissionList from '@/js/components/PermissionList/PermissionList'
/**
 * Renders a PermissionListPageHeader component
 *
 * @component
 * @example <caption>Render a PermissionListPageHeader</caption>
 * return (
 *   <PermissionListPageHeader />
 * )
 */
const PermissionListPageHeader = () => (
  <PageHeader
    breadcrumbs={
      [
        {
          label: 'Collection Permissions',
          active: true
        }
      ]
    }
    pageType="secondary"
    title="Permissions"
  />
)

/**
 * Renders a PermissionListPage component
 *
 * @component
 * @example <caption>Render a PermissionListPage</caption>
 * return (
 *   <PermissionListPage />
 * )
 */
const PermissionListPage = () => (
  <Page
    pageType="secondary"
    header={<PermissionListPageHeader />}
  >
    <ErrorBoundary>
      <Suspense fallback={<LoadingTable />}>
        <PermissionList />
      </Suspense>
    </ErrorBoundary>
  </Page>
)

export default PermissionListPage
