import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { Outlet } from 'react-router-dom'

import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import PrimaryNavigation from '../PrimaryNavigation/PrimaryNavigation'

import { getUmmVersionsConfig } from '../../../../../sharedUtils/getConfig'

/*
 * Renders a `Layout` component.
 *
 * The component is used to render the Layout for React Router
 *
 * @component
 * @example <caption>Render Layout component</caption>
 * return (
 *   <Layout />
 * )
 */
const Layout = ({ className, displayNav }) => {
  const {
    ummC,
    ummS,
    ummT,
    ummV
  } = getUmmVersionsConfig()

  return (
    <div className="d-flex flex-column w-100">
      <ErrorBoundary>
        <>
          <Header />
          <main
            className={
              classNames([
                'flex-grow-1 d-flex flex-row',
                {
                  [className]: className
                }
              ])
            }
          >

            {
              displayNav && (
                <header className="page__header d-flex grow-0 flex-shrink-0">
                  <PrimaryNavigation
                    items={
                      [
                        {
                          to: '/collections',
                          title: 'Collections',
                          version: `v${ummC}`,
                          children: [
                            {
                              to: '/drafts/collections',
                              title: 'Drafts'
                            },
                            {
                              to: '/templates/collections',
                              title: 'Templates'
                            }
                          ]
                        },
                        {
                          to: '/variables',
                          title: 'Variables',
                          version: `v${ummV}`,
                          children: [
                            {
                              to: '/drafts/variables',
                              title: 'Drafts'
                            }
                          ]
                        },
                        {
                          to: '/services',
                          title: 'Services',
                          version: `v${ummS}`,
                          children: [
                            {
                              to: '/drafts/services',
                              title: 'Drafts'
                            }
                          ]
                        },
                        {
                          to: '/tools',
                          title: 'Tools',
                          version: `v${ummT}`,
                          children: [
                            {
                              to: '/drafts/tools',
                              title: 'Drafts'
                            }
                          ]
                        },
                        {
                          to: '/order-options',
                          title: 'Order Options'
                        }
                      ]
                    }
                  />
                </header>
              )
            }

            <Outlet />
          </main>
          <Footer />
        </>
      </ErrorBoundary>
    </div>
  )
}

Layout.defaultProps = {
  className: '',
  displayNav: true
}

Layout.propTypes = {
  className: PropTypes.string,
  displayNav: PropTypes.bool
}

export default Layout
