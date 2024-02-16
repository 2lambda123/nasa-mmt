import React from 'react'
import PropTypes from 'prop-types'
import './CollectionAssociationPreviewProgress.scss'
import { useNavigate } from 'react-router'
import progressCircleTypes from '../../constants/progressCircleTypes'
import useAccessibleEvent from '../../hooks/useAccessibleEvent'

const CollectionAssociationPreviewProgress = ({
  collectionAssociationDetails
}) => {
  const navigate = useNavigate()

  let status = progressCircleTypes.NotStarted

  if (collectionAssociationDetails) {
    status = progressCircleTypes.Pass
  }

  const progressSectionIcon = () => {
    if (status === progressCircleTypes.Pass) {
      return (
        <i
          aria-label="Collection Association Passed"
          className="eui-icon eui-check progress-section__section-icon--pass-circle"
          role="img"
        />
      )
    }

    return (
      <i
        aria-label="Collection Association Not Started"
        className="eui-icon eui-fa-circle-o progress-section__section-icon--invalid-circle"
        role="img"
      />
    )
  }

  const progressIcon = () => {
    if (status === progressCircleTypes.Pass) {
      return (
        <i
          aria-label="Collection Association - Required field complete"
          className="eui-icon eui-required icon-green progress-field__icon--pass-required-circle"
          role="img"
          title="Collection Association - Required field complete"
        />
      )
    }

    return (
      <i
        aria-label="Collection Association required"
        className="eui-icon eui-required-o progress-field__icon--not-started-required-circle"
        role="img"
        title="Collection Association is required"
      />
    )
  }

  const handleCircleClick = () => {
    navigate('collection-association')
  }

  const collectionAssociationEventProp = useAccessibleEvent((event) => {
    handleCircleClick(event)
  })

  return (
    <>
      <h5 className="mt-4">Collection Association</h5>
      <div className="collection-association-preview-progress__section-circle">
        {progressSectionIcon()}
      </div>
      <div
        className="collection-association-preview-progress__label"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...collectionAssociationEventProp}
      >
        Collection Association
      </div>
      <span
        className="collection-association-preview-progress__field-circle"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...collectionAssociationEventProp}
      >
        {progressIcon()}
      </span>
    </>
  )
}

CollectionAssociationPreviewProgress.defaultProps = {
  collectionAssociationDetails: null
}

CollectionAssociationPreviewProgress.propTypes = {
  collectionAssociationDetails: PropTypes.shape({})
}

export default CollectionAssociationPreviewProgress
