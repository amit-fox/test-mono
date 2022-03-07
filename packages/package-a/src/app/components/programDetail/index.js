import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import { Glyphicon } from 'react-bootstrap'

import {
  getSeverity,
  getTypes,
  getAllErrorTypes,
  getSources,
  checkIfIgnored,
  getMaterialIdConflicts,
  sortErrorsBySource,
  formatErrorTypes,
} from '../../helpers/programHelpers'
import ConfirmModal from '../confirmModal'

import { getListingInfoFieldData, getProgramInfoFieldData } from './programDetailHelpers'
import ProgramDetailField from './components/programDetailField'
import { updateError } from './programDetailActions'
import './programDetail.scss'

class ProgramDetail extends Component {
  constructor(props) {
    super(props)
    this.setSource = this.setSource.bind(this)
    this.onNoteChange = this.onNoteChange.bind(this)
    this.hasError = this.hasError.bind(this)
    this.setSource = this.setSource.bind(this)
    this.state = {
      sourceIndex: 0,
      errorNotes: null,
      showIgnoreModal: false,
      showNoteSuccess: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedListing } = this.props
    const { selectedListing: nextSelectedListing } = nextProps
    const currentId = _.get(selectedListing, 'id')
    const nextId = _.get(nextSelectedListing, 'id')
    if (nextId && currentId !== nextId) {
      this.setState({
        sourceIndex: 0,
        errorNotes: null,
        showNoteSuccess: false,
      })
    }
  }

  onNoteChange(event) {
    this.setState({ errorNotes: event.target.value, showNoteSuccess: false })
  }

  setSource(sourceIndex) {
    this.setState({ sourceIndex })
  }

  hasError(errors, type, text) {
    const hasError = _.find(errors, (e) => {
      // Type can be string or [string]
      if (Array.isArray(type)) {
        let error = false
        for (const errorType of type) {
          if (errorType === e.type) error = true
        }
        return error
      } else {
        return e.type === type
      }
    })
    if (hasError) return true

    const { allowedCharacters } = this.props
    const hasBadCharacters = _.find(errors, (e) => e.type === 'badCharacters')
    if (hasBadCharacters && text && allowedCharacters) {
      const textCharacters = text.split('')
      const badCharacters = _.filter(textCharacters, (c) => !_.includes(allowedCharacters, c))
      if (!_.isEmpty(badCharacters)) return true
    }
    return false
  }

  renderSourceOptions(sources) {
    if (sources.length <= 1) return null
    const { sourceIndex } = this.state
    const sourceOptions = _.map(sources, (source, index) => {
      let badgeClass = `badge ${source.toLowerCase()}`
      let buttonClass = 'sourceOption'
      if (index === sourceIndex) {
        buttonClass += ' selected'
      }
      return (
        <button
          className={buttonClass}
          key={source}
          onClick={() => {
            this.setSource(index)
          }}
          to="#"
        >
          <div className={badgeClass}>{source.toUpperCase()}</div>
        </button>
      )
    })
    return (
      <div>
        <div className="sourceOptions">{sourceOptions}</div>
        <div className="sourceOptionsClear" />
      </div>
    )
  }

