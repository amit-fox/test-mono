import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'

const CustomRoute = ({
  account,
  authCheck,
  requiresAuth,
  component: Component,
  defaultProps,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        requiresAuth && authCheck && !account ? (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        ) : authCheck ? (
          <Component {...props} {...defaultProps} />
        ) : (
          <img alt="loading spinner" className="loading-spinner route" src="/loader.png" />
        )
      }
    />
  )
}

export default CustomRoute

CustomRoute.propTypes = {
  account: PropTypes.shape({}),
  authCheck: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  requiresAuth: PropTypes.bool,
  location: PropTypes.shape({}),
  defaultProps: PropTypes.shape({}),
}

CustomRoute.defaultProps = {
  account: null,
  requiresAuth: false,
  location: null,
  defaultProps: {},
}
