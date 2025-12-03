import React, { useContext, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CButton,
  CFormSwitch
} from '@coreui/react'

import { AppSidebarNav } from './SidebarNav'
import { getFilteredNav } from '../navegacion/_nav'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import logo from '../media/img/logo.jpg'
import useNewPedidos from '../hooks/useNewPedidos'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const { logout, roles } = useContext(AuthContext)
  const navigate = useNavigate()

  // Estado para controlar si las notificaciones están activas
  const [notificacionesActivas, setNotificacionesActivas] = useState(() => {
    // Leer del localStorage al iniciar
    const saved = localStorage.getItem('notificacionesActivas')
    return saved !== null ? JSON.parse(saved) : true // true por defecto
  })

  // Hook de pedidos - solo se ejecuta si notificacionesActivas es true
  const { pedidosPendientes, hayNuevos } = useNewPedidos(notificacionesActivas, 30000)

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem('notificacionesActivas', JSON.stringify(notificacionesActivas))
  }, [notificacionesActivas])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleToggleNotificaciones = () => {
    setNotificacionesActivas(prev => !prev)
  }

  // Filtrar navegación y agregar badges dinámicos
  const navigationItems = getFilteredNav(roles).map(item => {
    // Si el item tiene badge y apunta a "En proceso"
    if (item.badge && item.to === '/pages/Enproceso') {
      return {
        ...item,
        badge: notificacionesActivas && pedidosPendientes > 0 ? {
          color: hayNuevos ? 'danger' : 'warning',
          text: pedidosPendientes.toString(),
        } : undefined
      }
    }
    return item
  })

  return (
    <CSidebar
      className="border-end sidebar-dark-theme"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
      style={{
        background: 'linear-gradient(180deg, #1A1C20 0%, #2D3748 100%)',
        opacity: 1,
        padding: '0',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <CSidebarHeader
        className="border-bottom"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        <CCloseButton
          className="d-lg-none"
          style={{ 
            color: '#fff',
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10
          }}
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
        
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 12px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(255, 102, 0, 0.3)',
            border: '3px solid rgba(255, 102, 0, 0.3)',
          }}>
            <img 
              src={logo} 
              alt="PizzaHub Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <h2
            style={{
              color: '#ffffff',
              fontWeight: '800',
              letterSpacing: '2px',
              fontSize: '1.5rem',
              fontFamily: "'Inter', sans-serif",
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            PizzaHub
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            margin: '4px 0 0 0',
            fontWeight: '500',
            letterSpacing: '1px',
          }}>
            {roles && roles.includes("Repartidor") ? "REPARTIDOR" : "ADMIN PANEL"}
          </p>
        </div>
      </CSidebarHeader>

      {/* Navegación dinámica con badges */}
      <AppSidebarNav items={navigationItems} />

      {/* Footer con controles */}
      <CSidebarFooter
        className="border-top d-flex flex-column align-items-center justify-content-center p-3"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: '20px',
        }}
      >
        {/* Toggle de Notificaciones */}
        {(roles && (roles.includes("Administrador") || roles.includes("Empleado"))) && (
          <div
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Alertas
              </span>
            </div>
            <CFormSwitch
              id="notificacionesSwitch"
              checked={notificacionesActivas}
              onChange={handleToggleNotificaciones}
              style={{
                cursor: 'pointer',
              }}
            />
          </div>
        )}

        {/* Botón de Logout */}
        <CButton
          color="danger"
          style={{
            width: '100%',
            fontWeight: '600',
            backgroundColor: 'transparent',
            borderColor: 'rgba(220, 53, 69, 0.5)',
            border: '2px solid rgba(220, 53, 69, 0.5)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '14px',
            color: '#ff6b6b',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dc3545'
            e.target.style.borderColor = '#dc3545'
            e.target.style.color = '#ffffff'
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.borderColor = 'rgba(220, 53, 69, 0.5)'
            e.target.style.color = '#ff6b6b'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          }}
          onClick={handleLogout}
        >
           Cerrar sesión
        </CButton>

        {/* Sidebar Toggler */}
        <CSidebarToggler
          className="mt-3"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
          }}
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)