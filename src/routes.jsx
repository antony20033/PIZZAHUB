import React from "react";

const Insumos = React.lazy(() => import('./pages/Insumos'))
const AgregarInsumos = React.lazy(() => import('./pages/AgregarInsumos'))
const Provedores = React.lazy(() => import('./pages/Provedores'))
const Usuarios = React.lazy(() => import('./pages/Usuarios'))
const UsuariosMovil = React.lazy(() => import('./pages/UsuariosMovil'))
const Movimientos = React.lazy(() => import('./pages/Movimientos'))
const EntradaPedidos = React.lazy(() => import('./pages/EntradaPedidos'))
const Enproceso = React.lazy(() => import('./pages/Enproceso'))
const Mermas = React.lazy(() => import('./pages/Mermas'))
const AgregarMermas = React.lazy(() => import('./pages/agregarMermas'))
const Repartidores = React.lazy(() => import('./pages/Repartidores'))
const CompraInsumos = React.lazy(() => import('./pages/CompraInsumos'))
const RegistroEmpleados = React.lazy(() => import('./pages/RegistroEmpleados'))
const Caja = React.lazy(() => import('./pages/Caja'))
const Ventas = React.lazy(() => import('./pages/Ventas'))
const VistaRepartidores = React.lazy(() => import('./pages/VistaRepartidores')) 

const routes = [
    { path: '/', exact: true, name: 'home' },
    { path: '/pages/Insumos', name: 'Insumos', element: Insumos },
    { path: '/pages/CompraInsumos', name: 'CompraInsumos', element: CompraInsumos },
    { path: '/pages/AgregarInsumos', name: 'AgregarInsumos', element: AgregarInsumos },
    { path: '/pages/Provedores', name: 'Provedores', element: Provedores },
    { path: '/pages/Usuarios', name: 'Usuarios', element: Usuarios, adminOnly: true },
    { path: '/pages/UsuariosMovil', name: 'UsuariosMovil', element: UsuariosMovil, adminOnly: true },
    { path: '/pages/RegistroEmpleados', name: 'RegistroEmpleados', element: RegistroEmpleados, adminOnly: true },
    { path: '/pages/Movimientos', name: 'Movimientos', element: Movimientos },
    { path: '/pages/EntradaPedidos', name: 'Entrada Pedidos', element: EntradaPedidos },
    { path: '/pages/Enproceso', name: 'En proceso', element: Enproceso },
    { path: '/pages/Mermas', name: 'Mermas', element: Mermas },
    { path: '/pages/AgregarMermas', name: 'Agregar mermas', element: AgregarMermas },
    { path: '/pages/Repartidores', name: 'Repartidores', element: Repartidores },
    { path: '/pages/Caja', name: 'Caja', element: Caja },
    { path: '/pages/VistaRepartidores', name: 'VistaRepartidores', element: VistaRepartidores, repartidorOnly: true },
    { path: '/pages/Ventas', name: 'Ventas', element: Ventas },
]

// Función para filtrar rutas según el rol
export const getFilteredRoutes = (roles) => {
    if (!roles || roles.length === 0) return routes;
    
    const isRepartidor = roles.includes("Repartidor");
    const isEmpleado = roles.includes("Empleado");
    const isAdministrador = roles.includes("Administrador");
    
    if (isRepartidor) {
        // Solo VistaRepartidores para repartidores
        return routes.filter(route => 
            route.path === '/' || route.path === '/pages/VistaRepartidores'
        );
    }
    
    if (isEmpleado) {
        // Empleado: Todo EXCEPTO gestión de usuarios y VistaRepartidores
        return routes.filter(route => 
            !route.adminOnly && !route.repartidorOnly
        );
    }
    
    if (isAdministrador) {
        // Administrador: Todo EXCEPTO VistaRepartidores
        return routes.filter(route => !route.repartidorOnly);
    }
    
    // Por defecto: todas las rutas excepto VistaRepartidores
    return routes.filter(route => !route.repartidorOnly);
}

export default routes;