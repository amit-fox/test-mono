import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'

import {
  getDmaChannels,
  getDmaFromCallSign
} from '../../helpers/filterHelpers'
import './guideFilters.scss'

const GUIDE_TIMES = () => {
  let guide_times = []
  let time = moment().startOf('day')
  const day = time.day()
  while(time.day() === day){
    guide_times.push(time.format('h:mm A'))
    time.add(30, 'minutes')
  }
  return guide_times
}

class GuideFilters extends Component {
  constructor(props){
    super(props)
    this.callSignFilterChanged = this.callSignFilterChanged.bind(this)
    this.snapshotDateFilterChanged = this.snapshotDateFilterChanged.bind(this)
    this.viewDateFilterChanged = this.viewDateFilterChanged.bind(this)
    this.snapshotTimeFilterChanged = this.snapshotTimeFilterChanged.bind(this)
    this.viewTimeFilterChanged = this.viewTimeFilterChanged.bind(this)
    this.datePickerButtonClicked = this.datePickerButtonClicked.bind(this)
    this.channelClicked = this.channelClicked.bind(this)
    this.sourceFilterChanged = this.sourceFilterChanged.bind(this)
    this.state = {
      callSignInput: '',
      dmaChannels: [],
      startDate: moment(),
      showChannelDropdown: false
    }
  }
  
  componentWillMount() {
    const { filters: { callSign, dma }, isEPG } = this.props
    const callSignInput = isEPG ? dma : callSign
    this.setState({ callSignInput })
  }

  componentDidMount(){
      const { updateFilters, urlCallSign } = this.props
      if (urlCallSign){
        const { urlSnapshot, urlView, urlDataSource } = this.props
        const snapshotDatetime = moment(urlSnapshot, 'YYYY-MM-DD_h:mm_A')
        const viewDatetime = moment(urlView, 'YYYY-MM-DD_h:mm_A')
        
        this.updateDmaFilter({ dmaOrCallSign: urlCallSign })
        updateFilters({
          snapshotDate: snapshotDatetime,
          snapshotTime: snapshotDatetime.format('h:mm A'),
          viewDate: viewDatetime,
          viewTime: viewDatetime.format('h:mm A'),
          source: urlDataSource,
          stations: [urlCallSign]
        })
      }
  }

  componentWillReceiveProps(nextProps) {
    const {
      filters: {
        dma: nextDma,
        callSign: nextCallSign
      },
      updateFilters
    } = nextProps
    const { callSignInput } = this.state

    if (nextCallSign && callSignInput !== nextCallSign) {
      this.setState({ callSignInput: nextCallSign || '' })
    }
    if (nextDma && callSignInput !== nextDma) {
      this.setState({ callSignInput: nextDma || '' })
      const dmaChannels = this.getChannelsFromDmaOrCallSign(nextDma)
      this.handleDmaChannelChange(dmaChannels)
      updateFilters({ stations: _.cloneDeep(dmaChannels) })
    }
  }
  
  componentDidUpdate(prevProps){
    const { allStations: prevAllStations } = prevProps
    const { allStations, filters: { dma, callSign } } = this.props
    if (prevAllStations.length === 0 && allStations.length > 0) {
      if (dma) {
        this.updateDmaFilter({ dmaOrCallSign: dma })
      } else if (callSign) {
        this.updateCallSignFilter(callSign)
      }
    }
  }

  getChannelsFromDmaOrCallSign(dmaOrCallSign) {
    const { allStations } = this.props
    const dmaChannels = getDmaChannels(dmaOrCallSign, allStations)
    if (dmaChannels.length > 0) return dmaChannels
    const newDma = getDmaFromCallSign(dmaOrCallSign, allStations)
    if (newDma) return getDmaChannels(newDma, allStations)
    return []
  }

  snapshotDateFilterChanged(date) {
    this.props.updateFilters({snapshotDate: date})
  }

  viewDateFilterChanged(date) {
    this.props.updateFilters({viewDate: date})
  }

  snapshotTimeFilterChanged(e) {
    this.props.updateFilters({snapshotTime: e.target.value})
  }

  viewTimeFilterChanged(e) {
    this.props.updateFilters({viewTime: e.target.value})
  }
  
  sourceFilterChanged(e) {
    this.props.updateFilters({source: e.target.value})
  }

  datePickerButtonClicked({ filter, date }) {
    const newFilter = {
      [filter]: moment(date)
    }
    this.props.updateFilters(newFilter)
    this[filter+'Filter'].setOpen(false)
  }

  updateDmaFilter({ dmaOrCallSign, channel }) {
    const {
      updateFilters,
      filters: { dma: dmaFilter, stations }
    } = this.props
    let dmaChannels = []
    if (channel){
      dmaChannels = [channel]
    } else if (!channel && dmaOrCallSign.length > 1){
      dmaChannels = this.getChannelsFromDmaOrCallSign(dmaOrCallSign)
    }
    this.handleDmaChannelChange(dmaChannels)
    const dmaChanged = dmaFilter !== dmaOrCallSign
    const dmaChannelsChanged = dmaChannels && _.isEmpty(stations)
    if (dmaChanged || dmaChannelsChanged) {
      updateFilters({
        stations: _.cloneDeep(dmaChannels),
        dma: dmaOrCallSign
      })
    }
  }

