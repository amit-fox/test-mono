import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import { Glyphicon } from 'react-bootstrap'

import {
  MINUTES_INTERVAL,
  INTERVAL_COUNT,
  getNetworkLogoUrl,
  getHourInterval,
  getStartingTs,
  displayPrimeTimeMessage,
  getOverlaps
} from './GuideScheduleHelpers'
import './GuideSchedule.scss'
import ScheduleItemComponent from './components/ScheduleItem'

const EPG_SCROLL_HOUR_JUMP = 2// jump two hours.

export class GuideSchedule extends Component {
  constructor() {
    super()
    this.state = {
      startingTs: getStartingTs()
    }

    this.getSelectedDate = this.getSelectedDate.bind(this)
  }

  getSelectedDate() {
    const { viewDate, viewTime } = this.props.filters
    return moment(viewDate.format('YYYY-MM-DD ') + viewTime, 'YYYY-MM-DD h:mm A')
  }
  
  getSnapshotDate() {
    const { snapshotDate, snapshotTime } = this.props.filters
    return moment(snapshotDate.format('YYYY-MM-DD ') + snapshotTime, 'YYYY-MM-DD h:mm A')
  }

  gridPrev() {
    const { setSelectedDate } = this.props
    const date = this.getSelectedDate()
    const newDate = date.subtract(EPG_SCROLL_HOUR_JUMP, 'hours')
    setSelectedDate(newDate)
  }

  gridNext() {
    const { setSelectedDate } = this.props
    const date = this.getSelectedDate()
    const newDate = date.add(EPG_SCROLL_HOUR_JUMP, 'hours')
    setSelectedDate(newDate)
  }

  checkSameDay(date) {
    const selectedDate = this.getSelectedDate()
    return (selectedDate.date() === date.date())
  }

  checkAtStarting(date) {
    const { panels } = this.props
    const snapshotStartDate = _.get(panels, '0.startDate', null)
    if (!snapshotStartDate) return true
    const startingDate = moment(snapshotStartDate)
    const startingTime = (startingDate.hour() * 60) + (Math.floor(startingDate.minute() / MINUTES_INTERVAL))
    const time = (date.hour() * 60) + (Math.floor(date.minute() / MINUTES_INTERVAL))
    return (startingDate.date() === date.date() && startingTime >= time)
  }

  checkAtEnd(date) {
    const { panels } = this.props
    const snapshotEndDate = _.get(panels, '0.endDate', null)
    if (!snapshotEndDate) return true
    const endingDate = moment(snapshotEndDate)
    const endingTime = (endingDate.hour() * 60) + (Math.floor(endingDate.minute() / MINUTES_INTERVAL))
    const gridViewEnd = date.add(2, 'hours')
    const time = (gridViewEnd.hour() * 60) + (Math.floor(gridViewEnd.minute() / MINUTES_INTERVAL))
    return (endingDate.date() === gridViewEnd.date() && endingTime <= time)
  }

  renderPanels() {
    const {
      panels,
      onChannelSelect,
      selectedListingId,
      setSelectedListing,
      filters: { stations },
      errors
    } = this.props
    if (!panels) return
    const selectedDate = this.getSelectedDate()
    const snapshotDate = this.getSnapshotDate()

    return _.map(panels, (item, rowIdx) => {
      const scheduleItems = []
      const { callSign } = item
      if (!_.includes(stations, callSign)) return null

      const network = _.get(item, 'listings.0.network')
      const networkLogo = getNetworkLogoUrl({ callSign, network })
      let networkLogoElement = null
      if (networkLogo) {
        networkLogoElement = (
          <img alt={callSign} className="networkLogo" src={networkLogo} />
        )
      }

      const shouldDisplayMessage = displayPrimeTimeMessage.bind(this, item)

      scheduleItems.push({
        logo: networkLogoElement,
        item
      })
      
      const listings = _.get(item, 'listings', null)
      const overlapIdxs = getOverlaps(listings, selectedDate)
      
      let overlapItem = null
      _.forEach(overlapIdxs, (overlapIdx) => {
        overlapItem = _.cloneDeep(item)
        overlapItem.listings = [_.cloneDeep(listings[overlapIdx])]
        scheduleItems.push({
          logo: networkLogoElement,
          item: overlapItem
        })
      })
    
      return _.map(scheduleItems, (scheduleItem, idx) => {
        return (
          <div className='scheduleRow' key={`schedulerow-${callSign}-${idx}`}>
            <div className='scheduleLeft'>{scheduleItem.logo}</div>
            <ScheduleItemComponent
              callSign={callSign}
              displayPrimeTimeMessage={shouldDisplayMessage}
              errors={errors}
              item={scheduleItem.item}
              network={network}
              overlapIdxs={overlapIdxs}
              rowIdx={rowIdx}
              selectedDate={selectedDate}
              selectedListingId={selectedListingId}
              setSelectedListing={setSelectedListing}
              snapshotDate={snapshotDate}
              startingTs={getStartingTs(selectedDate)}
              switchChannelCB={(channel) => { onChannelSelect(channel) }}
            />
          </div>
        )
      })
    })
  }

  renderTimeline() {
    const selectedDate = this.getSelectedDate()
    const hourIntervals = getHourInterval(selectedDate, MINUTES_INTERVAL, INTERVAL_COUNT)
    const intervalElement = hourIntervals.map((obj) => (
      <div key={`timeline-${obj.timeString}`}>{obj.timeString}</div>
    ))

    return (<div className="timelineMain" id="timeline-main">
      {intervalElement}
    </div>)
  }

  render() {
    const selectedDate = this.getSelectedDate()
    const atStartDate = this.checkAtStarting(selectedDate)
    const atEndDate = this.checkAtEnd(selectedDate)

    return (
      <div className='guide-container'>
        <div className='timeline' >
          <div className='timelineLeft' >
            {
              atStartDate ? <div className="timelineEmptyArrow" /> : (
                <Glyphicon className="timelineArrow" glyph="menu-left" onClick={() => { this.gridPrev() }} />
              )
            }
          </div>
          { this.renderTimeline() }
          {
            atEndDate ? <div className='timelineEmptyArrow' /> : (
              <Glyphicon className="timelineArrow" glyph="menu-right" onClick={() => { this.gridNext() }} />
            )
          }
        </div>
        { this.renderPanels() }
      </div>
    )
  }
}

GuideSchedule.defaultProps = {
  errors: null,
  onChannelSelect: null,
  panels: null,
  selectedListingId: null,
  snapshotMin: null,
  snapshotMax: null
}

GuideSchedule.propTypes = {
  errors: PropTypes.shape({}),
  filters: PropTypes.shape({
    dma: PropTypes.string,
    stations: PropTypes.array.isRequired,
    snapshotDate: PropTypes.object.isRequired,
    snapshotTime: PropTypes.string.isRequired,
    viewDate: PropTypes.object.isRequired,
    viewTime: PropTypes.string.isRequired
  }).isRequired,
  onChannelSelect: PropTypes.func,
  panels: PropTypes.arrayOf(PropTypes.object),
  selectedListingId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  setSelectedDate: PropTypes.func.isRequired,
  setSelectedListing: PropTypes.func.isRequired
}

export default GuideSchedule
