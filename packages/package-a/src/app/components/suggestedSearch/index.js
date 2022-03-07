import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import classNames from 'classnames'

import { groupListContainsName } from './suggestedSearchHelpers'

class SuggestedSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      foundText: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
    this.onInputKeyUp = this.onInputKeyUp.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const { onSubmitProps } = this.props
    const { onSubmitProps: nextOnSubmitProps } = nextProps
    if (onSubmitProps !== nextOnSubmitProps) this.clearSearch()
  }
  
  onSubmit() {
    const { clearSearchOnSubmit, onSubmit, onSubmitProps } = this.props
    const { foundText } = this.state
    if (clearSearchOnSubmit) {
      this.clearSearch()
      if (foundText) onSubmit(foundText, onSubmitProps)
    } else {
      this.suggestedSearch.value = foundText
      onSubmit(foundText, onSubmitProps)
    }
  }
  
  onInputKeyUp(e) {
    if (e.keyCode === 13) this.onSubmit()
  }
  
  onInputChange(e) {
    const { minSearchLength } = this.props
    var searchValue = e.target.value
    const searchValueLength = searchValue.length
    if (searchValueLength >= minSearchLength) {
      const { searchableItems } = this.props

      const exactMatch = groupListContainsName(searchableItems, searchValue)
      if (exactMatch) return this.setState({ foundText: exactMatch.name })

      const matchedGroup = _.find(searchableItems, (group) => {
        const name = _.get(group, 'name')
        const nameMatches = name && _.startsWith(_.toUpper(name), _.toUpper(searchValue))
        return nameMatches
      })
      const matchedName = _.get(matchedGroup, 'name')
      if (matchedName) return this.setState({ foundText: matchedName })
    }
    this.setState({ foundText: '' })
  }

  clearSearch() {
    this.setState({ foundText: '' }, () => {
      this.suggestedSearch.value = ''
    })
  }
  
  render() {
    const {
      autoCompleteDisplayLimit,
      buttonText,
      containerClass,
      labelText,
      placeholderText
    } = this.props
    const { foundText } = this.state
    const containerClasses = ["stationSearchContainer"]
    if (containerClass) containerClasses.push(containerClass)
    let autoCompleteDisplay = foundText
    if (autoCompleteDisplayLimit && this.suggestedSearch) {
      const searchLength = this.suggestedSearch.value.length
      if (searchLength >= autoCompleteDisplayLimit) autoCompleteDisplay = ''
    }

    return (
      <div className={classNames(containerClasses)}>
        {labelText &&
          <div className="subtitle">{labelText}</div>
        }
        <input
          className="form-control stationSearchInput"
          onChange={this.onInputChange}
          onKeyUp={this.onInputKeyUp}
          placeholder={placeholderText}
          ref={(input) => { this.suggestedSearch = input }}
          type="text"
        />
        <input
          className="form-control stationSearchInputSuggestion"
          onClick={() => { this.suggestedSearch.focus() }}
          readOnly
          type="text"
          value={autoCompleteDisplay}
        />
        {buttonText &&
          <button className="btn btn-sec addStationButton" onClick={this.onSubmit}>
            {buttonText}
          </button>
        }
      </div>
    )
  }
}

export default SuggestedSearch

SuggestedSearch.defaultProps = {
  autoCompleteDisplayLimit: null,
  buttonText: null,
  clearSearchOnSubmit: true,
  containerClass: null,
  labelText: null,
  minSearchLength: 2,
  onSubmitProps: {},
  placeholderText: null,
  searchableItems: null
}

SuggestedSearch.propTypes = {
  autoCompleteDisplayLimit: PropTypes.number,
  buttonText: PropTypes.string,
  clearSearchOnSubmit: PropTypes.bool,
  containerClass: PropTypes.string,
  labelText: PropTypes.string,
  minSearchLength: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onSubmitProps: PropTypes.shape({}),
  placeholderText: PropTypes.string,
  searchableItems: PropTypes.arrayOf(PropTypes.shape({}))
}
