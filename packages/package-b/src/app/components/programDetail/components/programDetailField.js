import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'

const programDetailField = ({
  currentErrors,
  dataSource,
  errorCheckSource,
  errorCheckType,
  errorCheckText,
  hasError,
  hideField,
  isHalfDisplay,
  imageAltText,
  isImage,
  label,
  materialIdConflicts,
  value,
  valueClass
}) => {
  if (hideField) return null
  const classes = ['program-data']
  if (isHalfDisplay) classes.push('half')
  if (errorCheckType || errorCheckText) {
    let errorClass = hasError(currentErrors, errorCheckType, errorCheckText) ? 'error' : null
    if (errorCheckSource && errorCheckSource !== dataSource) errorClass = null
    if (errorClass) classes.push(errorClass)
  }
  const emptyText = '(None)'
  let valueDisplay = emptyText
  if (value) {
    valueDisplay = isImage ? <img alt={imageAltText} src={value} /> : value
  }
  if (value === true) {
    valueDisplay = 'True'
  } else if (value === false) {
    valueDisplay = 'False'
  }
  return (
    <div className={classNames(classes)} key={label}>
      <h6>{label}:</h6>
      {materialIdConflicts ? (
        <div>
          <h6 className='half'>Program GUID</h6>
          <h6 className='half'>Conflicts</h6>
          {_.map(materialIdConflicts, conflict => (
            <div>
              <p className='half'>{conflict.guid}</p>
              <p className='half'>{conflict.materialIds.join(', ')}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={valueClass}>{valueDisplay}</p>
      )}
    </div>
  )
}

programDetailField.defaultProps = {
  currentErrors: [],
  dataSource: null,
  errorCheckSource: null,
  errorCheckType: null,
  errorCheckText: null,
  hasError: () => {},
  hideField: false,
  imageAltText: null,
  isHalfDisplay: false,
  isImage: false,
  materialIdConflicts: null,
  value: null,
  valueClass: null
}

programDetailField.propTypes = {
  currentErrors: PropTypes.arrayOf(PropTypes.shape()),
  dataSource: PropTypes.string,
  errorCheckSource: PropTypes.string,
  errorCheckType: PropTypes.arrayOf(PropTypes.string),
  errorCheckText: PropTypes.string,
  hasError: PropTypes.func,
  hideField: PropTypes.bool,
  imageAltText: PropTypes.string,
  isHalfDisplay: PropTypes.bool,
  isImage: PropTypes.bool,
  label: PropTypes.string.isRequired,
  materialIdConflicts: PropTypes.arrayOf(PropTypes.shape()),
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.bool
  ]),
  valueClass: PropTypes.string
}

export default programDetailField
