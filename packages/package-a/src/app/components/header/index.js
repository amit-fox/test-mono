import React, { Component } from 'react'
import moment from 'moment'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes, { instanceOf } from 'prop-types'
import _ from 'lodash'
import { withCookies, Cookies } from 'react-cookie'

import ConfirmModal from '../confirmModal'
import { saveAllowedCharacters } from '../../screens/admin/characterConfig/characterConfigActions'
import { saveRulesets } from '../../screens/admin/errorType/errorTypeActions'
import { saveGroups } from '../../screens/admin/stationGroups/stationGroupsActions'
import { saveStations } from '../../screens/admin/stationInfo/stationInfoActions'
import { toggleAutoRefresh } from '../../screens/home/homeActions'
import { getAdminEnabled } from '../../helpers/configHelper'
import { removeCookie, setCookie, AUTO_REFRESH_COOKIE_NAME } from '../../helpers/storageHelpers'
import { bannedSaveButtonPages } from '../../constants'
import './header.scss'

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalProps: {},
    }
    this.hideModal = this.hideModal.bind(this)
    this.onClickAutoRefresh = this.onClickAutoRefresh.bind(this)
    this.showAdminExitModal = this.showAdminExitModal.bind(this)
    this.showAdminSaveModal = this.showAdminSaveModal.bind(this)
    this.showIgnoreModal = this.showIgnoreModal.bind(this)
  }

  onClickAutoRefresh() {
    const { autoRefreshEnabled, cookies, toggleAutoRefresh } = this.props
    if (autoRefreshEnabled) {
      removeCookie({ cookies, name: AUTO_REFRESH_COOKIE_NAME })
    } else {
      setCookie({ cookies, name: AUTO_REFRESH_COOKIE_NAME, value: true })
    }
    toggleAutoRefresh()
  }

  getUnsavedAllowedCharacters() {
    const { allowedCharacters, editedCharacters } = this.props
    return allowedCharacters && editedCharacters && allowedCharacters !== editedCharacters
  }

  getUnsavedAdminChanges() {
    const { watchedGroups, watchedBlocks, watchedRulesets, watchedStations } = this.props

    return (
      this.getUnsavedAllowedCharacters() ||
      !_.isEmpty(watchedRulesets) ||
      !_.isEmpty(watchedGroups) ||
      !_.isEmpty(watchedBlocks) ||
      !_.isEmpty(watchedStations)
    )
  }

  hideModal() {
    const modalProps = { shouldRenderModal: false }
    this.setState({ modalProps })
  }

  showIgnoreModal() {
    const { selectedListings, showArchive, ignoreSelectedErrors } = this.props
    const selectedListingCount = selectedListings.length
    const selectedListingsDisplay = `${selectedListingCount} listing${
      selectedListingCount > 1 && 's'
    }`
    const ignoreState = showArchive ? 'UN-IGNORE' : 'IGNORE'
    const title = `Are you sure you want to ${ignoreState} ${selectedListingsDisplay}?`
    const description = 'Make sure any notes have already been entered.'
    const primaryButtonText = ignoreState
    const onPrimaryClick = () => {
      ignoreSelectedErrors()
      this.hideModal()
    }
    const modalProps = {
      description,
      onPrimaryClick,
      primaryButtonText,
      shouldRenderModal: true,
      title,
    }
    this.setState({ modalProps })
  }

  showAdminExitModal(opts = {}) {
    const { nextLocation } = opts
    const onPrimaryClick = () => {
      nextLocation ? (window.location = nextLocation) : window.close()
    }
    if (!this.getUnsavedAdminChanges()) return onPrimaryClick()

    const title = 'You have unsaved changes!'
    const description = 'Are you sure you want to leave without saving? All progress will be lost.'
    const primaryButtonText = 'Leave without saving'
    const modalProps = {
      description,
      onPrimaryClick,
      primaryButtonText,
      shouldRenderModal: true,
      title,
    }
    this.setState({ modalProps })
  }

  showAdminSaveModal() {
    const title = 'ADMIN SETTINGS'
    const description = 'Are you sure you want to save these settings?'
    const primaryButtonText = 'Save'
    const onPrimaryClick = () => {
      const {
        accessToken,
        errorHandler,
        watchedGroups,
        watchedRulesets,
        watchedStations,
      } = this.props
      if (this.getUnsavedAllowedCharacters())
        this.props.saveAllowedCharacters(accessToken, errorHandler)
      if (!_.isEmpty(watchedRulesets)) this.props.saveRulesets(accessToken, errorHandler)
      if (!_.isEmpty(watchedGroups)) this.props.saveGroups(accessToken, errorHandler)
      if (!_.isEmpty(watchedStations)) this.props.saveStations(accessToken, errorHandler)
      this.hideModal()
    }
    const modalProps = {
      description,
      onPrimaryClick,
      primaryButtonText,
      shouldRenderModal: true,
      title,
    }
    this.setState({ modalProps })
  }

  renderModal() {
    const { modalProps } = this.state
    const confirmModalProps = {
      ...modalProps,
      hideModal: this.hideModal,
    }
    return <ConfirmModal {...confirmModalProps} />
  }

  renderEpgContent() {
    return (
      <div className="nav-right">
        <Link
          className="btn btn-prim active close-epg"
          onClick={() => {
            window.close()
          }}
          to=""
        >
          Close Window
        </Link>
      </div>
    )
  }

  renderDashboardContent(showArchive) {
    const {
      account,
      isAdmin,
      autoRefreshEnabled,
      handleLogout,
      selectedListings,
      snapshotMax,
    } = this.props
    const datetime = snapshotMax ? moment(snapshotMax).format('M/D/YYYY h:mm:ss A') : null
    const showIgnoreBtn = selectedListings && selectedListings.length > 0

    return (
      <div className="nav-right">
        <ul>
          <li>FOX Listings Alert Generator</li>
          <li className="divider">|</li>
          <li>Refreshed at {datetime}</li>
          <li className="divider">|</li>
          <li>
            <label className="clickable" htmlFor="autoRefresh">
              Auto-refresh:&nbsp;
              <input
                checked={autoRefreshEnabled}
                id="autoRefresh"
                onChange={this.onClickAutoRefresh}
                type="checkbox"
              />
            </label>
          </li>
          {/* {account && <li className="divider">|</li>} */}
          {/* {account && (
            <li>
              <button className="logoutButton" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )} */}
        </ul>
        {isAdmin && (
          <Link className="btn btn-prim no-print" to="/admin">
            Admin
          </Link>
        )}
        <Link
          className="btn btn-prim no-print"
          onClick={() => {
            window.print()
          }}
          to=""
        >
          Report
        </Link>
        <Link className="btn btn-prim no-print" to={showArchive ? '/' : '/archive'}>
          {showArchive ? 'View Live Listings' : 'View Archived'}
        </Link>
        {/* <Link className='btn btn-prim no-print' target="_blank" to="/epg">View EPG</Link> */}
        {/* <Link className='btn btn-prim no-print' target="_blank" to="/list">All Listings</Link> */}
        {showIgnoreBtn && (
          <button className="btn btn-prim no-print" onClick={this.showIgnoreModal}>
            Ignore Selected
          </button>
        )}
      </div>
    )
  }

  renderAdminLoader() {
    const {
      loadingCharacterConfig,
      loadingErrorType,
      loadingStationGroups,
      loadingPreemptions,
    } = this.props
    const loading =
      loadingCharacterConfig || loadingErrorType || loadingStationGroups || loadingPreemptions
    if (!loading) return null
    return (
      <div className="admin loader">
        <img alt="loading spinner" className="admin loading-spinner" src="/loader.png" />
      </div>
    )
  }

  renderAdminContent() {
    const { account, handleLogout } = this.props
    const isNonSaveButtonPage = bannedSaveButtonPages.includes(this.props.location.pathname)
    const saveClasses = ['btn', 'btn-prim']
    const hasUnsavedChanges = this.getUnsavedAdminChanges()
    if (hasUnsavedChanges) saveClasses.push('active')
    return (
      <div className="admin">
        {/* {account && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )} */}
        <div className="nav-left">Admin Settings</div>
        <div className="nav-right">
          {this.renderAdminLoader()}
          {!isNonSaveButtonPage && (
            <button
              className={classNames(saveClasses)}
              onClick={this.showAdminSaveModal}
              to=""
              disabled={!this.getUnsavedAdminChanges()}
            >
              Save
            </button>
          )}
        </div>
      </div>
    )
  }

  renderContent() {
    const {
      appInitialized,
      location: { pathname },
    } = this.props
    if (!appInitialized) return null

    const isDashboard = pathname === '/'
    const isArchive = _.includes(pathname, 'archive')
    const isAdmin = _.includes(pathname, 'admin')

    console.log('isAdmin - isArchive', { isAdmin, isArchive, c: getAdminEnabled() })

    if (isDashboard || isArchive) {
      return this.renderDashboardContent(isArchive)
    } else if (isAdmin && getAdminEnabled()) {
      return this.renderAdminContent()
    } else {
      return null
    }
  }

  renderSecondaryContent() {
    const {
      appInitialized,
      location: { pathname },
    } = this.props
    const isAdmin = _.includes(pathname, 'admin')
    if (!isAdmin || !getAdminEnabled() || !appInitialized) return null

    const tabs = [
      'error-type',
      'network-blocks',
      'station-groups',
      'station-info',
      'character-config',
      'preemptions',
      'msdi',
    ]

    return (
      <div className="admin secondary-nav container">
        {_.map(tabs, (tab, idx) => {
          const isFirst = idx === 0 && pathname === '/admin'
          const isActive = isFirst || _.includes(pathname, tab)
          const activeClass = isActive ? 'active' : ''
          const classes = `nav-item no-style ${activeClass}`
          const url = `/admin/${tab}`
          const onClick = () => {
            this.showAdminExitModal({ nextLocation: url })
          }
          const label = _.replace(tab, '-', ' ')
          const isUnsavedChanges = this.getUnsavedAdminChanges()
          return isUnsavedChanges ? (
            <button className={classes} key={tab} onClick={onClick} to="">
              {label}
            </button>
          ) : (
            <Link className={classes} to={url}>
              {label}
            </Link>
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div>
        <div className="header container">
          <Link to="/">
            <img alt="FLAG Logo" className="logo" src="/flag_logo.png" />
          </Link>
          {this.renderContent()}
        </div>
        {this.renderSecondaryContent()}
        {this.renderModal()}
      </div>
    )
  }
}

function mapStateToProps({
  auth,
  home,
  guide,
  adminCharacterConfig,
  adminErrorType,
  adminStationGroups,
  adminStationInfo,
  adminNetworkBlocks,
  adminPreemptions,
}) {
  return {
    account: auth.account,
    isAdmin: auth.isAdmin,
    allowedCharacters: adminCharacterConfig.allowedCharacters,
    preemptions: adminPreemptions.preemptions,
    autoRefreshEnabled: home.autoRefreshEnabled,
    editedCharacters: adminCharacterConfig.editedCharacters,
    loadingErrorType: adminErrorType.loading,
    loadingStationGroups: adminStationGroups.loading,
    snapshotMax: guide.snapshotMax,
    watchedGroups: adminStationGroups.watchedGroups,
    watchedRulesets: adminErrorType.watchedRulesets,
    watchedStations: adminStationInfo.watchedStations,
    watchedBlocks: adminNetworkBlocks.watchedBlocks,
  }
}

const HeaderWithCookies = withCookies(Header)

export default connect(mapStateToProps, {
  saveAllowedCharacters,
  // savePreemptions,
  saveGroups,
  saveRulesets,
  saveStations,
  toggleAutoRefresh,
})(HeaderWithCookies)

Header.propTypes = {
  accessToken: PropTypes.string,
  account: PropTypes.shape({}),
  allowedCharacters: PropTypes.string,
  appInitialized: PropTypes.bool,
  autoRefreshEnabled: PropTypes.bool,
  cookies: instanceOf(Cookies).isRequired,
  editedCharacters: PropTypes.string,
  errorHandler: PropTypes.func.isRequired,
  handleLogout: PropTypes.func,
  ignoreSelectedErrors: PropTypes.func,
  loadingCharacterConfig: PropTypes.bool,
  loadingPreemptions: PropTypes.bool,
  loadingErrorType: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  loadingStationGroups: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  location: PropTypes.shape({}).isRequired,
  saveAllowedCharacters: PropTypes.func.isRequired,
  saveGroups: PropTypes.func.isRequired,
  saveRulesets: PropTypes.func.isRequired,
  saveStations: PropTypes.func.isRequired,
  selectedListings: PropTypes.arrayOf(PropTypes.string),
  showArchive: PropTypes.bool,
  snapshotMax: PropTypes.string,
  toggleAutoRefresh: PropTypes.func.isRequired,
  watchedGroups: PropTypes.shape({}),
  watchedRulesets: PropTypes.shape({}),
  watchedStations: PropTypes.shape({}),
}

Header.defaultProps = {
  accessToken: null,
  account: null,
  allowedCharacters: null,
  preemptions: null,
  appInitialized: false,
  autoRefreshEnabled: false,
  editedCharacters: null,
  handleLogout: () => {},
  ignoreSelectedErrors: () => {},
  loadingCharacterConfig: false,
  loadingPreemptions: false,
  loadingErrorType: false,
  loadingStationGroups: false,
  selectedListings: [],
  showArchive: null,
  snapshotMax: null,
  watchedGroups: {},
  watchedRulesets: {},
  watchedStations: {},
}
