import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilChartLine,
  cilCart,
  cilClock,
  cilLibrary,
  cilBasket,
  cilPlus,
  cilTruck,
  cilBell,
  cilPeople,
  cilUserPlus,
  cilMobile,
  cilBook,
  cilMoney,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'Repartidor',
    roles: ['Repartidor'] // Solo para repartidores
  },
  {
    component: CNavItem,
    name: 'Pedidos',
    to: '/pages/VistaRepartidores',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
    roles: ['Repartidor'] // Solo para repartidores
  },
  {
    component: CNavTitle,
    name: 'Analíticas',
    roles: ['Administrador', 'Empleado'] // No para repartidores
  },
  {
    component: CNavItem,
    name: 'Movimientos',
    to: '/pages/Movimientos',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavTitle,
    name: 'Pedidos',
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavItem,
    name: 'Entrada Pedidos',
    to: '/pages/EntradaPedidos',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavItem,
    name: 'En proceso',
    to: '/pages/Enproceso',
    icon: <CIcon icon={cilClock} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavItem,
    name: 'Venta',
    to: '/pages/Ventas',
    icon: <CIcon icon={cilClock} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavTitle,
    name: 'Inventario',
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavGroup,
    name: 'Inventario',
    to: '/pages',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado'],
    items: [
      {
        component: CNavItem,
        name: 'Insumos',
        to: '/pages/Insumos',
        icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Compra Insumos',
        to: '/pages/CompraInsumos',
        icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Agregar Insumos',
        to: '/pages/AgregarInsumos',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Repartidores',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado'],
    items: [
      {
        component: CNavItem,
        name: 'Repartidores',
        to: '/pages/Repartidores',
        icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Notificaciones',
    to: 'pages/notificaciones',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavTitle,
    name: 'Usuarios',
    roles: ['Administrador'] // SOLO ADMINISTRADOR
  },
  {
    component: CNavGroup,
    name: 'Usuarios',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    roles: ['Administrador'], // SOLO ADMINISTRADOR
    items: [
      {
        component: CNavItem,
        name: 'Gestión Usuarios',
        to: '/pages/Usuarios',
        icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Registro de empleados',
        to: '/pages/RegistroEmpleados',
        icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Clientes',
        to: '/pages/UsuariosMovil',
        icon: <CIcon icon={cilMobile} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Documentación',
    href: 'https://coreui.io/react/docs/templates/installation/',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavTitle,
    name: 'Caja',
    roles: ['Administrador', 'Empleado']
  },
  {
    component: CNavItem,
    name: 'Abrir/Cerrar Caja',
    to: '/pages/Caja',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    roles: ['Administrador', 'Empleado']
  },
]

// Función para filtrar navegación según rol
export const getFilteredNav = (userRoles) => {
  if (!userRoles || userRoles.length === 0) return _nav;
  
  return _nav.filter(item => {
    if (!item.roles) return true; // Si no tiene roles definidos, mostrar
    
    // Verificar si alguno de los roles del usuario coincide con los roles del item
    return item.roles.some(role => userRoles.includes(role));
  });
}

export default _nav;