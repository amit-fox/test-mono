import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'
import ProgramFiltersDefinitions from './programFiltersModal'
import { errorDetectionDefinitions } from './programFilterConstants'
import SuggestedSearch from '../suggestedSearch'
import { getAllErrorTypes } from '../../helpers/programHelpers'
import { getEnabledStations } from '../../helpers/filterHelpers'
import { getProgramTypes } from '../../helpers/configHelper'
import { DEFAULT_DASHBOARD_FILTERS } from '../../screens/home'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import './programFilters.scss'

class ProgramFilters extends Component {
  constructor(props) {
    super(props)
    this.showStationOptions = this.showStationOptions.bind(this)
    this.hideStationOptions = this.hideStationOptions.bind(this)
    this.fromFilterChanged = this.fromFilterChanged.bind(this)
    this.datePickerButtonClicked = this.datePickerButtonClicked.bind(this)
    this.toFilterChanged = this.toFilterChanged.bind(this)
    this.sourceFilterChanged = this.sourceFilterChanged.bind(this)
    this.programTypeFilterChanged = this.programTypeFilterChanged.bind(this)
    this.toggleStationSearch = this.toggleStationSearch.bind(this)
    this.clearFilters = this.clearFilters.bind(this)
    this.stationGroupClicked = this.stationGroupClicked.bind(this)
    this.stationSearchChanged = this.stationSearchChanged.bind(this)
    this.selectAllClicked = this.selectAllClicked.bind(this)
    this.clearAllClicked = this.clearAllClicked.bind(this)
    this.renderSelectedStations = this.renderSelectedStations.bind(this)
    this.addStationClicked = this.addStationClicked.bind(this)
    this.stationSearchKeyUp = this.stationSearchKeyUp.bind(this)
    this.errorTypeFilterChanged = this.errorTypeFilterChanged.bind(this)
    this.addStations = this.addStations.bind(this)
    this.renderArchiveTitle = this.renderArchiveTitle.bind(this)
    this.selectAllErrorTypes = this.selectAllErrorTypes.bind(this)
    this.selectAllProgramTypes = this.selectAllProgramTypes.bind(this)
    this.nameFilterChanged = this.nameFilterChanged.bind(this)
    this.state = {
      showStations: false,
      showStationSearch: false,
      foundStation: '',
      showErrorTypeDropdown: false,
      showProgramTypeDropdown: false,
      nameFilter: '',
    }
  }

  componentWillMount() {
    const {
      filters: { listingName },
    } = this.props
    this.setState({ nameFilter: listingName })
  }

  componentWillReceiveProps(nextProps) {
    const { nameFilter } = this.state
    const {
      filters: { listingName },
    } = nextProps
    if (nameFilter !== listingName) this.setState({ nameFilter: listingName })
  }

  componentDidUpdate(prevProps) {
    const { allStations: prevStations } = prevProps
    const {
      allStations: nextStations,
      filters: { stations: stationFilter },
    } = this.props
    if (prevStations.length === 0 && nextStations.length > 0 && _.isEmpty(stationFilter)) {
      this.selectAllClicked()
    }
  }

  showStationOptions() {
    this.setState({ showStations: true })
  }

  hideStationOptions() {
    this.setState({ showStations: false })
  }

  toggleStationSearch(e) {
    this.setState({ showStationSearch: !this.state.showStationSearch })
    e.stopPropagation()
  }

  fromFilterChanged(date) {
    this.props.updateFilters({ from: date })
  }

  datePickerButtonClicked({ filter, date }) {
    const newFilter = {
      [filter]: moment(date),
    }
    this.props.updateFilters(newFilter)
    this[filter + 'Filter'].setOpen(false)
  }

  toFilterChanged(date) {
    this.props.updateFilters({ to: date })
  }

  sourceFilterChanged(event) {
    const source = event.target.value
    this.props.updateFilters({ source })
  }