  handleDmaChannelChange(dmaChannels) {
    const { updateDmaChannels } = this.props
    if (dmaChannels.length === 0){
      this.setState({
        'showChannelDropdown': false
      })
      this.props.toggleFilters(false)
    } else {
      this.props.toggleFilters(true)
    }
    updateDmaChannels(dmaChannels)
  }
  
  callSignFilterChanged(event) {
    const { isEPG } = this.props
    const callSign = _.toUpper(event.target.value)
    this.setState({ callSignInput: callSign })
    if (isEPG) {
      this.updateDmaFilter({ dmaOrCallSign: callSign })
    } else {
      this.updateCallSignFilter(callSign)
    }
  }
  
  updateCallSignFilter(callSign) {
    const { updateFilters } = this.props
    updateFilters({ callSign })
  }

  channelClicked(channel) {
    const { stations } = this.props.filters
    if (stations.indexOf(channel) !== -1){
      stations.splice(stations.indexOf(channel), 1)
    } else {
      stations.push(channel)
    }
    this.props.updateFilters({ stations })
  }

  renderChannels(stations) {
    const { dmaChannels } = this.props
    return _.map(dmaChannels, (channel) => {
      return (
        <label className="channel" htmlFor={"channel-" + channel} key={channel}>
          <input checked={stations.indexOf(channel) !== -1 ? true : false} id={"channel-" + channel} onChange={()=>{ this.channelClicked(channel) }} type="checkbox" />&nbsp;{channel}
        </label>
      )
    })
  }

  renderSnapshotTimeOptions() {
    const { snapshotDate } = this.props.filters
    if (!snapshotDate) return null
    return GUIDE_TIMES().map((time) => {
      let option = null
      if (moment(snapshotDate.format('YYYY-MM-DD ') + time, 'YYYY-MM-DD h:mm A') <= moment().subtract(30, 'minutes')){
        option = <option key={time} value={time}>{time}</option>
      }
      return option
    })
  }

  renderViewTimeOptions() {
    const { panels, filters: { viewDate } } = this.props
    if (!viewDate) return null
    const day = viewDate.format('YYYY-MM-DD ')
    const startDate = _.get(panels, '0.startDate', null)
    const endDate = _.get(panels, '0.endDate', null)
    if (!startDate || !endDate) return null
    const snapshotStart = moment(startDate).subtract(30, 'minutes')
    const snapshotEnd = moment(endDate)
    return GUIDE_TIMES().map((time) => {
      let option = null
      let optionTime = moment(day + time, 'YYYY-MM-DD h:mm A')
      if (optionTime >= snapshotStart && optionTime < snapshotEnd){
        option = <option key={time} value={time}>{time}</option>
      }
      return option
    })
  }
  
  renderLocationFilter() {
    const { isEPG } = this.props
    const { callSignInput } = this.state
    const label = isEPG ? 'DMA / CallSign' : 'CallSign'
    return (
      <label htmlFor="locationFilter">
        <div className="filterLabel">{label}</div>
        <input
          className="form-control filterInput small"
          id="locationFilter"
          onChange={this.callSignFilterChanged}
          type="text"
          value={callSignInput}
        />
      </label>
    )
  }
  
  renderChannelFilter({ dmaChannels }) {
    const { filters, filtersActive, isEPG } = this.props
    if (!isEPG) return null
    
    const { showChannelDropdown } = this.state
    const channelFilterClass = `dropdownOptions channelFilterDropdown ${showChannelDropdown ? 'open' : ''}`
    const stationFilterCount = filters.stations.length
    const dmaChannelCount = dmaChannels.length
    const channelCountDisplay = stationFilterCount === dmaChannelCount ? 'All' : stationFilterCount
    const channelLabelIsPlural =
      stationFilterCount === 0 || stationFilterCount > 1 || stationFilterCount === dmaChannelCount
    const channelLabelDisplay = `Channel${channelLabelIsPlural ? 's' : ''}`
    const filteredStationCount = `${channelCountDisplay} ${channelLabelDisplay}`
    
    return (
      <label htmlFor="channelFilter">
        <div className="filterLabel">Channel</div>
        <div className="dropdown">
          <input
            className="form-control filterInput display"
            disabled={!filtersActive}
            id="channelFilter"
            onClick={()=>{ this.setState({'showChannelDropdown': !this.state.showChannelDropdown}) }}
            readOnly
            type="text"
            value={filteredStationCount}
          />
          <Glyphicon className="icon" glyph="triangle-bottom" />
          <div className={channelFilterClass}>
            <div className="point" />
            {this.renderChannels(filters.stations)}
          </div>
        </div>
      </label>
    )
  }
  
