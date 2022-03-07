import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import classNames from 'classnames'

import { getVideoData, getVideoTimeData, calculateDurationWidth } from '../../GuideScheduleHelpers'
import './ScheduleItem.scss'

const TYPE_CURRENT = 'current'
const TYPE_FUTURE = 'future'
const TYPE_DUMMY = 'dummy'

export class ScheduleItem extends Component {
  constructor() {
    super()
    this.state = {
      openItemId: null
    }
  }

  getVideoById(id) {
    const { item } = this.props
    if (!item){ return false }
    const listings = _.get(item, 'listings', null)
    return listings.find(x => x['@id'] === id) || null
  }

  getDummyTitle(startDate) {
    const { displayPrimeTimeMessage, network } = this.props
    const textProgramNotAvailable = 'Program information unavailable'
    const textPrePrimeTime = 'Primetime starts at 8/7c'
    const dummyVideo = {
      network,
      startDate
    }
    const showPrimeTimeMessage = displayPrimeTimeMessage(dummyVideo)
    if (!showPrimeTimeMessage) return textProgramNotAvailable
    return textPrePrimeTime
  }

  calculateBlockWidth(type, video) {
    const { startingTs } = this.props
    const gridStarts = moment(startingTs * 1000)
    let diff
    let timeLeft
    let width

    const { duration, startDate, endDate } = video

    switch (type) {
      case TYPE_FUTURE:
        width = calculateDurationWidth(duration)
        break
      case TYPE_CURRENT:
        diff = moment.duration(moment(endDate).diff(gridStarts))
        timeLeft = Math.ceil(diff.asMinutes())
        width = calculateDurationWidth(timeLeft)
        break
      case TYPE_DUMMY:
        diff = moment.duration(moment(startDate).diff(gridStarts))
        timeLeft = Math.ceil(diff.asMinutes())
        width = calculateDurationWidth(timeLeft)
        break
      default:
        width = 0
        break
    }
    return width
  }
  
  calculateBlockOffset(type, video) {
    const { startingTs } = this.props
    const gridStarts = moment(startingTs * 1000)
    let diff, timeLeft, offset = 0
    
    const { startDate } = video
    
    switch (type) {
      case TYPE_FUTURE:
        diff = moment.duration(moment(startDate).diff(gridStarts))
        timeLeft = Math.ceil(diff.asMinutes())
        offset = calculateDurationWidth(timeLeft) + 12.5
        break
      case TYPE_CURRENT:
        offset = 0
        break
      case TYPE_DUMMY:
        diff = moment.duration(moment(startDate).diff(gridStarts))
        timeLeft = Math.ceil(diff.asMinutes())
        offset = calculateDurationWidth(timeLeft) + 12.5
        break
      default:
        offset = 0
        break
    }
    
    return offset
  }
  
  createBlock(data, selectedDate, id, title, subtitle, badge, errors, isDummy) {
    const videoTimeData = getVideoTimeData(data, selectedDate)
    const { starts, ends, isCurrent, startsInFuture, shouldBeVisible, startsWithGrid } = videoTimeData
    let width = null
    let offset = 0

    if (!isCurrent && !startsInFuture) { return null }
    // if starts in future, calculate the width using duration
    if (startsInFuture && !isCurrent) {
      width = this.calculateBlockWidth(TYPE_FUTURE, videoTimeData)
      offset = this.calculateBlockOffset(TYPE_FUTURE, videoTimeData)
    // if its current, calculate the timeLeft until it ends.
    } else if (isCurrent) {
      width = this.calculateBlockWidth(TYPE_CURRENT, videoTimeData)
      offset = this.calculateBlockOffset(TYPE_CURRENT, videoTimeData)
    }
    
    if (shouldBeVisible) {
      return { id, isCurrent, width, offset, title, subtitle, badge, starts, ends, isDummy, shouldBeVisible, startsWithGrid, errors }
    } else {
      return false
    }
  }

  addDummyBlocks() {
    const { errors, item, selectedDate, callSign, snapshotDate, overlapIdxs } = this.props
    const member = _.get(item, 'listings', null)
    if (!member) return null

    const blocks = []
    let i = 0
    member.forEach((video) => {
      if (_.includes(overlapIdxs, i)) return
      const errors = video.issues && video.issues.length > 0 ? video.issues : null
      const { id, title, subtitle, badge } = getVideoData(video)
      const isDummy = false
      const block = this.createBlock(video, selectedDate, id, title, subtitle, badge, errors, isDummy)
      if (block) blocks.push(block)
      i++
    })
    if (errors[callSign]) {
      errors[callSign].forEach((error) => { 
        const { _id: id, startDate, dateResolved } = error
        if (dateResolved && moment(dateResolved).isBefore(snapshotDate)) return
        const title = "Missing Listing"
        const subtitle = moment(startDate).format('h:mma')
        const badge = null
        const errors = error
        const isDummy = true
        const block = this.createBlock(error, selectedDate, 'error-'+id, title, subtitle, badge, errors, isDummy)
        if (block) blocks.push(block)
      })
    }
    return blocks
  }

  renderItems() {
    const { selectedListingId, setSelectedListing } = this.props
    const blocks = this.addDummyBlocks()
    if (!blocks) return null

    return blocks.map((block) => {
      const { id, width, offset, title, badge, starts, ends, isCurrent, isDummy, startsWithGrid, errors } = block

      const badgeElement = (badge) ? (<span className='badge'>{badge}</span>) : null

      let itemClass = (isCurrent && !startsWithGrid) ? classNames('scheduleItem', 'current') : 'scheduleItem'
      const isOpen = (this.state.openItemId === id)
      itemClass = (isOpen) ? classNames(itemClass, 'scheduleItemActive') : itemClass
      itemClass = (isDummy) ? classNames(itemClass, 'dummy') : itemClass
      itemClass = (errors) ? classNames(itemClass, 'hasError') : itemClass
      itemClass = (selectedListingId === id) ? classNames(itemClass, 'scheduleItemActive') : itemClass

      const hoverTitle = (isDummy) ? null : `${title}\n(${starts} - ${ends})`
      const styleWidth = { width: `${width}px`, left: `${offset}px` }

      return (
        <div className={itemClass} key={id} onClick={!isDummy ? ()=>{ setSelectedListing(id) } : ()=>{return false}} style={styleWidth} title={hoverTitle}>
          <span className='title'>{badgeElement}<span className='titleText'>{title}</span></span>
          <span className='subtitle'>{starts}</span>
        </div>
      )
    })
  }

  render() {
    return (
      <div className='scheduleMain'>
        { this.renderItems() }
      </div>
    )
  }
}

ScheduleItem.defaultProps = {
  errors: null,
  item: null,
  selectedDate: null,
  selectedListingId: null,
  snapshotDate: null
}

ScheduleItem.propTypes = {
  callSign: PropTypes.string.isRequired,
  errors: PropTypes.shape({}),
  item: PropTypes.shape({
    member: PropTypes.object
  }),
  startingTs: PropTypes.number.isRequired,
  displayPrimeTimeMessage: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  selectedDate: PropTypes.shape({
    member: PropTypes.object
  }),
  selectedListingId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  setSelectedListing: PropTypes.func.isRequired,
  snapshotDate: PropTypes.shape({}),
  overlapIdxs: PropTypes.arrayOf(PropTypes.number).isRequired
}

export default ScheduleItem
