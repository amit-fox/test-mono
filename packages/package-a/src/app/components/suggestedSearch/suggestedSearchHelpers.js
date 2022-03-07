import _ from 'lodash'

export const groupListContainsName = (stationGroups, name) => {
  if (!stationGroups || !name) return false
  return _.find(stationGroups, group => (
    _.toUpper(_.get(group, 'name')) === _.toUpper(name))
  )
}
