import _ from 'lodash'
import moment from 'moment'

import config from '../../../config/config.json'

export const FOX = 'FOX'
export const PANEL_TYPE_LISTING = 'listing'
export const TIME_FORMAT = 'h:mma'
export const TYPE_MOVIE = 'movie'
export const TYPE_SHOW = 'fullEpisode'
export const TYPE_EPG_LISTING = 'EPGListing'
export const HALF_HOUR_MINUTES = 30
export const WIDTH_HALF_HOUR = 252
export const MINUTES_INTERVAL = 30
export const INTERVAL_COUNT = 4

export const getLocalNetworkUrl = ({ callSign, network }) => {
  if (!callSign || (network && network !== FOX)) return null
  const adjustedCallSign = callSign.split('-')[0]
  const { networkLogoUrlAffiliate } = config
  return networkLogoUrlAffiliate.replace('{callSign}', adjustedCallSign)
}

export const getNetworkLogoUrl = ({ callSign, network = FOX }) => {
  if (!callSign) return null

  const { networkLogoUrl, networkLogoUrlMapping } = config
  
  const channel = callSign.toLowerCase()
  const channelName = _.get(networkLogoUrlMapping, channel, null)
  const channelLogo = networkLogoUrl.replace('{network}', channelName)
  const affiliateLogo = getLocalNetworkUrl({ callSign, network })
  const networkLogo = (channelName) ? channelLogo : affiliateLogo

  const defaultSize = 60
  if (!networkLogo) return null
  return `${networkLogo}?resize=*:${defaultSize}px`
}

export const getHourInterval = (_current, sentInterval, sentCount) => {
  const interval = (!sentInterval) ? 30 : sentInterval
  const count = (!sentCount) ? 4 : sentCount

  let current = (_current) ? moment(_current) : moment()

  let hourIntervals = []
  _.range(count).map((i) => {
    const currentDate = current.format('MM/DD')
    const currentHour = current.format('h')
    const currentAmPM = current.format('a')
    let currentMinute = current.format('mm')

    // calculate the first starting minute.
    if (i === 0) {
      currentMinute -= (currentMinute % interval)
    }
    current = current.set('minute', currentMinute)

    // format the minute string.
    let minuteStr = (currentMinute < 10) ? `0${currentMinute}` : currentMinute
    minuteStr = (currentMinute === 0) ? '00' : currentMinute

    const timeString = (currentMinute === 0) ? `${currentHour}${currentAmPM}` : `${currentHour}:${minuteStr}${currentAmPM}`
    const dateTimeString = `${currentDate}@${timeString}`

    hourIntervals.push({ timeString, dateTimeString, current: current.toDate() })
    current = current.add(interval, 'm')
    return true
  })
  return hourIntervals
}

export const createDateObject = (date, format) => moment(date, format).toDate()
export const createDateObjectUTC = (date, format) => moment(date, format).utc().toDate()

export const getStartingTs = (_current) => {
  _current = (_current) || new Date()


  const hourIntervals = getHourInterval(_current, MINUTES_INTERVAL, 0)
  const { current } = hourIntervals[0]
  return Math.round(current.getTime() / 1000)
}

export const calculateDurationWidth = (duration) => {
  const halfHours = Math.round(duration / HALF_HOUR_MINUTES)
  const padding = (halfHours > 1) ? (halfHours - 1) * 20 : 0
  const width = ((duration * WIDTH_HALF_HOUR) / HALF_HOUR_MINUTES) + padding
  return width
}

export const getVideoTimeData = (video, _current) => {
  if (!video) {
    return null
  }
  const current = (_current) || new Date()
  const { startDate, endDate } = video


   // Time Calculations
  const momentNow = moment(current)
  const momentStarts = moment(startDate)
  const momentEnds = moment(endDate)
  const momentTwoHoursFromNow = moment(current).add(2, 'hours')

  const starts = momentStarts.format(TIME_FORMAT)
  const ends = momentEnds.format(TIME_FORMAT)

  const diff = moment.duration(momentEnds.diff(momentStarts))
  const duration = parseInt(diff.asMinutes(), 10)

  const startsInFuture = momentStarts.isAfter(momentNow)
  const startsWithGrid = momentNow.isSame(momentStarts)
  const isCurrent = startsWithGrid || momentNow.isBetween(momentStarts, momentEnds)
  const shouldBeVisible = startsWithGrid || isCurrent || (startsInFuture && !momentStarts.isAfter(momentTwoHoursFromNow))
  return { startDate, endDate, starts, ends, duration, startsInFuture, isCurrent, shouldBeVisible, startsWithGrid }
}

