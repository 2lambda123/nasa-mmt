import React from 'react'
import PropTypes from 'prop-types'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

/**
 * @typedef {Object} DeleteDraftModalProps
 * @property {Boolean} show Should the modal be open.
 * @property {Function} closeModal A function to close the modal.
 * @property {Function} onDelete A callback function triggered when the user selects `Yes`.
 */

/**
 * Renders a DeleteDraftModal component
 *
 * @component
 * @example <caption>Render a DeleteDraftModal</caption>
 * return (
 *   <DeleteDraftModal
 *      show={showDeleteModal}
 *      closeModal={handleClose}
 *      onDelete={handleDelete}
 *   />
 * )
 */
const DeleteDraftModal = ({
  closeModal,
  onDelete,
  show
}) => (
  <Modal
    onHide={closeModal}
    show={show}
  >
    <Modal.Body>Are you sure you want to delete this draft?</Modal.Body>

    <Modal.Footer>
      <Button
        variant="secondary"
        onClick={closeModal}
      >
        No
      </Button>

      <Button
        variant="primary"
        onClick={onDelete}
      >
        Yes
      </Button>
    </Modal.Footer>
  </Modal>
)

DeleteDraftModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
}

export default DeleteDraftModal
