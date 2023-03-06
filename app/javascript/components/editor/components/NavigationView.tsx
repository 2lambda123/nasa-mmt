/* eslint-disable react/require-default-props */
import {
  Button, ButtonGroup, Dropdown, ListGroup
} from 'react-bootstrap'
import React from 'react'
import { observer } from 'mobx-react'
import Form from '@rjsf/bootstrap-4'
import NavigationItem from './NavigationItem'
import MetadataEditor from '../MetadataEditor'
import withRouter from './withRouter'
import Status from '../model/Status'

type ProgressViewProps = {
  router?: RouterType
  editor: MetadataEditor
}
type ProgressViewState = {
  saving: boolean
}
class ProgressView extends React.Component<ProgressViewProps, ProgressViewState> {
  constructor(props: ProgressViewProps) {
    super(props)
    this.state = {
      saving: false
    }
  }
  saveDraft(navigateNext: boolean) {
    const { editor, router } = this.props
    const { navigate } = router
    const {
      draft
    } = editor
    this.setState({ saving: true }, () => {
      editor.saveDraft(draft).then((draft) => {
        editor.draft = draft
        this.setState({ saving: false })
        if (navigateNext) {
          const section = editor.nextSection()
          navigate(`/${editor.documentType}/${draft.apiId}/edit/${section.displayName.replace(/\s/g, '_')}`, { replace: false })
          editor.navigateTo(section)
        }
      }).catch((error) => {
        editor.status = new Status('warning', `error saving draft! ${error.message}`)
        this.setState({ saving: false })
      })
    })
  }

  saveAndPublish() {
    const { editor } = this.props
    const {
      draft
    } = editor
    this.setState({ saving: true }, () => {
      editor.saveDraft(draft).then((draft) => {
        editor.draft = draft
        editor.publishDraft(draft).then((draft) => {
          editor.draft = draft
          editor.status = new Status('success', `Draft Published! ${draft.conceptId}/${draft.revisionId}`)
          editor.publishErrors = null
          this.setState({ saving: false })
        }).catch((errors) => {
          editor.status = null
          editor.publishErrors = errors
          this.setState({ saving: false })
        })
      }).catch((error) => {
        editor.status = new Status('warning', `error saving draft! ${error.message}`)
        this.setState({ saving: false })
      })
    })
  }

  saveDraftAndPreview() {
    const {
      editor
    } = this.props
    const {
      draft
    } = editor
    this.setState({ saving: true }, () => {
      editor.saveDraft(draft).then((draft) => {
        editor.draft = draft
        this.setState({ saving: false })
        // this will be needed to redirect to the preview page which is rendered by rails
        setTimeout(() => {
          window.location.href = `/${editor.documentType}/${draft.apiId}`
        }, 50)
        // } else {
        // navigate(`/${editor.documentType}/${draft.apiId}`, { replace: false })
        // }
      }).catch((error) => {
        editor.status = new Status('warning', `error saving draft! ${error.message}`)
        this.setState({ saving: false })
      })
    })
  }

  render() {
    const {
      editor
    } = this.props

    const {
      formSections, draft, fullSchema, fullData: draftJson
    } = editor

    const { saving } = this.state

    const sectionList = formSections.map((section: FormSection) => (
      <NavigationItem key={JSON.stringify(section)} editor={editor} section={section} />
    ))
    return (
      <>
        <div>
          <Dropdown as={ButtonGroup}>
            <Button
              onClick={() => {
                this.saveDraft(true)
              }}
              variant="success"
            >
              <span data-testid="navigationview--save-and-continue-button">
                Save &amp; Continue
              </span>
            </Button>
            <Dropdown.Toggle
              data-testid="navigationview--dropdown-toggle"
              split
              variant="success"
              id="dropdown-split-basic"
            />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                this.saveDraft(false)
              }}
              >
                <span data-testid="navigationview--save-draft-button">
                  Save
                </span>
              </Dropdown.Item>

              <Dropdown.Item onClick={() => {
                this.saveDraft(true)
              }}
              >
                <span data-testid="navigationview--save-and-continue-button">
                  Save &amp; Continue
                </span>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  this.saveAndPublish()
                }}
              >
                Save &amp; Publish

              </Dropdown.Item>

              <Dropdown.Item onClick={() => {
                this.saveDraftAndPreview()
              }}
              >
                <span data-testid="navigationview--save-and-preview">
                  Save &amp; Preview
                </span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          &nbsp;
          <button
            data-testid="navigationview--cancel-button"
            onClick={() => {
              this.setState({ saving: true }, () => {
                editor.fetchDraft(draft.apiId).then((draft) => {
                  editor.draft = draft
                  editor.status = new Status('info', 'Changes discarded.')
                  this.setState({ saving: false })
                }).catch((error) => {
                  editor.status = new Status('warning', `Error cancelling. ${error.message}`)
                  this.setState({ saving: false })
                })
              })
            }}
            type="button"
            className="link-button"
          >
            Cancel
          </button>
          &nbsp;&nbsp;
          {saving && (
            <div style={{ width: 24, height: 24 }} className="spinner-border" role="status" />
          )}
        </div>
        <ListGroup style={{ height: 400, width: 300, marginTop: 5 }}>
          {sectionList}
          <div style={{ display: 'none' }}>
            <Form
              schema={fullSchema}
              formData={draftJson}
              transformErrors={(errors: FormError[]) => {
                if (JSON.stringify(editor.fullErrors) !== JSON.stringify(errors)) {
                  editor.fullErrors = errors
                }
                return errors
              }}
              liveValidate
              showErrorList
            />
          </div>

        </ListGroup>
      </>
    )
  }
}
export default withRouter(observer(ProgressView))
