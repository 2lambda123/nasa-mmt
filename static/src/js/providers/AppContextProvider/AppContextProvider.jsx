import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import useKeywords from '../../hooks/useKeywords'
import AppContext from '../../context/AppContext'
import useAuthContext from '../../hooks/useAuthContext'

/**
 * @typedef {Object} AppContextProviderProps
 * @property {ReactNode} children The children to be rendered.

/**
 * Renders any children wrapped with access to AppContext.
 * @param {AppContextProviderProps} props
 *
 * @example <caption>Renders children wrapped with access to AppContext.</caption>
 *
 * return (
 *   <AppContextProvider>
 *     {children}
 *   </AppContextProvider>
 * )
 */
const AppContextProvider = ({ children }) => {
  const {
    login, logout, user, updateLoginInfo
  } = useAuthContext()
  const { addKeywordsData, keywords } = useKeywords()
  const [originalDraft, setOriginalDraft] = useState()
  const [draft, setDraft] = useState()
  const [savedDraft, setSavedDraft] = useState()

  const providerValue = useMemo(() => ({
    user,
    login,
    logout,
    addKeywordsData,
    keywords,
    draft,
    originalDraft,
    savedDraft,
    setDraft,
    setOriginalDraft,
    setSavedDraft,
    updateLoginInfo
  }), [
    user,
    draft,
    originalDraft,
    keywords,
    savedDraft
  ])

  return (
    <AppContext.Provider value={providerValue}>
      {children}
    </AppContext.Provider>
  )
}

AppContextProvider.defaultProps = {
  children: null
}

AppContextProvider.propTypes = {
  children: PropTypes.node
}

export default AppContextProvider