  programTypeFilterChanged(event) {
    const programType = event.target.value
    this.props.updateFilters({ programType })
  }

  errorTypeFilterChanged(event) {
    const errorType = event.target.value
    this.props.updateFilters({ errorType })
  }

  stationGroupClicked(groupId) {
    const {
      filters: { stations },
      stationGroups,
    } = this.props
    const clickedGroupStations = _.get(stationGroups, `${groupId}.stations`, [])
    let active = true
    _.forEach(clickedGroupStations, (station) => {
      if (!_.includes(stations, station)) active = false
    })

    if (active) {
      this.removeStations(clickedGroupStations)
    } else {
      this.addStations(clickedGroupStations)
    }
  }

  stationSearchChanged(event) {
    const { allStations, filters } = this.props
    const enabledStations = getEnabledStations(allStations)
    if (enabledStations.length === 0) return
    var searchValue = event.target.value
    const length = searchValue.length
    let foundStation = ''
    if (length > 1) {
      let callSign = null
      _.forEach(enabledStations, (station) => {
        callSign = _.get(station, 'stationCallSign')
        const callSignMatch =
          callSign && callSign.substr(0, length).toLowerCase() === searchValue.toLowerCase()
        const callSignNotInFilters = filters.stations.indexOf(callSign) === -1
        if (callSignMatch && callSignNotInFilters) foundStation = callSign
      })
    }
    this.setState({ foundStation })
  }

  stationSearchKeyUp(event) {
    if (event.keyCode === 13) {
      this.addStationClicked()
    }
  }

  addStationClicked() {
    const { foundStation } = this.state
    if (foundStation === '') return null
    this.addStations([foundStation])
    this.setState({ foundStation: '' })
    this.stationSearch.value = ''
  }

  addStations(stationsToAdd) {
    const { filters, updateFilters } = this.props
    const filteredStations = _.get(filters, 'stations', [])
    const newStations = _.uniq([...filteredStations, ...stationsToAdd])
    updateFilters({ stations: newStations })
  }

  removeStations(stationsToRemove) {
    const { filters, updateFilters } = this.props
    const filteredStations = _.get(filters, 'stations', [])
    const newStations = _.filter(filteredStations, (s) => !_.includes(stationsToRemove, s))
    updateFilters({ stations: newStations })
  }

  selectAllClicked() {
    const { allStations, updateFilters } = this.props
    const enabledStations = getEnabledStations(allStations)
    if (enabledStations.length === 0) return
    const all_stations = _.map(enabledStations, (s) => s.stationCallSign)
    updateFilters({ stations: all_stations })
  }

  clearAllClicked() {
    const { updateFilters } = this.props
    updateFilters({ stations: [] })
  }

  clearFilters() {
    const { allStations, updateFilters } = this.props
    const enabledStations = getEnabledStations(allStations)
    const allStationCallSigns = _.map(enabledStations, (s) => s.stationCallSign)
    const newFilters = {
      ...DEFAULT_DASHBOARD_FILTERS,
      stations: allStationCallSigns,
    }
    updateFilters(newFilters)
  }

  countErrors(level) {
    let count = 0
    _.map(this.props.listings, (listing) => {
      if (
        level === 'all' ||
        (level === 'critical' && listing.level === 'critical') ||
        (level === 'warning' && listing.level === 'warning')
      ) {
        count++
      }
    })
    return count
  }

  errorTypeClicked(errorType) {
    const { errorType: errorTypeFilters } = this.props.filters
    if (errorTypeFilters.indexOf(errorType) !== -1) {
      errorTypeFilters.splice(errorTypeFilters.indexOf(errorType), 1)
    } else {
      errorTypeFilters.push(errorType)
    }
    this.props.updateFilters({ errorType: errorTypeFilters })
  }

