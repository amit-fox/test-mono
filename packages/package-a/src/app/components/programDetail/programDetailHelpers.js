import moment from 'moment-timezone'
import _ from 'lodash'

import { getContentType, getProgramTitles, getStreamingRightsDisplay, renderProgramDuration } from '../../helpers/programHelpers'

export const getListingInfoFieldData = (listing) => {
  const { airingType, endDate, id: listingId, isNetwork, isPrimetime, restartEnabled, showingType, startDate, station, streamingAllowed } = listing
  const { programTitle } = getProgramTitles(listing)
  const startTime = moment(startDate).format('h:mm A')
  const endTime = moment(endDate).format('h:mm A')
  const tzAbbr = moment().tz(moment.tz.guess()).format('z') // local tz (PST)

  const baseData = [
    {
      errorCheckType: ['missingProgramTitle'],
      errorCheckText: programTitle,
      label: 'Program Title',
      value: programTitle,
    },
    {
      errorCheckType: ['expiringEvergreen'],
      isHalfDisplay: true,
      label: 'Start Date',
      value: moment(startDate).format('MM/DD/YY'),
    },
    {
      isHalfDisplay: true,
      label: 'User Airtime',
      value: `${startTime} - ${endTime} ${tzAbbr}`,
    },
    {
      errorCheckType: ['missingAiringType'],
      isHalfDisplay: true,
      label: 'Airing Type',
      value: airingType,
    },
    {
      errorCheckType: ['missingShowingType'],
      isHalfDisplay: true,
      label: 'Showing Type',
      value: showingType,
    },
    {
      errorCheckType: ['missingNetwork'],
      isHalfDisplay: true,
      label: 'Station',
      value: station,
    },
    {
      isHalfDisplay: true,
      label: 'Listing ID',
      value: listingId,
    },
    {
      isHalfDisplay: true,
      label: 'Streaming Allowed',
      value: getStreamingRightsDisplay(streamingAllowed),
    },
    {
      errorCheckType: ['rightsMismatch', 'expiringEvergreen'],
      isHalfDisplay: true,
      label: 'Restart Enabled',
      value: getStreamingRightsDisplay(restartEnabled),
    },
    {
      errorCheckType: ['unexpectedNetwork'],
      // hideField: isNetwork === undefined,
      isHalfDisplay: true,
      label: 'Is Network',
      value: _.capitalize(_.toString(isNetwork)) || '(None)',
    },
    {
      errorCheckType: ['unexpectedPrimetime'],
      // hideField: isPrimetime === undefined,
      isHalfDisplay: true,
      label: 'Is Primetime',
      value: _.capitalize(_.toString(isPrimetime)) || '(None)',
    },
  ]

  return baseData
}

export const getProgramInfoFieldData = ({ hasMaterialIdConflict, listing, materialIdConflicts, source }) => {
  const {
    broadcastId,
    contentRating,
    description,
    durationInSeconds,
    episodeNumber,
    longDescription,
    longTitle,
    materialIds,
    seasonNumber,
    shortDescription,
    shortTitle,
    sportTag,
    vdmsExternalId,
    evergreen,
  } = listing
  const { programTitle, episodeTitle } = getProgramTitles(listing)
  const image = _.get(listing, 'images.still.raw', null)
  const contentType = getContentType(listing)
  const isEpisodic = contentType === 'episode' || contentType === 'series'

  return [
    {
      errorCheckType: ['missingProgramTitle', 'tba'],
      errorCheckText: programTitle,
      label: 'Program Title',
      value: programTitle,
    },
    {
      errorCheckType: null,
      errorCheckText: shortTitle,
      hideField: !shortTitle,
      label: 'Short Title',
      value: shortTitle,
    },
    {
      errorCheckType: null,
      errorCheckText: longTitle,
      hideField: !longTitle,
      label: 'Long Title',
      value: longTitle,
    },
    {
      errorCheckType: null,
      errorCheckText: episodeTitle,
      hideField: !isEpisodic,
      label: 'Episode Title',
      value: episodeTitle,
    },
    {
      errorCheckType: ['missingDescription'],
      errorCheckText: description,
      hideField: contentType === 'sportingEvent',
      label: 'Description',
      value: description,
    },
    {
      errorCheckType: null,
      errorCheckText: shortDescription,
      hideField: !shortDescription,
      label: 'Short Description',
      value: shortDescription,
    },
    {
      errorCheckType: null,
      errorCheckText: longDescription,
      hideField: !longDescription,
      label: 'Long Description',
      value: longDescription,
    },
    {
      errorCheckSource: 'API',
      errorCheckType: ['missingSeason'],
      hideField: !isEpisodic,
      isHalfDisplay: true,
      label: 'Season Number',
      value: seasonNumber,
    },
    {
      errorCheckSource: 'API',
      errorCheckType: ['missingEpisode'],
      hideField: !isEpisodic,
      isHalfDisplay: true,
      label: 'Episode Number',
      value: episodeNumber,
    },
    {
      errorCheckType: ['missingDuration'],
      isHalfDisplay: true,
      label: 'Duration',
      value: durationInSeconds ? renderProgramDuration(durationInSeconds) : null,
    },
    {
      isHalfDisplay: true,
      label: 'Content Type',
      value: contentType,
      valueClass: 'contentType',
    },
    {
      errorCheckType: ['missingSportTag'],
      hideField: contentType !== 'sportingEvent',
      isHalfDisplay: true,
      label: 'Sport Tag',
      value: sportTag,
    },
    {
      errorCheckType: ['missingRating'],
      hideField: contentType === 'sportingEvent',
      isHalfDisplay: true,
      label: 'Rating',
      value: contentRating ? contentRating.toUpperCase() : null,
    },
    {
      errorCheckType: ['missingBroadcastIdAndMaterialIds'],
      isHalfDisplay: true,
      label: 'Broadcast ID',
      value: broadcastId,
    },
    {
      errorCheckType: ['missingBroadcastIdAndMaterialIds', 'excessMaterialIds'],
      label: 'Material IDs',
      value: materialIds.length > 0 ? materialIds.join(', ') : null,
    },
    {
      hideField: !hasMaterialIdConflict,
      label: 'Material ID Conflicts',
      materialIdConflicts,
    },
    {
      errorCheckType: ['badVdmsExternalId'],
      label: 'VDMS External ID',
      value: vdmsExternalId,
    },
    {
      errorCheckType: ['unexpectedEvergreen', 'expiringEvergreen'],
      label: 'Evergreen',
      value: evergreen,
    },
    {
      imageAltText: programTitle,
      errorCheckType: ['missingImages'],
      hideField: source !== 'API',
      isImage: true,
      label: 'Image',
      value: image,
    },
  ]
}

/*
POSSIBLE VALUES:
  errorCheckSource: 'API' || 'MPX'
  errorCheckType: errorType (string)
  errorCheckText: text to check for badCharacters error (string)
  hideField: (bool)
  isHalfDisplay: (bool)
  label: (string)
  materialIdConflicts: (array)
  value: (string)
  valueClass: (string)
*/
