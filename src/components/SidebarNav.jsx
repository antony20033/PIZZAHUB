
// ========== SidebarNav.jsx ==========
import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {

  const activeStyles = `
    .sidebar-dark-theme .nav-link {
      color: rgba(255, 255, 255, 0.7) !important;
      font-weight: 500 !important;
      padding: 12px 16px !important;
      margin: 4px 12px !important;
      border-radius: 10px !important;
      transition: all 0.2s ease !important;
      position: relative;
    }
    
    .sidebar-dark-theme .nav-link.active {
      color: #ffffff !important;
      font-weight: 600 !important;
      background: linear-gradient(135deg, rgba(255, 102, 0, 0.15) 0%, rgba(255, 133, 51, 0.1) 100%) !important;
      border-left: 3px solid #FF6600 !important;
      padding-left: 13px !important;
      box-shadow: 0 2px 8px rgba(255, 102, 0, 0.2);
    }
    
    .sidebar-dark-theme .nav-link.active .nav-icon {
      color: #FF6600 !important;
    }
    
    .sidebar-dark-theme .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: #ffffff !important;
      transform: translateX(4px);
    }
    
    .sidebar-dark-theme .nav-icon {
      color: rgba(255, 255, 255, 0.6) !important;
      transition: color 0.2s ease;
      margin-right: 8px !important;
    }
    
    .sidebar-dark-theme .nav-link:hover .nav-icon {
      color: #FF8533 !important;
    }

    /* Estilos para grupos desplegables */
    .sidebar-dark-theme .nav-group-toggle {
      color: rgba(255, 255, 255, 0.7) !important;
      font-weight: 500 !important;
      padding: 12px 16px !important;
      margin: 4px 12px !important;
      border-radius: 10px !important;
      transition: all 0.2s ease !important;
      cursor: pointer;
    }

    .sidebar-dark-theme .nav-group-toggle:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: #ffffff !important;
    }

    .sidebar-dark-theme .nav-group-toggle .nav-icon {
      color: rgba(255, 255, 255, 0.6) !important;
    }

    .sidebar-dark-theme .nav-group-toggle:hover .nav-icon {
      color: #FF8533 !important;
    }

    /* Subitems dentro de grupos */
    .sidebar-dark-theme .nav-group-items {
      background-color: rgba(0, 0, 0, 0.15);
      margin: 4px 12px 8px 12px;
      border-radius: 10px;
      padding: 4px 0;
    }

    .sidebar-dark-theme .nav-group-items .nav-link {
      padding: 10px 16px 10px 40px !important;
      margin: 2px 8px !important;
      font-size: 13px !important;
    }

    .sidebar-dark-theme .nav-group-items .nav-icon {
      font-size: 12px !important;
      opacity: 0.8;
    }
  `

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}

        {name && (
          <span style={{ 
            color: '#ffffff', 
            fontWeight: '500',
            fontSize: '14px',
          }}>
            {name}
          </span>
        )}

        {badge && (
          <CBadge color={badge.color} className="ms-auto" size="sm">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component

    // TITULOS
    if (Component.displayName === 'CNavTitle' || Component.name === 'CNavTitle') {
      return (
        <Component
          key={index}
          {...rest}
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: '700',
            fontSize: '11px',
            letterSpacing: '2px',
            padding: '20px 28px 8px 28px',
            marginBottom: '4px',
            marginTop: '8px',
            textTransform: 'uppercase',
          }}
        >
          {name}
        </Component>
      )
    }

    // ITEMS NORMALES
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...(rest.href && { target: '_blank', rel: 'noopener noreferrer' })}
            {...rest}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item
    const Component = component
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  }

  return (
    <>
      <style>{activeStyles}</style>

      <CSidebarNav as={SimpleBar}>
        {items &&
          items.map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index),
          )}
      </CSidebarNav>
    </>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}