  renderErrorEvents(events) {
    if (!events || !events.length) return
    return (
      <div>
        <h5>Activity:</h5>
        <table className="activityTable">
          <thead>
            <tr>
              <th className="dateColumn">Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {_.map(events, (e) => {
              const id = _.get(e, '_id')
              const description = _.get(e, 'description', 'N/A')
              const date = _.get(e, 'date')
              const displayDate = date ? moment(date, 'x').format('MM/DD/YY h:mm A') : 'N/A'
              return (
                <tr key={id}>
                  <td>{displayDate}</td>
                  <td>{description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  renderErrorNotes(notes) {
    if (!notes || !notes.length) return
    return (
      <div>
        {_.map(notes, (n) => {
          const id = _.get(n, '_id')
          const author = _.get(n, 'user.email', 'N/A')
          const body = _.get(n, 'description', 'N/A')
          const date = _.get(n, 'date')
          const displayDate = date ? moment(date).format('MM/DD/YY h:mm A') : 'N/A'
          return (
            <div key={id}>
              <div>
                <span className="noteAuthor">{author}</span>
                <span className="noteDate"> on {displayDate}</span>
              </div>
              <div className="noteBody">{body}</div>
            </div>
          )
        })}
      </div>
    )
  }

  renderUpdate(errors, showIgnoreModal, showNoteSuccess, errorNotes) {
    if (!errors || errors.length === 0) return null
    const {
      accessToken,
      errorHandler,
      hideDetail,
      updateError,
      updateErrorCallback,
      selectedListing,
      showArchive,
      account,
    } = this.props
    const isIgnored = checkIfIgnored(errors)
    const notesList = _.get(errors, '[0].notes')
    const errorIds = errors && errors.length > 0 ? _.map(errors, (e) => e['_id']) : null
    const events = _.get(errors, '[0].events')
    const handleIgnore = () => {
      updateError({
        accessToken,
        listingId: selectedListing.id,
        errorIds,
        isIgnored: !isIgnored,
        notes: errorNotes,
        account,
        callback: updateErrorCallback,
        errorHandler,
      })
      hideDetail()
      this.setState({ showIgnoreModal: false })
    }
    const handleNote = () => {
      if (errorNotes !== null)
        updateError({
          accessToken,
          listingId: selectedListing.id,
          errorIds,
          notes: errorNotes,
          account,
          callback: updateErrorCallback,
          errorHandler,
        })
      this.setState({
        showNoteSuccess: true,
        errorNotes: null,
      })
    }
    const hideModal = () => {
      this.setState({ showIgnoreModal: false })
    }

    const confirmModalProps = {
      description: 'Make sure any notes have already been entered.',
      hideModal,
      onPrimaryClick: handleIgnore,
      primaryButtonText: isIgnored ? 'Un-ignore' : 'Ignore',
      shouldRenderModal: showIgnoreModal,
      title: `Are you sure you want to ${isIgnored ? 'UN-IGNORE' : 'IGNORE'} this listing?`,
    }

    return (
      <div>
        <div>
          <h5>Notes:</h5>
          {this.renderErrorNotes(notesList)}
          {showNoteSuccess ? 'Note Saved!' : null}
          <textarea
            className="notes"
            onChange={this.onNoteChange}
            placeholder="Leave a note"
            value={errorNotes || ''}
          />
          <button className="btn btn-prim small active" onClick={handleNote}>
            Add Note
          </button>
          {(!showArchive || (showArchive && isIgnored)) && (
            <button
              className="btn btn-prim small active pull-right"
              onClick={() => {
                this.setState({ showIgnoreModal: true })
              }}
            >
              {isIgnored ? 'Un-ignore' : 'Ignore'}
            </button>
          )}
        </div>
        {this.renderErrorEvents(events)}
        <ConfirmModal {...confirmModalProps} />
      </div>
    )
  }

  render() {
    const {
      selectedListing: originalSelectedListing,
      detailOpen,
      hideDetail,
      showArchive,
      isEPG,
    } = this.props
    const { errorNotes } = this.state
    if (!originalSelectedListing) return <div className="program-detail" />

    const { errors } = originalSelectedListing
    const sources =
      errors && errors.length > 0 ? getSources(errors) : [originalSelectedListing.dataSource]
    const { sourceIndex, showIgnoreModal, showNoteSuccess } = this.state
    const source = sources[sourceIndex]
    const badgeClass = `source badge ${source.toLowerCase()}`

    let selectedListing
    if (sources.length > 1) {
      let sourceError =
        _.find(errors, (error) => {
          return error.dataSource === source
        }) || []

      // TODO: Remove after demo
      // if (source === 'MSA'){
      // sourceError = _.find(errors, (error) => { return error.dataSource === 'MPX' })
      // }
      selectedListing = sourceError.listing
    } else {
      selectedListing = originalSelectedListing
    }

    const sortedErrors = sortErrorsBySource(errors)
    const currentErrors = _.get(sortedErrors, source, [])
    const types = getTypes(currentErrors)
    const allErrorTypes = getAllErrorTypes(showArchive || isEPG)
    const formattedTypes = formatErrorTypes({ types, allErrorTypes })
    const severity = getSeverity(currentErrors)
    const sliderClass = `program-detail ${selectedListing !== null ? severity : ''} ${
      detailOpen ? 'open' : ''
    }`
    const hasMaterialIdConflict = this.hasError(currentErrors, 'materialIdConflict')
    const materialIdConflicts = getMaterialIdConflicts(currentErrors)
    const listingInfoFieldData = getListingInfoFieldData(selectedListing)
    const programInfoFieldData = getProgramInfoFieldData({
      hasMaterialIdConflict,
      listing: selectedListing,
      materialIdConflicts,
      source,
    })
    const onHideDetailClick = () => {
      this.setSource(0)
      hideDetail()
    }
    return (
      <div className={sliderClass}>
        <button className="no-style hide-detail" onClick={onHideDetailClick}>
          <Glyphicon glyph="chevron-right" />
        </button>
        <div className="program-detail-inner scrollable">
          {currentErrors.length > 0 && (
            <h4>
              {severity}: {formattedTypes.join(', ')}
            </h4>
          )}
          {this.renderSourceOptions(sources)}
          <div>
            <h5>
              Listing Info:
              <div className={badgeClass}>{source}</div>
            </h5>
            {_.map(listingInfoFieldData, (fieldData) => (
              <ProgramDetailField
                {...fieldData}
                currentErrors={currentErrors}
                dataSource={source}
                hasError={this.hasError}
                key={fieldData.label}
              />
            ))}
          </div>
          <div>
            <h5>
              Program Info:
              <div className={badgeClass}>{source}</div>
            </h5>
            {_.map(programInfoFieldData, (fieldData) => (
              <ProgramDetailField
                {...fieldData}
                currentErrors={currentErrors}
                dataSource={source}
                hasError={this.hasError}
                key={fieldData.label}
              />
            ))}
          </div>
          {this.renderUpdate(errors, showIgnoreModal, showNoteSuccess, errorNotes)}
        </div>
      </div>
    )
  }
}

/* eslint-disable react/forbid-prop-types */
ProgramDetail.propTypes = {
  accessToken: PropTypes.string,
  allowedCharacters: PropTypes.string,
  detailOpen: PropTypes.bool.isRequired,
  errorHandler: PropTypes.func.isRequired,
  hideDetail: PropTypes.func.isRequired,
  isEPG: PropTypes.bool,
  selectedListing: PropTypes.object,
  showArchive: PropTypes.bool,
  updateError: PropTypes.func.isRequired,
  updateErrorCallback: PropTypes.func,
  account: PropTypes.shape({}),
}

ProgramDetail.defaultProps = {
  accessToken: null,
  allowedCharacters: null,
  isEPG: false,
  selectedListing: null,
  updateErrorCallback: () => {},
  account: null,
  showArchive: false,
}

export default connect(null, {
  updateError,
})(ProgramDetail)
