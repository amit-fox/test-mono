import React from 'react'
import PropTypes from 'prop-types'

const ErrorDisplay = ({ addStationError, apiError, duplicateError, networkError }) => {
  let message = null
  let home = null

  if (apiError) {
    console.log('apiError:', apiError)
    if (apiError.networkError) {
      message = 'Oops! There was a Network Error. Please try again.'
      home = true
    } else {
      if (apiError.message) {
        message = apiError.message
      } else {
        message = `Oops! Your changes didn't save. Please try again.`
      }
    }
  } else if (addStationError) {
    message = 'Stations must include a Call Sign, DMA ID(s), and Timezone.'
  } else if (duplicateError) {
    message = `"${duplicateError}" already exists. Please choose a different name.`
  }
return message ? <div className={"admin error" + (home ? ' home' : '')}>{message}</div> : null
}

export default ErrorDisplay

ErrorDisplay.defaultProps = {
  addStationError: false,
  apiError: false,
  networkError: null,
  duplicateError: null
}

ErrorDisplay.propTypes = {
  addStationError: PropTypes.bool,
  networkError: PropTypes.bool,
  apiError: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.object
  ]),
  duplicateError: PropTypes.string
}