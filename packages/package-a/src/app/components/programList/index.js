import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment-timezone'
import { Table, Thead, Th, Tr, Td } from 'reactable'
import Waypoint from 'react-waypoint'

import {
  renderSourceBadge,
  renderErrorDuration,
  renderProgramDuration,
  getSeverity,
  getAllErrorTypes,
  getContentType,
  getProgramTitles,
  getProgramTypeDisplay,
  checkAllListingsSelected,
  formatErrors,
} from '../../helpers/programHelpers'
import './programList.scss'

class ProgramList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showWaypoint: true,
      tzAbbr: moment().tz(moment.tz.guess()).format('z'), // local tz (PST)
    }
    this.loadData = this.loadData.bind(this)
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this)
    this.handleSelectAll = this.handleSelectAll.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const { page: nextPage } = nextProps
    const { page: prevPage } = this.props
    if (nextPage !== prevPage) this.setState({ showWaypoint: true })
  }

  getNextListings() {
    const { selectedListingId } = this.props
    const tableListings = _.get(this.tableList, 'data', [])
    const tableListingIdx = _.findIndex(
      tableListings,
      (l) => _.get(l, 'data.id.value') === selectedListingId
    )
    const nextId = _.get(tableListings, `${tableListingIdx + 1}.data.id.value`, null)
    const prevId = _.get(tableListings, `${tableListingIdx - 1}.data.id.value`, null)
    return { nextId, prevId }
  }

  loadData() {
    const { page, getData } = this.props
    this.setState({ showWaypoint: false }, () => {
      getData(page + 1)
    })
  }

  handleCheckboxChange(event) {
    const { addSelectedListing, removeSelectedListing } = this.props
    const checked = event.target.checked
    const listingId = event.target.value
    if (checked) {
      addSelectedListing({ listingId })
    } else {
      removeSelectedListing({ listingId })
    }
  }

  handleSelectAll() {
    const { selectedListings, listings, clearSelectedListings, selectAllListings } = this.props
    const allSelected = checkAllListingsSelected({ selectedListings, listings })
    if (allSelected) {
      clearSelectedListings()
    } else {
      selectAllListings()
    }
  }

  renderNoData() {
    return <img alt="" className="no-errors-msg" src="./no-errors-message@2x.png" />
  }

  renderLoadingPanel() {
    const { loading, showEpisodeList, totalErrors, filters, apiError } = this.props
    const { showWaypoint } = this.state
    const stations = _.get(filters, 'stations')
    const errorTypes = _.get(filters, 'errorType')
    const programTypes = _.get(filters, 'programType')
    const hideWaypoint =
      !showEpisodeList && (_.isEmpty(stations) || _.isEmpty(errorTypes) || _.isEmpty(programTypes))
    let loadingPanel = null
    if (loading) {
      loadingPanel = (
        <div>
          {showWaypoint && !hideWaypoint && <Waypoint onEnter={this.loadData} />}
          {!apiError && (
            <img alt="loading spinner" className="loading-spinner route" src="/loader2.png" />
          )}
        </div>
      )
    } else if (totalErrors > 0) {
      loadingPanel = <div className="loadingPanel">No More Results</div>
    }
    return loadingPanel
  }

  renderSelectAll() {
    const { selectedListings, listings } = this.props
    const checked = checkAllListingsSelected({ selectedListings, listings })
    return (
      <input checked={checked} name="selectAll" onChange={this.handleSelectAll} type="checkbox" />
    )
  }

  renderCheckbox({ listingId }) {
    const { selectedListings } = this.props
    const checked = _.includes(selectedListings, listingId)
    return (
      <input
        checked={checked}
        name="selectedError"
        onChange={this.handleCheckboxChange}
        type="checkbox"
        value={listingId}
      />
    )
  }

  renderSeverityIndicator({ severity }) {
    if (!severity) return null
    return (
      <div>
        <div className={`display error ${severity} no-print`} />
        <div className="show-print">{severity}</div>
      </div>
    )
  }

  renderErrorTypes({ errors, showArchive }) {
    const { showEpisodeList } = this.props
    const allErrorTypes = getAllErrorTypes(showArchive)
    const formattedTypes = formatErrors({ errors, allErrorTypes })
    if (!formattedTypes) return null

    return (
      <table className="errorTypes">
        <tbody>
          {_.map(formattedTypes, (types, source) => {
            const badgeSource = source === 'both' ? ['API', 'MPX'] : [source]
            const badge = renderSourceBadge(badgeSource)
            const typeString = !_.isEmpty(types) ? types.join(', ') : null
            if (!typeString) return null
            return (
              <tr key={source}>
                {!showEpisodeList && <td className="source">{badge}</td>}
                <td className="type">{typeString}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  renderListings() {
    const {
      selectedListingId,
      showDetail,
      filterListing,
      listings,
      showArchive,
      showEpisodeList,
      stationTZs,
    } = this.props
    return _.map(listings, (listing, id) => {
      if (!filterListing(listing)) return false
      const { station, errors, durationInSeconds, startDate, endDate } = listing
      const contentType = getContentType(listing)
      const programType = getProgramTypeDisplay(contentType)
      const { programTitle } = getProgramTitles(listing)
      const severity = getSeverity(errors)

      let found,
        resolved = ''
      if (showArchive) {
        const error = listing.errors[0]
        const { dateFound, isResolved, dateResolved } = error
        if (dateFound) {
          found = new Date(dateFound)
          found = found.toISOString()
        }
        if (isResolved) {
          resolved = new Date(dateResolved)
          resolved = resolved.toISOString()
        }
      }

      const stationTZ = stationTZs ? stationTZs[station] : null
      const momentStart = moment(startDate)
      const momentEnd = moment(endDate)
      const duration = durationInSeconds || momentEnd.diff(momentStart, 'seconds')
      const durationDisplay = renderProgramDuration(duration)
      const rowClass = `listing ${selectedListingId === id ? 'selected' : ''}`
      const startDateDisplay = momentStart.format('MM/DD/YY')
      const startDateMs = momentStart.valueOf()
      const localStartTime = stationTZ ? momentStart.tz(stationTZ).format('h:mm A') : ''
      const localStartTimeSortValue = stationTZ
        ? momentStart.tz(stationTZ).format('A HH:mm')
        : momentStart
      const startTime = momentStart.local().format('h:mm A')
      const startTimeSortValue = momentStart.format('A HH:mm')
      const localEndTime = stationTZ ? momentEnd.tz(stationTZ).format('h:mm A z') : ''
      const endTime = momentEnd.local().format('h:mm A z')

      const momentFound = moment(found)
      const momentResolved = moment(resolved)
      const errorFoundDisplay = momentFound.format('MM/DD/YY hh:mm:ss A')
      const errorFoundSortValue = momentFound.valueOf()
      const errorDuration = showArchive && resolved ? renderErrorDuration(found, resolved) : 'N/A'
      const errorDurationSortValue = momentResolved.diff(momentFound, 'seconds')
      const resolvedText = resolved
        ? 'Resolved ' + momentResolved.format('MM/DD/YY hh:mm:ss A')
        : ''
      const selectedColumnClass = !showArchive && !showEpisodeList && 'col-first'

      const handleClick = () => {
        showDetail(id)
      }
      const handleKeyUp = (e) => {
        const { nextId, prevId } = this.getNextListings()
        const keyPressed = _.get(e, 'key')
        switch (keyPressed) {
          case 'ArrowDown':
            nextId && showDetail(nextId)
            break
          case 'ArrowUp':
            prevId && showDetail(prevId)
            break
          default:
            break
        }
      }
      // console.log('severity=', severity)
      // console.log('programTitle=', programTitle)
      // console.log('programType=', programType)
      // console.log('startDateMs=', startDateMs)
      // console.log('startTimeSortValue=', startTimeSortValue)
      // console.log('duration=', duration)
      // console.log('errorFoundSortValue=', errorFoundSortValue)
      // console.log('errorDurationSortValue=', errorDurationSortValue || 0)
      // console.log('rowClass.toString()=', rowClass.toString())
      // console.log('id=', id)
      // console.log('handleClick=', handleClick)
      // console.log('handleKeyUp=', handleKeyUp)
      const row = (
        <Tr
          className={rowClass.toString()}
          key={id}
          onClick={handleClick}
          onKeyUp={handleKeyUp}
          tabIndex={0}
        >
          <Td column="id" hidden>
            {id}
          </Td>
          <Td
            className={selectedColumnClass.toString()}
            column="selected"
            hidden={showArchive || showEpisodeList}
            value={1}
          >
            {this.renderCheckbox({ listingId: id })}
          </Td>
          <Td column="severity" value={severity}>
            {this.renderSeverityIndicator({ severity })}
          </Td>
          <Td column="name" value={programTitle}>
            {programTitle || 'N/A'}
          </Td>
          <Td className="programTypeColumn" column="programType" value={programType}>
            {programType || 'N/A'}
          </Td>
          <Td column="station">{station}</Td>
          <Td className="startDateColumn" column="startDate" value={startDateMs}>
            {startDateDisplay}
          </Td>
          <Td className="timeColumnWide" column="localStartTime" value={localStartTimeSortValue}>
            {stationTZ ? `${localStartTime} - ${localEndTime}` : 'Not Found'}
          </Td>
          <Td
            className="timeColumn"
            data-tip={this.state.tzAbbr}
            column="time"
            value={startTimeSortValue}
          >
            {startTime + ' - ' + endTime}
          </Td>
          <Td column="duration" value={duration}>
            {durationDisplay}
          </Td>
          <Td
            className="errorFoundColumn"
            column="errorFound"
            hidden={!showArchive}
            value={errorFoundSortValue}
          >
            {errorFoundDisplay}
          </Td>
          <Td
            className="errorDurationColumn"
            column="errorDuration"
            data-tip={resolvedText}
            hidden={!showArchive}
            value={errorDurationSortValue || 0}
          >
            {errorDuration}
          </Td>
          <Td className="typeColumn" column="errorType">
            {this.renderErrorTypes({ errors, showArchive })}
          </Td>
        </Tr>
      )
      // console.log('row=', row)
      // console.log('row=', row.toString())
      // console.log('row=', JSON.stringify(row))
      return row
    })
  }

  render() {
    const { showArchive, showEpisodeList, listings, defaultSort, onSort, totalErrors } = this.props
    const sortableColumns = [
      'severity',
      'name',
      'programType',
      'station',
      'startDate',
      'localStartTime',
      'time',
      'duration',
      'errorFound',
      'errorDuration',
    ]
    const selectedColumnClass = !showArchive && !showEpisodeList && 'col-first'
    // console.log('listings=', listings)
    // console.log('totalErrors=', totalErrors)
    // console.log('If false then wont render table... (_.size(listings) > 0 || totalErrors === 0)=', (_.size(listings) > 0 || totalErrors === 0))
    // const rows = [{
    //   name:
    // }]

    return (
      <div className="program-list">
        {(_.size(listings) > 0 || totalErrors === 0) && (
          <Table
            defaultSort={defaultSort || 'startDate'}
            noDataText={this.renderNoData()}
            onSort={onSort}
            ref={(el) => {
              this.tableList = el
            }}
            sortable={sortableColumns}
          >
            <Thead>
              <Th
                className={selectedColumnClass.toString()}
                column="selected"
                hidden={showArchive || showEpisodeList}
              >
                {this.renderSelectAll()}
              </Th>
              <Th className="col-first" column="severity">
                s
              </Th>
              <Th column="name">Program Name</Th>
              <Th column="programType">Program Type</Th>
              <Th column="station">Station</Th>
              <Th column="startDate">Start Date</Th>
              <Th column="localStartTime">Station Airtime</Th>
              <Th column="time">User Airtime</Th>
              <Th column="duration">Duration</Th>
              <Th column="errorFound" hidden={!showArchive}>
                Error Found
              </Th>
              <Th column="errorDuration" hidden={!showArchive}>
                Error Duration
              </Th>
              <Th className="typeColumn" column="errorType">
                Errors
              </Th>
            </Thead>
            {this.renderListings()}
          </Table>
        )}
        {this.renderLoadingPanel()}
      </div>
    )
  }
}

/* eslint-disable react/forbid-prop-types */
ProgramList.propTypes = {
  defaultSort: PropTypes.shape({}),
  listings: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  filterListing: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  selectedListingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showArchive: PropTypes.bool,
  showEpisodeList: PropTypes.bool,
  showDetail: PropTypes.func.isRequired,
  totalErrors: PropTypes.number,
  filters: PropTypes.shape({}),
  selectedListings: PropTypes.arrayOf(PropTypes.string),
  addSelectedListing: PropTypes.func,
  clearSelectedListings: PropTypes.func,
  onSort: PropTypes.func,
  refreshingData: PropTypes.bool,
  apiError: PropTypes.object,
  removeSelectedListing: PropTypes.func,
  selectAllListings: PropTypes.func,
}

ProgramList.defaultProps = {
  defaultSort: null,
  listings: {},
  selectedListingId: null,
  totalErrors: null,
  filters: null,
  refreshingData: false,
  apiError: null,
  selectedListings: [],
  showArchive: false,
  showEpisodeList: false,
  addSelectedListing: () => {},
  clearSelectedListings: () => {},
  onSort: () => {},
  removeSelectedListing: () => {},
  selectAllListings: () => {},
}

export default ProgramList
