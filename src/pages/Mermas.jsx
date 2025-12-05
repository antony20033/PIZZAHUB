import React, { useState } from 'react'
import { CRow, CCol, CFormInput, CInputGroup, CInputGroupText, CWidgetStatsF } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

const Mermas = () => {
  const [busqueda, setBusqueda] = useState('')

  // Datos de ejemplo (puedes cambiarlos luego)
  const mermas = [
    { id: 1, nombre: 'Harina vencida', cantidad: '3 kg', color: 'danger', icono: '🥣' },
    { id: 2, nombre: 'Huevos rotos', cantidad: '12 unidades', color: 'warning', icono: '🥚' },
    { id: 3, nombre: 'Leche derramada', cantidad: '5 litros', color: 'info', icono: '🥛' },
  ]

  const mermasFiltradas = mermas.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page-container" style={{ background: '#F3F4F6', minHeight: '100vh', width: '100%', maxWidth: '100%', margin: 0 }}>
      <div className="fade-in" style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderBottom: '4px solid #FF6600' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#1A1C20' }}>📉 Registro de Mermas</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>Control de pérdidas e insumos dañados</p>
      </div>
      
      {/* Barra de búsqueda */}
      <CRow className="mb-4">
        <CCol xs={12} md={6} lg={4}>
          <CInputGroup style={{ border: '2px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
            <CInputGroupText style={{ background: '#FF6600', color: 'white', border: 'none' }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              type="text"
              placeholder="Buscar merma..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ border: 'none', padding: '12px' }}
            />
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Lista de mermas */}
      <CRow>
        {mermasFiltradas.map((merma) => (
          <CCol xs={12} sm={6} md={4} lg={3} key={merma.id}>
            <CWidgetStatsF
              className="mb-3"
              color={merma.color}
              title={
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  {merma.nombre}
                </span>
              }
              value={
                <span style={{ fontSize: '1rem', fontWeight: '500' }}>
                  {merma.cantidad}
                </span>
              }
              icon={<span style={{ fontSize: '24px' }}>{merma.icono}</span>}
              padding={false}
            />
          </CCol>
        ))}
      </CRow>

      {/* Si no hay resultados */}
      {mermasFiltradas.length === 0 && (
        <CRow>
          <CCol xs={12} className="text-center py-5">
            <div style={{ background: 'white', padding: '60px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ color: '#666', fontWeight: '600', margin: 0 }}>
                No se encontraron mermas que coincidan con "{busqueda}"
              </h3>
            </div>
          </CCol>
        </CRow>
      )}
    </div>
  )
}

export default Mermas
