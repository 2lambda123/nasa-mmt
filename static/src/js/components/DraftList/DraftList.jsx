import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'
import { FaFileDownload } from 'react-icons/fa'
import Col from 'react-bootstrap/Col'
import Placeholder from 'react-bootstrap/Placeholder'
import Row from 'react-bootstrap/Row'
import Table from '../Table/Table'

import useAppContext from '../../hooks/useAppContext'
import useDraftsQuery from '../../hooks/useDraftsQuery'

import parseError from '../../utils/parseError'
import constructDownloadableFile from '../../utils/constructDownloadableFile'

import Button from '../Button/Button'
import ErrorBanner from '../ErrorBanner/ErrorBanner'
import Page from '../Page/Page'

import { DOWNLOAD_DRAFT } from '../../operations/queries/getDownloadDraft'

const DraftList = ({ draftType }) => {
  const { user } = useAppContext()
  const { providerId } = user
  const { draftType: paramDraftType } = useParams()

  const [offset, setOffset] = useState(0)
  const limit = 20

  const { drafts, error, loading } = useDraftsQuery({
    draftType,
    offset,
    limit
  })
  const { count, items = [] } = drafts

  const noDataError = `No ${draftType} drafts exist for the provider ${providerId}`

  const [downloadDraft] = useLazyQuery(DOWNLOAD_DRAFT, {
    onCompleted: (getDraftData) => {
      const { draft: fetchedDraft } = getDraftData
      const { conceptId } = fetchedDraft
      const { ummMetadata } = fetchedDraft

      const contents = JSON.stringify(ummMetadata, null, 2)
      constructDownloadableFile(contents, conceptId)
    }
  })

  const handleDownloadClick = (conceptId) => {
    downloadDraft({
      variables: {
        params: {
          conceptId,
          conceptType: draftType
        }
      }
    })
  }

  // Building a Table using Data in items
  const data = (items.map((item) => {
    const {
      conceptId, revisionDate, ummMetadata
    } = item
    const {
      ShortName, EntryTitle, Name, LongName
    } = ummMetadata || {}

    const draftLink = `/drafts/${`${paramDraftType}`}/${conceptId}`

    return (
      {
        key: conceptId,
        cells:
          [
            {
              value:
              (
                <Link to={draftLink}>
                  {Name || ShortName || '<Blank Name>'}
                </Link>
              )
            },
            {
              value:
              (
                LongName || EntryTitle || '<Untitled Record>'
              )
            },
            {
              value:
              (
                new Date(revisionDate).toISOString().split('T')[0]
              )
            },
            {
              value:
              (
                <div className="d-flex">
                  <Button
                    className="d-flex"
                    Icon={FaFileDownload}
                    onClick={() => handleDownloadClick(conceptId)}
                    variant="secondary"
                    size="sm"
                  >
                    Download JSON
                  </Button>
                </div>
              )
            }
          ]
      }
    )
  })
  )

  return (
    <Page
      title={`${providerId} ${draftType} Drafts`}
      pageType="secondary"
      breadcrumbs={
        [
          {
            label: `${draftType} Drafts`,
            to: `/drafts/${draftType}s`,
            active: true
          }
        ]
      }
      headerActions={
        [
          {
            label: `New ${draftType} Draft`,
            to: 'new'
          }
        ]
      }
    >
      <Row>
        <Col sm={12}>
          {error && <ErrorBanner message={parseError(error)} />}
          {
            !error && (
              <>
                {
                  loading
                    && (
                      <span className="d-block mb-3">
                        <Placeholder as="span" animation="glow">
                          <Placeholder xs={2} />
                        </Placeholder>
                      </span>
                    )
                }
                <Table
                  headers={['Short Name', 'Entry Title', 'Last Modified', 'Actions']}
                  classNames={['col-md-4', 'col-md-4', 'col-auto', 'col-auto']}
                  loading={loading}
                  data={data}
                  error={error}
                  noDataError={noDataError}
                  count={count}
                  setOffset={setOffset}
                  limit={limit}
                  offset={offset}
                />
              </>
            )
          }
        </Col>
      </Row>
    </Page>
  )
}

DraftList.propTypes = {
  draftType: PropTypes.string.isRequired
}

export default DraftList