  programTypeClicked(programType) {
    const { programType: programTypeFilters } = this.props.filters
    if (programTypeFilters.indexOf(programType) !== -1) {
      programTypeFilters.splice(programTypeFilters.indexOf(programType), 1)
    } else {
      programTypeFilters.push(programType)
    }
    this.props.updateFilters({ programType: programTypeFilters })
  }

  selectAllErrorTypes() {
    const allErrorTypes = getAllErrorTypes()
    const filteredTypes = _.get(this.props, 'filters.errorType')
    const newErrorType = _.size(filteredTypes) < _.size(allErrorTypes) ? _.keys(allErrorTypes) : []
    this.props.updateFilters({ errorType: newErrorType })
  }

  selectAllProgramTypes() {
    const allProgramTypes = getProgramTypes()
    const filteredTypes = _.get(this.props, 'filters.programType')
    const newProgramType =
      _.size(filteredTypes) < _.size(allProgramTypes) ? _.keys(allProgramTypes) : []
    this.props.updateFilters({ programType: newProgramType })
  }

  nameFilterChanged(nameFilter) {
    const {
      updateFilters,
      filters: { listingName },
    } = this.props
    this.setState({ nameFilter }, () => {
      const newNameFilter = nameFilter.length >= 3 ? nameFilter : ''
      if (listingName !== newNameFilter) updateFilters({ listingName: newNameFilter })
    })
  }

  renderArchiveTitle() {
    let title = ''
    if (this.props.showArchive) {
      title = <h2 className="container filterTitle">Archived Listings</h2>
    }
    return title
  }

  renderSelectedStations() {
    return _.map(this.props.filters.stations, (station, index) => {
      return (
        <span className="selectedStation" key={index}>
          <Glyphicon
            className="remove"
            glyph="remove-sign"
            onClick={() => {
              this.removeStations([station])
            }}
          />
          {station}
        </span>
      )
    })
  }

  renderStationGroups() {
    const { stationGroups, filters } = this.props
    const filteredStations = _.get(filters, 'stations', [])
    return _.map(stationGroups, (group, idx) => {
      const { title, stations } = group
      let checked = true
      _.forEach(stations, (station) => {
        if (!_.includes(filteredStations, station)) checked = false
      })
      return (
        <label className="stationGroup" htmlFor={'stationGroup' + idx} key={idx}>
          <input
            checked={checked}
            id={'stationGroup' + idx}
            onChange={() => {
              this.stationGroupClicked(idx)
            }}
            type="checkbox"
          />{' '}
          {title}
        </label>
      )
    })
  }

  popoverRight = (type) => {
    const errorType = errorDetectionDefinitions.find((def) => def.type === type)
    const displayType = errorType ? errorType.shortName : 'Error: No info for this type'
    return <Popover id={'Popover' + displayType}>{displayType}</Popover>
  }

  renderErrorTypeOptions(errorTypes) {
    const allErrorTypes = getAllErrorTypes()
    const displayTypes = _.map(allErrorTypes, (formattedType, type) => {
      return (
        <div id={'div' + type}>
          <OverlayTrigger
            trigger={['hover', 'focus']}
            placement="right"
            overlay={this.popoverRight(type)}
          >
            <label className="type" htmlFor={'type-' + type} key={type}>
              <input
                checked={errorTypes.indexOf(type) !== -1 ? true : false}
                id={'type-' + type}
                onChange={() => {
                  this.errorTypeClicked(type)
                }}
                type="checkbox"
              />
              &nbsp;{formattedType}
            </label>
          </OverlayTrigger>
        </div>
      )
    })
    const allTypesSelected = _.size(errorTypes) === _.size(allErrorTypes)
    const selectAllLabel = allTypesSelected ? 'Deselect All' : 'Select All'
    displayTypes.unshift(
      <div>
        <button
          className="btn btn-sec selectAllErrorTypes"
          key="all-types"
          onClick={this.selectAllErrorTypes}
        >
          {selectAllLabel}
        </button>
        <ProgramFiltersDefinitions id={'PFD' + displayTypes.length} />
      </div>
    )
    return displayTypes
  }

