import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

const LevelButton = ({ filters, level, liveErrorCount, showArchive, updateFilters }) => {
  const count = _.get(liveErrorCount, level === 'all' ? 'total' : level, 0)
  const active = (filters.ignored && level === 'ignored') || (!filters.ignored && filters.level === level)
  const buttonClass = `nav-item no-style ${active ? 'active' : ''}`
  const countClass = `error ${level} ${showArchive ? 'archive' : ''}`
  const filterUpdates = level === 'ignored' ? { level: 'all', ignored: true } : { level, ignored: false }
  return (
    <button
      className={buttonClass}
      onClick={() => { updateFilters(filterUpdates) }}
    >
      {_.capitalize(level)}&nbsp;
      <div className={countClass}>
        {liveErrorCount && !showArchive ? count : ''}
      </div>
    </button>
  )
}

export default LevelButton

LevelButton.propTypes = {
  filters: PropTypes.shape({}).isRequired,
  level: PropTypes.string.isRequired,
  liveErrorCount: PropTypes.shape({}),
  showArchive: PropTypes.bool.isRequired,
  updateFilters: PropTypes.func.isRequired
}

LevelButton.defaultProps = {
  liveErrorCount: null
}