  renderTitle() {
    const { isEPG } = this.props
    if (isEPG) return null
    return <h2 className="container filterTitle">All Listings</h2>
  }
  
  render() {
    const { filters, filtersActive, dmaChannels, snapshotMin, snapshotMax, panels, isEPG } = this.props
    const snapshotEndDate = _.get(panels, '0.endDate', null)

    return (
      <div className='guide-filters'>
        {this.renderTitle()}
        <div className="filters guide-container">
          {this.renderLocationFilter()}
          {this.renderChannelFilter({ dmaChannels })}
          
          <label htmlFor="sourceFilter">
            <div className="filterLabel">Data Source</div>
            <select
              className="form-control filterInput small"
              id="sourceFilter"
              onChange={this.sourceFilterChanged}
              value={filters.source}
            >
              <option value="API">API</option>
              <option value="MPX">MPX</option>
            </select>
          </label>

          <label htmlFor="snapshotDateFilter">
            <div className="filterLabel">Snapshot Date</div>
            <DatePicker
              className="form-control filterInput small datepicker"
              dateFormat="MM/DD/YY"
              disabled={!filtersActive}
              maxDate={snapshotMax ? snapshotMax : moment()}
              minDate={snapshotMin}
              name="snapshotDate"
              onChange={this.snapshotDateFilterChanged}
              placeholderText="mm/dd/yy"
              ref={(c) => { this.snapshotDateFilter = c }}
              selected={filters.snapshotDate}
            >
              <input
                className="datePickerButton today"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'snapshotDate',
                    date: moment().format('YYYY-MM-DD')
                  })
                }}
                type="button"
                value="Today"
              />
            </DatePicker>
            <Glyphicon 
              className="datepicker icon" 
              glyph="triangle-bottom"
              onClick={()=>{ this.snapshotDateFilter.setOpen(true) }}
            />
          </label>

          <label htmlFor="snapshotTime">
            <div className="filterLabel">Snapshot Time</div>
            <select
              className="form-control filterInput small"
              disabled={!filtersActive}
              id="snapshotTime"
              onChange={this.snapshotTimeFilterChanged}
              value={filters.snapshotTime}
            >
              {this.renderSnapshotTimeOptions()}
            </select>
          </label>

          <label className="filterLabel" htmlFor="viewDateFilter">
            <div className="filterLabel">View Date</div>
            <DatePicker
              className="form-control filterInput small datepicker"
              dateFormat="MM/DD/YY"
              disabled={!filtersActive}
              maxDate={snapshotEndDate ? moment(snapshotEndDate) : null}
              minDate={filters.snapshotDate}
              name="viewDate"
              onChange={this.viewDateFilterChanged}
              placeholderText="mm/dd/yy"
              ref={(c) => { this.viewDateFilter = c }}
              selected={filters.viewDate}
            >
              <input
                className="datePickerButton today"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'viewDate',
                    date: moment().format('YYYY-MM-DD')
                  })
                }}
                type="button"
                value="Today"
              />
              <input
                className="datePickerButton tomorrow"
                onClick={() => {
                  this.datePickerButtonClicked({
                    filter: 'viewDate',
                    date: moment().add(1, 'd').format('YYYY-MM-DD')
                  })
                }}
                type="button"
                value="Tomorrow"
              />
            </DatePicker>
            <Glyphicon 
              className="datepicker icon" 
              glyph="triangle-bottom"
              onClick={()=>{ this.viewDateFilter.setOpen(true) }}
            />
          </label>

          {isEPG &&
            <label htmlFor="viewTime">
              <div className="filterLabel">View Time</div>
              <select
                className="form-control filterInput small"
                disabled={!filtersActive}
                id="viewTime"
                onChange={this.viewTimeFilterChanged}
                value={filters.viewTime}
              >
                {this.renderViewTimeOptions()}
              </select>
            </label>
          }
        </div>
      </div>
    )
  }
}

/* eslint-disable react/forbid-prop-types */
GuideFilters.propTypes = {
  allStations: PropTypes.arrayOf(PropTypes.shape({})),
  dmaChannels: PropTypes.arrayOf(PropTypes.string),
  filters: PropTypes.object.isRequired,
  filtersActive: PropTypes.bool.isRequired,
  panels: PropTypes.arrayOf(PropTypes.object),
  isEPG: PropTypes.bool,
  snapshotMin: PropTypes.string,
  snapshotMax: PropTypes.string,
  toggleFilters: PropTypes.func.isRequired,
  updateFilters: PropTypes.func.isRequired,
  updateDmaChannels: PropTypes.func,
  urlCallSign: PropTypes.string,
  urlView: PropTypes.string,
  urlSnapshot: PropTypes.string,
  urlDataSource: PropTypes.string
}

GuideFilters.defaultProps = {
  allStations: [],
  dmaChannels: [],
  panels: [],
  isEPG: false,
  snapshotMin: null,
  snapshotMax: null,
  updateDmaChannels: () => {},
  urlCallSign: null,
  urlView: null,
  urlSnapshot: null,
  urlDataSource: null
}

export default GuideFilters