  renderProgramTypeOptions(programTypes) {
    const allProgramTypes = getProgramTypes()
    const displayTypes = _.map(allProgramTypes, (formattedType, type) => {
      return (
        <label className="type" htmlFor={'type-' + type} key={type}>
          <input
            checked={programTypes.indexOf(type) !== -1 ? true : false}
            id={'type-' + type}
            onChange={() => {
              this.programTypeClicked(type)
            }}
            type="checkbox"
          />
          &nbsp;{formattedType}
        </label>
      )
    })
    const allTypesSelected = _.size(programTypes) === _.size(allProgramTypes)
    const selectAllLabel = allTypesSelected ? 'Deselect All' : 'Select All'
    displayTypes.unshift(
      <button
        className="btn btn-sec selectAllErrorTypes"
        key="all-types"
        onClick={this.selectAllProgramTypes}
      >
        {selectAllLabel}
      </button>
    )
    return displayTypes
  }

  render() {
    const { filters, showArchive, allStations, programTitles } = this.props
    const {
      showErrorTypeDropdown,
      showProgramTypeDropdown,
      showStations,
      showStationSearch,
      foundStation,
    } = this.state

    const stationFilterClass = `dropdownOptions stationFilterDropdown ${showStations ? 'open' : ''}`
    const stationSearchClass = `stationSearch ${showStationSearch ? 'open' : ''}`
    const filteredStationCount = _.get(filters, 'stations').length || 0
    const allStationsCount = getEnabledStations(allStations).length || 0
    const allStationsSelected = filteredStationCount === allStationsCount
    const stationsPlural =
      filteredStationCount === 0 || filteredStationCount > 1 || allStationsSelected
    const stationCountDisplay = `${allStationsSelected ? 'All' : filteredStationCount} Station${
      stationsPlural ? 's' : ''
    }`

    const errorTypeFilterClass = `dropdownOptions errorTypeFilterDropdown ${
      showErrorTypeDropdown ? 'open' : ''
    }`
    const allErrorTypes = getAllErrorTypes() || {}
    const allErrorTypesCount = _.size(allErrorTypes)
    const filteredErrorTypesCount = _.get(filters, 'errorType').length || 0
    const allErrorTypesSelected =
      filteredErrorTypesCount > 0 && filteredErrorTypesCount === allErrorTypesCount
    const errorTypesPlural =
      filteredErrorTypesCount === 0 || filteredErrorTypesCount > 1 || allErrorTypesSelected
    const errorTypeDisplay = `${
      allErrorTypesSelected ? 'All' : filteredErrorTypesCount
    } Error Type${errorTypesPlural ? 's' : ''}`

    const programTypeFilterClass = `dropdownOptions programTypeFilterDropdown ${
      showProgramTypeDropdown ? 'open' : ''
    }`
    const allProgramTypes = getProgramTypes() || {}
    const allProgramTypesCount = _.size(allProgramTypes)
    const filteredProgramTypesCount = _.get(filters, 'programType').length || 0
    const allProgramTypesSelected =
      filteredProgramTypesCount > 0 && filteredProgramTypesCount === allProgramTypesCount
    const programTypesPlural =
      filteredProgramTypesCount === 0 || filteredProgramTypesCount > 1 || allProgramTypesSelected
    const programTypeDisplay = `${
      allProgramTypesSelected ? 'All' : filteredProgramTypesCount
    } Program Type${programTypesPlural ? 's' : ''}`

    const minDate = showArchive
      ? moment().subtract(30, 'days').format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD')
    const maxDate = moment().add(14, 'days').format('YYYY-MM-DD')

    return (
      <div className="program-filters no-print">
        {this.renderArchiveTitle()}
        <div className="filters container">
          <label htmlFor="nameFilter">
            <div className="filterLabel">Program Name</div>
            <SuggestedSearch
              autoCompleteDisplayLimit={19}
              clearSearchOnSubmit={false}
              containerClass="nameFilterContainer"
              id="nameFilter"
              minSearchLength={3}
              onSubmit={this.nameFilterChanged}
              placeholderText="search"
              searchableItems={programTitles}
            />
          </label>

          <label htmlFor="fromFilter">
            <div className="filterLabel">From</div>
            <DatePicker
              className="form-control filterInput datepicker"
              dateFormat="MM/DD/YY"
              maxDate={maxDate}
              minDate={minDate}
              name="from"
              onChange={this.fromFilterChanged}
              placeholderText="mm/dd/yy"
              ref={(c) => {
                this.fromFilter = c
              }}
              selected={filters.from}
            >
              <input
                className="datePickerButton today"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'from',
                    date: moment().format('YYYY-MM-DD'),
                  })
                }}
                type="button"
                value="Today"
              />
              <input
                className="datePickerButton tomorrow"
                data-date={moment().add(1, 'd').format('YYYY-MM-DD')}
                data-filter="from"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'from',
                    date: moment().add(1, 'd').format('YYYY-MM-DD'),
                  })
                }}
                type="button"
                value="Tomorrow"
              />
            </DatePicker>
            <Glyphicon
              className="datepicker icon"
              glyph="triangle-bottom"
              onClick={() => {
                this.fromFilter.setOpen(true)
              }}
            />
          </label>

          <label className="filterLabel" htmlFor="toFilter">
            <div>To</div>
            <DatePicker
              className="form-control filterInput datepicker"
              dateFormat="MM/DD/YY"
              maxDate={maxDate}
              minDate={minDate}
              name="to"
              onChange={this.toFilterChanged}
              placeholderText="mm/dd/yy"
              ref={(c) => {
                this.toFilter = c
              }}
              selected={filters.to}
            >
              <input
                className="datePickerButton today"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'to',
                    date: moment().format('YYYY-MM-DD'),
                  })
                }}
                type="button"
                value="Today"
              />
              <input
                className="datePickerButton tomorrow"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'to',
                    date: moment().add(1, 'd').format('YYYY-MM-DD'),
                  })
                }}
                type="button"
                value="Tomorrow"
              />
            </DatePicker>
            <Glyphicon
              className="datepicker icon"
              glyph="triangle-bottom"
              onClick={() => {
                this.toFilter.setOpen(true)
              }}
            />
          </label>

          <div className="stationFilter">
            <div className="filterLabel">Station</div>
            <div className="dropdown">
              <input
                className="form-control filterInput display"
                id="stationFilter"
                onClick={this.showStationOptions}
                readOnly
                type="text"
                value={stationCountDisplay}
              />
              <Glyphicon
                className="icon"
                glyph="triangle-bottom"
                onClick={this.showStationOptions}
              />
              {showStations && (
                <button
                  className="backdrop"
                  onClick={() => {
                    this.setState({ showStations: false })
                  }}
                />
              )}
              <div className={stationFilterClass}>
                <div className="point" />
                <h4>Station Group Shortcuts</h4>
                {this.renderStationGroups()}
                <div className="clear-fix" />
                <button className="no-style stationSearchToggle" onClick={this.toggleStationSearch}>
                  Find Stations
                  <Glyphicon
                    className="stationSearchArrow"
                    glyph={
                      this.state.showStationSearch === true ? 'triangle-bottom' : 'triangle-right'
                    }
                  />
                </button>
                <div className={stationSearchClass}>
                  <input
                    className="form-control stationSearchInput"
                    onChange={this.stationSearchChanged}
                    onKeyUp={this.stationSearchKeyUp}
                    ref={(input) => {
                      this.stationSearch = input
                    }}
                    type="text"
                  />
                  <input
                    className="form-control stationSearchInputSuggestion"
                    onClick={() => {
                      this.stationSearch.focus()
                    }}
                    readOnly
                    type="text"
                    value={foundStation}
                  />
                  <button className="btn btn-sec addStationButton" onClick={this.addStationClicked}>
                    Add Station
                  </button>
                  <div className="selectedStations">{this.renderSelectedStations()}</div>
                </div>
                <button className="btn btn-sec stationOptions" onClick={this.selectAllClicked}>
                  Select All
                </button>
                <button className="btn btn-sec stationOptions" onClick={this.clearAllClicked}>
                  Clear All
                </button>
                <button
                  className="btn btn-prim active stationDone"
                  disabled={_.isEmpty(filters.stations)}
                  onClick={this.hideStationOptions}
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          <label htmlFor="sourceFilter">
            <div className="filterLabel">Data Source</div>
            <select
              className="form-control filterInput"
              id="sourceFilter"
              onChange={this.sourceFilterChanged}
              value={filters.source}
            >
              <option value="all">All Sources</option>
              <option value="API">API</option>
              <option value="MPX">MPX</option>
              <option value="MSA">MSA</option>
            </select>
          </label>

          <label htmlFor="errorTypeFilter">
            <div className="filterLabel">Error Type</div>
            <div className="dropdown">
              <input
                className="form-control filterInput display"
                id="errorTypeFilter"
                onClick={() => {
                  this.setState({ showErrorTypeDropdown: !showErrorTypeDropdown })
                }}
                readOnly
                type="text"
                value={errorTypeDisplay}
              />
              <Glyphicon className="icon" glyph="triangle-bottom" />
              {showErrorTypeDropdown && (
                <button
                  className="backdrop"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ showErrorTypeDropdown: false })
                  }}
                />
              )}
              <div className={errorTypeFilterClass}>
                <div className="point" />
                {this.renderErrorTypeOptions(filters.errorType)}
              </div>
            </div>
          </label>

          <label htmlFor="programTypeFilter">
            <div className="filterLabel">Program Type</div>
            <div className="dropdown">
              <input
                className="form-control filterInput display"
                id="programTypeFilter"
                onClick={() => {
                  this.setState({ showProgramTypeDropdown: !showProgramTypeDropdown })
                }}
                readOnly
                type="text"
                value={programTypeDisplay}
              />
              <Glyphicon className="icon" glyph="triangle-bottom" />
              {showProgramTypeDropdown && (
                <button
                  className="backdrop"
                  onClick={(e) => {
                    e.preventDefault()
                    this.setState({ showProgramTypeDropdown: false })
                  }}
                />
              )}
              <div className={programTypeFilterClass}>
                <div className="point" />
                {this.renderProgramTypeOptions(filters.programType)}
              </div>
            </div>
          </label>

          <button className="btn btn-sec" onClick={this.clearFilters}>
            Reset Filters
          </button>
        </div>
      </div>
    )
  }
}

/* eslint-disable react/forbid-prop-types */
ProgramFilters.propTypes = {
  allStations: PropTypes.arrayOf(PropTypes.object),
  stationGroups: PropTypes.arrayOf(PropTypes.shape({})),
  filters: PropTypes.shape({
    level: PropTypes.string.isRequired,
    from: PropTypes.object.isRequired,
    to: PropTypes.object.isRequired,
    source: PropTypes.string.isRequired,
    stations: PropTypes.array.isRequired,
    errorType: PropTypes.arrayOf(PropTypes.string).isRequired,
    programType: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  listings: PropTypes.object,
  programTitles: PropTypes.arrayOf(PropTypes.shape({})),
  showArchive: PropTypes.bool.isRequired,
  updateFilters: PropTypes.func.isRequired,
}

ProgramFilters.defaultProps = {
  allStations: [],
  programTitles: null,
  stationGroups: [],
  listings: {},
}

export default ProgramFilters
