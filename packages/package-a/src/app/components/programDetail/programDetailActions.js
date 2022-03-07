import axios from 'axios'
import _ from 'lodash'

import { getApiHeaders, getFullApiUrl } from '../../helpers/apiHelpers'

export const UPDATE_ERROR = 'update_error'

export function updateError({ errorIds, isIgnored, notes, account, callback, accessToken, errorHandler }) {
  if (!errorIds || errorIds.length === 0) return
  return (dispatch) => {
    const path = 'errors/batchUpdate'
    const data = { ids: errorIds }
    if (isIgnored !== null && isIgnored !== undefined) data.isIgnored = isIgnored
    if (notes !== null && notes !== undefined) data.notes = notes
    const email = _.get(account, 'login', null)
    if (email) data.user = { email }
    const method = 'patch'
    const url = getFullApiUrl({ path })
    const headers = getApiHeaders({ accessToken })
    return axios({ method, url, headers, data }).then((response) => {
      dispatch(() => {
        const status = _.get(response, 'data.statusCode', null)
        if (status === 200) callback({ isIgnored, notes })
      })
    }).catch(errorHandler)
  }
}