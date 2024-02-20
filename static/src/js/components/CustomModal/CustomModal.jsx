import React from 'react'
import PropTypes from 'prop-types'

import Modal from 'react-bootstrap/Modal'
import { FaTimes } from 'react-icons/fa'

import Button from '../Button/Button'

/**
 * @typedef {Object} CustomModalActionDef
 * @property {Boolean} label A text label for the button
 * @property {String} variant A Bootstrap variant for the action button
 * @property {Function} onClick A callback function to be called when the action is clicked
 */

/**
 * @typedef {Object} CustomModalProps
 * @property {Boolean} show Should the modal be open.
 * @property {String} message A message to describe the modal
 * @property {CustomModalActionDef[]} actions A list of actions for the modal
 * @property {Object} show Determines the state of the modal
 * @property {Object} size A list of actions for the modal
 * @property {Object} toggleModal A list of actions for the modal
 */

/**
 * Renders a CustomModal component
 *
 * @component
 * @property {CustomModalProps} props The props passed to the component
 * @example <caption>Render a Modal</caption>
 * return (
 *   <CustomModal
 *      show={showDeleteModal}
 *      message='message'
 *      actions={[
 *         label: 'label',
 *         variant: 'primary'
 *         onClick: () => func
 *      ]}
 *   />
 * )
 */
const CustomModal = ({
  actions,
  message,
  header,
  show,
  size,
  toggleModal
}) => (
  <Modal
    show={show}
    size={size}
    centered
    onHide={() => toggleModal(false)}
  >
    {
      !!header && (
        <Modal.Header>
          <div>{header}</div>
          <Button
            className="text-secondary"
            naked
            variant="link"
            onClick={
              () => {
                toggleModal(false)
              }
            }
            Icon={FaTimes}
            iconTitle="X icon"
            iconOnly
          >
            Close
          </Button>
        </Modal.Header>
      )
    }
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      {
        actions.map((item) => {
          const { label, variant, onClick } = item

          return (
            <Button
              key={label}
              variant={variant}
              onClick={onClick}
            >
              {label}
            </Button>
          )
        })
      }
    </Modal.Footer>
  </Modal>
)

CustomModal.defaultProps = {
  header: null,
  message: null,
  size: null
}

CustomModal.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  })).isRequired,
  header: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  show: PropTypes.bool.isRequired,
  size: PropTypes.string,
  toggleModal: PropTypes.func.isRequired
}

export default CustomModal
