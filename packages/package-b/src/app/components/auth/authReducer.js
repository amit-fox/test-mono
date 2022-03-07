/* eslint-disable import/no-anonymous-default-export */
// import OktaSignIn from '@okta/okta-signin-widget'
import _ from 'lodash'

import { getOktaParams } from './authHelpers'
import { SET_TOKEN, SET_ADMIN, SET_USER, SIGN_OUT, SET_ENV } from './authActions'

const oktaParams = getOktaParams()
// alert(JSON.stringify(oktaParams))
const INITIAL_STATE = {
  accessToken: null,
  auth: {},
  account: null,
  authCheck: true,
  env: null,
}

export default (state = INITIAL_STATE, action) => {
  const payload = _.get(action, 'payload')
  switch (action.type) {
    case SET_USER: {
      console.log('SET_USER payload', payload)
      return { ...state, account: payload, authCheck: true }
    }
    case SET_TOKEN: {
      console.log('SET_TOKEN payload', payload)
      const accessToken = _.get(payload, 'accessToken.accessToken', null)
      return { ...state, accessToken }
    }
    case SET_ENV: {
      console.log('SET_ENV payload', payload)
      const env = _.get(payload, 'env', null)
      return { ...state, env }
    }
    case SET_ADMIN: {
      console.log('SET_ADMIN payload', payload)
      const isAdmin = _.get(payload, 'isAdmin', false)
      return { ...state, isAdmin }
    }
    case SIGN_OUT: {
      if (payload) return state
      return {
        ...state,
        accessToken: null,
        account: null,
      }
    }
    default: {
      return state
    }
  }
}
