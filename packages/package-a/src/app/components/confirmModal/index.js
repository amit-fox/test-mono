import React from 'react'
import PropTypes from 'prop-types'

const ConfirmModal = ({
  description,
  hideModal,
  onPrimaryClick,
  primaryButtonText,
  shouldRenderModal,
  title
}) => {
  if (!shouldRenderModal) return null
  const classes = `customModal open ${!title && 'noTitle'}`
  return (
    <div className={classes}>
      <div className="backdrop" onClick={hideModal} />
      <div className="customModalInner">
        {title && <p>{title}</p>}
        {description && <p>{description}</p>}
        <button 
          className="btn btn-prim active"
          onClick={onPrimaryClick}
        >
          {primaryButtonText}
        </button>
        <button 
          className="btn btn-sec"
          onClick={hideModal}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ConfirmModal

ConfirmModal.propTypes = {
  description: PropTypes.string,
  hideModal: PropTypes.func,
  onPrimaryClick: PropTypes.func,
  primaryButtonText: PropTypes.string,
  shouldRenderModal: PropTypes.bool,
  title: PropTypes.string
}

ConfirmModal.defaultProps = {
  description: null,
  hideModal: () => {},
  onPrimaryClick: () => {},
  primaryButtonText: null,
  shouldRenderModal: false,
  title: null
}
