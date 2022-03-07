import _ from 'lodash'

import config from '../../../config/config.json'

export const getOktaParams = () => {
  let params = null
  switch (process.env.REACT_APP_ENV) {
    case 'staging':
      params = _.get(config, 'oktaParams.staging')
      break
    case 'qa':
    case 'qa-deploy':
      params = _.get(config, 'oktaParams.qa')
      break
    case 'develop':
      params = _.get(config, 'oktaParams.develop')
      break
    default:
      params = _.get(config, 'oktaParams.staging')
      // params = _.get(config, 'oktaParams.local')
      break
  }
  return params
}

export default getOktaParams
