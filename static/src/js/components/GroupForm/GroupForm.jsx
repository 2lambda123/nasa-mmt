import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useParams } from 'react-router'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

import { useMutation, useSuspenseQuery } from '@apollo/client'

import groupSchema from '@/js/schemas/group'
import adminGroupSchema from '@/js/schemas/adminGroup'
import groupUiSchema from '@/js/schemas/uiSchemas/Group'
import adminGroupUiSchema from '@/js/schemas/uiSchemas/AdminGroup'

import { CREATE_GROUP } from '@/js/operations/mutations/createGroup'
import { GET_GROUP } from '@/js/operations/queries/getGroup'
import { UPDATE_GROUP } from '@/js/operations/mutations/updateGroup'

import useNotificationsContext from '@/js/hooks/useNotificationsContext'
import useAppContext from '@/js/hooks/useAppContext'

import { GET_ACLS } from '@/js/operations/queries/getAcls'
import getPermittedUser from '@/js/utils/getPermittedUser'

import errorLogger from '@/js/utils/errorLogger'
import removeEmpty from '@/js/utils/removeEmpty'

import CustomArrayFieldTemplate from '../CustomArrayFieldTemplate/CustomArrayFieldTemplate'
import CustomFieldTemplate from '../CustomFieldTemplate/CustomFieldTemplate'
import CustomSelectWidget from '../CustomSelectWidget/CustomSelectWidget'
import CustomTextareaWidget from '../CustomTextareaWidget/CustomTextareaWidget'
import CustomTextWidget from '../CustomTextWidget/CustomTextWidget'
import CustomTitleField from '../CustomTitleField/CustomTitleField'
import GridLayout from '../GridLayout/GridLayout'

/**
 * Renders a GroupForm component
 *
 * @component
 * @example <caption>Render a GroupForm</caption>
 * return (
 *   <GroupForm />
 * )
 */
const GroupForm = ({ isAdmin }) => {
  const {
    draft,
    originalDraft,
    setDraft,
    setOriginalDraft,
    setSavedDraft,
    user
  } = useAppContext()

  const navigate = useNavigate()

  const { id = 'new' } = useParams()

  const { addNotification } = useNotificationsContext()

  const [focusField, setFocusField] = useState(null)

  const [createGroupMutation] = useMutation(CREATE_GROUP)
  const [updateGroupMutation] = useMutation(UPDATE_GROUP, {
    refetchQueries: [{
      query: GET_GROUP,
      variables: {
        params: {
          id
        }
      }
    }]
  })

  const permittedUser = getPermittedUser(user)
  const { data: providerData } = useSuspenseQuery(GET_ACLS, {
    skip: isAdmin,
    variables: {
      params: {
        limit: 500,
        permittedUser,
        target: 'PROVIDER_CONTEXT'
      }
    }
  })

  const updatedGroupSchema = isAdmin ? adminGroupSchema : groupSchema

  if (!isAdmin) {
    updatedGroupSchema.properties.provider.enum = providerData?.acls.items?.map(
      (item) => item.providerIdentity.provider_id
    )
  }

  const fields = {
    TitleField: CustomTitleField,
    layout: GridLayout
  }

  const widgets = {
    TextWidget: CustomTextWidget,
    SelectWidget: CustomSelectWidget,
    TextareaWidget: CustomTextareaWidget
  }

  const templates = {
    ArrayFieldTemplate: CustomArrayFieldTemplate,
    FieldTemplate: CustomFieldTemplate
  }

  const { data } = useSuspenseQuery(GET_GROUP, {
    skip: id === 'new',
    variables: {
      params: {
        id
      }
    }
  })

  useEffect(() => {
    if (data) {
      const { group: groupData } = data
      const {
        description,
        name,
        members,
        tag
      } = groupData

      const { items } = members
      const memberObjects = items.map((member) => ({
        id: member.id,
        label: `${member.firstName} ${member.lastName}`
      }))

      const formData = {
        description,
        name,
        provider: isAdmin ? undefined : tag,
        members: memberObjects
      }

      setDraft({ formData })
      setOriginalDraft({ formData })
    }
  }, [data])

  useEffect(() => {
    if (id === 'new') {
      setDraft({})
      setOriginalDraft({})
    }
  }, [id])

  // Handle form changes
  const handleChange = (event) => {
    const { formData } = event

    setDraft({
      ...draft,
      formData: removeEmpty(formData)
    })
  }

  const { formData } = draft || {}

  const handleSubmit = () => {
    const groupVariables = {
      ...formData,
      tag: isAdmin ? 'CMR' : formData.provider,
      // Members needs to default to an empty string if no members are provided by the form
      members: formData.members?.length > 0 ? formData.members.map((member) => member.id).join(', ') : '',

      // `provider` is not a variable in the GraphQL mutation
      provider: undefined
    }

    if (id === 'new') {
      createGroupMutation({
        variables: groupVariables,
        onCompleted: (mutationData) => {
          const { createGroup } = mutationData
          const { id: groupId } = createGroup

          addNotification({
            message: 'Group created successfully',
            variant: 'success'
          })

          navigate(`${isAdmin ? '/admin' : ''}/groups/${groupId}`)
        },
        onError: () => {
          addNotification({
            message: 'Error creating group',
            variant: 'danger'
          })

          errorLogger('Error creating group', 'GroupForm: createGroupMutation')
        }
      })
    } else {
      updateGroupMutation({
        variables: {
          ...groupVariables,
          id
        },
        onCompleted: (updatedGroup) => {
          const { updateGroup } = updatedGroup

          addNotification({
            message: 'Group updated successfully',
            variant: 'success'
          })

          // Sets savedDraft so the group preview can request the correct version
          setSavedDraft(updateGroup)

          navigate(`${isAdmin ? '/admin' : ''}/groups/${id}`)
        },
        onError: () => {
          addNotification({
            message: 'Error creating Group',
            variant: 'danger'
          })

          errorLogger('Error updating group', 'GroupForm: updateGroupMutation')
        }
      })
    }
  }

  const handleClear = () => {
    setDraft(originalDraft)
    addNotification({
      message: 'Group cleared successfully',
      variant: 'success'
    })
  }

  return (
    <Container className="group-form__container mx-0" fluid>
      <Row>
        <Col>
          <Form
            fields={fields}
            formContext={
              {
                focusField,
                setFocusField
              }
            }
            widgets={widgets}
            schema={updatedGroupSchema}
            validator={validator}
            templates={templates}
            uiSchema={isAdmin ? adminGroupUiSchema : groupUiSchema}
            onChange={handleChange}
            formData={formData}
            onSubmit={handleSubmit}
            showErrorList="false"
          >
            <div className="d-flex gap-2">
              <Button type="submit">
                Submit
              </Button>
              <Button
                onClick={handleClear}
                variant="secondary"
              >
                Clear
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

GroupForm.defaultProps = {
  isAdmin: false
}

GroupForm.propTypes = {
  isAdmin: PropTypes.bool
}

export default GroupForm