export const isVideoLive = (item) => {
  const startDate = _.get(item, 'startDate', null)
  const endDate = _.get(item, 'endDate', null)
  const momentStarts = moment(startDate)
  const momentEnds = moment(endDate)
  const momentNow = moment(new Date())
  return momentNow.isBetween(momentStarts, momentEnds)
}

export const getVideoData = (video) => {
  if (!video) {
    return null
  }

  const {
    '@id': id,
    images,
    name,
    secondaryTitle,
    seriesName,
    originalAirDate,
    contentRating,
    subRatings,
    description,
    startDate,
    endDate,
    videoType,
    fullEpisodeCount,
    requiresAuthLive,
    isFullEpisode
  } = video
  const networks = []
  const dummyTitle = 'Program information unavailable'
  const momentStarts = moment(startDate)
  const momentEnds = moment(endDate)
  const starts = momentStarts.format(TIME_FORMAT)
  const ends = momentEnds.format(TIME_FORMAT)
  const image = _.get(images, 'videoList.HD', null)
  let title = seriesName
  const airDate = originalAirDate
  const rating = contentRating
  const subRating = subRatings
  const ratingText = (!rating && !subRating) ? null : `${rating} ${subRating}`
  let subtitle = null
  let metadata = null
  // the only valid badge for the epg is NEW.
  let badge = null

  if (badge) badge = badge.toUpperCase()

  badge = (badge === 'NEW') ? badge : null

  switch (video.videoType) {
    case TYPE_SHOW: {
      const { seasonNumber, episodeNumber } = video
      subtitle = (seasonNumber && episodeNumber) ? `S${seasonNumber} E${episodeNumber} ${secondaryTitle}` : secondaryTitle
      metadata = [airDate, ratingText]
      break
    }
    case TYPE_MOVIE:
      subtitle = starts
      metadata = null
      break
    default:
      subtitle = name
      break
  }

  if (!title) {
    if (subtitle) {
      title = subtitle
      subtitle = null
    } else {
      title = dummyTitle
    }
  }

  const videoData = {
    id,
    title,
    subtitle,
    subtitleName: name,
    description,
    metadata,
    starts,
    ends,
    image,
    videoType,
    badge,
    startDate,
    endDate,
    fullEpisodeCount,
    requiresAuthLive,
    isFullEpisode,
    networks
  }

  return videoData
}

export const displayPrimeTimeMessage = (panel, video) => {
  const network = _.get(video, 'network', null)
  if (network !== 'fox') return false

  const items = _.get(panel, 'items.member')
  const firstItem = _.first(items)
  const lastItem = _.last(items)
  const isFirstEpgListing = _.get(firstItem, '@type') === TYPE_EPG_LISTING
  const isLastEpgListing = _.get(lastItem, '@type') === TYPE_EPG_LISTING
  if (!isFirstEpgListing || !isLastEpgListing) {
    return false
  }

  const videoStartDate = _.get(video, 'startDate', moment())
  const isBefore = moment(videoStartDate).isBefore(firstItem.startDate)
  const isAfter = moment(videoStartDate).isAfter(lastItem.endDate)
  // check if it's before or after primetime.
  return (isBefore || isAfter)
}

export const isVisible = (video, selectedDate) => {
  const gridEnd = _.cloneDeep(selectedDate).add(2, 'hours')
  const momentStart = moment(video.startDate)
  const momentEnd = moment(video.endDate)
  if (
    (!momentStart.isBefore(selectedDate) && momentStart.isBefore(gridEnd)) ||
    (momentEnd.isAfter(selectedDate) && !momentEnd.isAfter(gridEnd)) ||
    (momentStart.isBefore(selectedDate) && momentEnd.isAfter(gridEnd))
  ) {
    return true
  } 
  return false
}

export const getOverlaps = (listings, selectedDate) => {
  let overlapIdxs = []
  let i = -1
  _.forEach(listings, (listing) => {
    i++
    if (i === 0 || !isVisible(listing, selectedDate)) return    
    const currentStart = moment(listing.startDate)
    let prevListing = null
    for(let k = 0; k < i; k++) {
      prevListing = listings[k]
      if (isVisible(prevListing, selectedDate) && currentStart.isBefore(moment(prevListing.endDate))) {
        overlapIdxs.push(i)
        break
      }
    }
  })
  return overlapIdxs
}

export const fetchSortOrder = (panel) => {
  const panelOrder = _.keys(_.get(config, 'networkLogoUrlMapping', {}))
  const callSign = _.get(panel, 'callSign')
  if (_.isEmpty(panelOrder) || !callSign) return 0
  return _.findIndex(panelOrder, orderedCallSign => orderedCallSign === callSign.toLowerCase())
}
