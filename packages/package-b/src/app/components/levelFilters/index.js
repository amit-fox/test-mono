import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import LevelButton from './levelButton'

const severityLevels = ['all', 'critical', 'warning']

const LevelFilters = ({ filters, updateFilters, liveErrorCount, showArchive }) => {
  return (
    <div className="secondary-nav container no-print">
      {_.map(severityLevels, (level) => {
        return (<LevelButton 
          filters={filters}
          key={level}
          level={level}
          liveErrorCount={liveErrorCount}
          showArchive={showArchive}
          updateFilters={updateFilters}
        />)
      })}
      {showArchive &&
        <LevelButton 
          filters={filters}
          level='ignored'
          liveErrorCount={liveErrorCount}
          showArchive={showArchive}
          updateFilters={updateFilters}
        />
      }
    </div>
  )
}

export default LevelFilters

LevelFilters.propTypes = {
  filters: PropTypes.shape({}).isRequired,
  liveErrorCount: PropTypes.shape({}),
  showArchive: PropTypes.bool.isRequired,
  updateFilters: PropTypes.func.isRequired
}

LevelFilters.defaultProps = {
  liveErrorCount: null
}
