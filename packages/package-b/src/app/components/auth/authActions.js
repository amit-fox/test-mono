export const GET_USER = 'get_user'
export const SET_TOKEN = 'SET_TOKEN'
export const SET_USER = 'set_user'
export const SIGN_OUT = 'sign_out'
export const SET_ADMIN = 'SET_ADMIN'
export const SET_ENV = 'SET_ENV'

export function getUser() {
  return (dispatch, getState) => {
    const { auth } = getState().auth
    auth.session.get((response) => {
      dispatch(setUser(response))
    })
  }
}

export function setUser(userData) {
  return {
    type: SET_USER,
    payload: userData,
  }
}

export function setToken(tokens) {
  return {
    type: SET_TOKEN,
    payload: tokens,
  }
}

export function setEnv(env) {
  return {
    type: SET_ENV,
    payload: env,
  }
}

export function setAdmin(isAdmin) {
  return {
    type: SET_ADMIN,
    payload: isAdmin,
  }
}

export function signOut() {
  return (dispatch, getState) => {
    const { auth } = getState().auth
    auth.session.close((err) => {
      dispatch({
        type: SIGN_OUT,
        payload: err,
      })
    })
  }
}
