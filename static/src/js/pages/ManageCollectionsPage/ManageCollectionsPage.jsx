import React from 'react'
import { Col, Row } from 'react-bootstrap'

import Page from '../../components/Page/Page'

/**
 * Renders a `ManageCollectionsPage` component
 *
 * @component
 * @example <caption>Renders a `ManageCollectionsPage` component</caption>
 * return (
 *   <ManageCollectionsPage />
 * )
 */
const ManageCollectionsPage = () => (
  <Page title="Manage Collections">
    <Row>
      <Col>
        This is the page manage collections page content
      </Col>
    </Row>
  </Page>
)

export default ManageCollectionsPage
