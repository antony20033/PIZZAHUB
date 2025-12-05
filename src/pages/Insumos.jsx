import React, { useState, useEffect } from "react"
import callApi from "../utils/apiProxy"
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import {
  CCol,
  CRow,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormSelect,
  CFormInput,
  CFormLabel,
} from '@coreui/react'

const Insumos = () => {
  const [busqueda, setBusqueda] = useState('')
  const [insumosAPI, setInsumosAPI] = useState([])
  const [loading, setLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [insumoSeleccionado, setInsumoSeleccionado] = useState(null)
  const [movimientoData, setMovimientoData] = useState({
    cantidad: '',
    tipoMovimiento: 1, // 1 = entrada por defecto
    motivo: '',
  })

  // 🔧 URL base - usar configuración centralizada
  const API_URL = '';

  const fetchInsumos = async () => {
    setLoading(true)
    console.log('✅ 1. fetchInsumos INICIADO.')
    try {
      const token = localStorage.getItem('token')
      console.log('✅ 2. Token encontrado:', !!token)

      if (!token) {
        console.error('🔴 AUTH: No hay token en localStorage.')
        setInsumosAPI([])
        setLoading(false)
        return
      }

      const response = await callApi('/api/Insumos', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error(`🔴 3. ERROR en la API: Status ${response.status}`)
        const errorBody = await response.text().catch(() => 'No body')
        console.error('🔴 4. Error:', errorBody)
        setInsumosAPI([])
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('✅ 5. Datos recibidos:', data)

      // Mapear los datos del API a formato de UI
      const insumosConvertidos = data.map((i) => ({
        id: i.id,
        nombre: i.nombre ?? 'Sin nombre',
        unidadMedida: i.unidadMedida ?? 'Uds', // Mantener como texto
        stockActual: Number(i.stockActual ?? 0),
        stockMinimo: Number(i.stockMinimo ?? 0),
        imagen: '📦',
        tipoIcono: 'emoji',
      }))

      setInsumosAPI(insumosConvertidos)
      console.log(`✅ 6. Insumos cargados: ${insumosConvertidos.length}`)
    } catch (error) {
      console.error('🔴 CRITICAL: Error:', error)
      setInsumosAPI([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsumos()
  }, [])

  const handleInsumoClick = (insumo) => {
    console.log("✅ INSUMO CLICKEADO:", insumo)
    setInsumoSeleccionado(insumo)
    setMovimientoData({
      cantidad: '',
      tipoMovimiento: 1, // Entrada por defecto
      motivo: ''
    })
    setVisible(true)
    console.log("✅ Modal visible establecido a TRUE")
  }

  const actualizarStock = async () => {
    if (!insumoSeleccionado) {
      alert('⚠️ No hay insumo seleccionado')
      return
    }

    const cantidadNum = parseFloat(movimientoData.cantidad)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      alert('⚠️ Ingresa una cantidad válida mayor a 0')
      return
    }

    if (!movimientoData.motivo.trim()) {
      alert('⚠️ Por favor ingresa un motivo para el movimiento')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('🔐 No autorizado. Falta token.')
      return
    }

    // Body exactamente como tu API espera
    // Nota: el backend interpreta los tipos de movimiento de forma opuesta
    // a como se muestran en la UI en algunos despliegues. Para asegurarnos
    // de que la selección del usuario concuerde con la acción real, invertimos
    // el valor enviado aquí si es necesario.
    const enviadoTipoMovimiento = Number(movimientoData.tipoMovimiento) === 1 ? 0 : 1;

    const body = {
      insumoId: insumoSeleccionado.id,
      cantidad: cantidadNum,
      tipoMovimiento: enviadoTipoMovimiento, // enviamos el tipo invertido para mantener coherencia UX
      motivo: movimientoData.motivo.trim(),
    }

    console.log('📤 Enviando movimiento:', body)

    try {
      const response = await callApi('/api/InventarioLog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => null)
        console.error('❌ Error InventarioLog:', response.status, errorText)
        
        if (response.status === 403) {
          alert('🚫 Error 403: No tienes permisos para realizar esta acción.\n\nNecesitas rol "Administrador" o "Empleado".')
        } else if (response.status === 400) {
          alert(`❌ Error: ${errorText || 'Datos inválidos o stock insuficiente'}`)
        } else {
          alert(`❌ Error ${response.status}: No se pudo actualizar el stock`)
        }
        return
      }

      const resultado = await response.json()
      console.log('✅ Stock actualizado:', resultado)
      
      alert(`✅ Stock actualizado correctamente!\n\nInsumo: ${insumoSeleccionado.nombre}\nTipo: ${movimientoData.tipoMovimiento === 1 ? 'Entrada' : 'Salida'}\nCantidad: ${cantidadNum}`)
      
      setVisible(false)
      setInsumoSeleccionado(null)
      
      // Refrescar lista
      await fetchInsumos()
    } catch (error) {
      console.error('💥 Error en actualizarStock:', error)
      alert('❌ Error en la petición. Revisa la consola.')
    }
  }

  const insumosFiltrados = insumosAPI.filter((insumo) =>
    insumo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const renderIcono = (insumo) => {
    return <span style={{ fontSize: '32px' }}>{insumo.imagen}</span>
  }

  return (
    <div
      className="page-container"
      style={{
        minHeight: '100vh',
        background: '#F3F4F6',
        width: '100%',
        maxWidth: '100%',
        margin: 0
      }}
    >
      <div style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            borderBottom: '4px solid #FF6600',
          }}
        >
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '36px',
              fontWeight: '800',
              color: '#1A1C20',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            📦 Inventario de Insumos
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
            Gestiona y controla el stock de materias primas
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CRow>
            <CCol xs={12} md={6} lg={5}>
              <CInputGroup
                style={{
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <CInputGroupText
                  style={{
                    background: '#FF6600',
                    border: 'none',
                    color: 'white',
                  }}
                >
                  <CIcon icon={cilSearch} size="lg" />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Buscar insumo por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    border: 'none',
                    fontSize: '15px',
                    padding: '12px 16px',
                    fontWeight: '500',
                  }}
                />
              </CInputGroup>
            </CCol>
          </CRow>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '60px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Cargando insumos...
            </p>
          </div>
        )}

        {/* Grid de Insumos */}
        {!loading && (
          <CRow>
            {insumosFiltrados.length === 0 ? (
              <CCol xs={12}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '60px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                  <h3 style={{ color: '#666', fontWeight: '600', margin: 0 }}>
                    No se encontraron insumos
                  </h3>
                  <p style={{ color: '#999', marginTop: '10px' }}>
                    {busqueda ? 'Intenta con otro término de búsqueda' : 'Aún no hay insumos registrados'}
                  </p>
                </div>
              </CCol>
            ) : (
              insumosFiltrados.map((insumo) => (
                <CCol xs={12} sm={6} md={4} lg={3} key={insumo.id}>
                  <div
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '20px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      minHeight: '160px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    onClick={() => handleInsumoClick(insumo)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 102, 0, 0.25)'
                      e.currentTarget.style.borderColor = '#FF6600'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                      e.currentTarget.style.borderColor = 'transparent'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      {renderIcono(insumo)}
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: '0 0 12px 0',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#333',
                          textAlign: 'center',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {insumo.nombre}
                      </h4>
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                          borderRadius: '10px',
                          padding: '12px',
                          textAlign: 'center',
                        }}
                      >
                        <div
                          style={{
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            opacity: 0.9,
                            marginBottom: '4px',
                          }}
                        >
                          Stock Actual
                        </div>
                        <div
                          style={{
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: '800',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {insumo.stockActual} {insumo.unidadMedida}
                        </div>
                      </div>
                    </div>
                  </div>
                </CCol>
              ))
            )}
          </CRow>
        )}
      </div>

      {/* Modal */}
      <CModal
        visible={visible}
        onClose={() => {
          console.log("❌ Cerrando modal")
          setVisible(false)
          setInsumoSeleccionado(null)
        }}
        size="lg"
      >
        <CModalHeader
          closeButton
          style={{
            borderBottom: '2px solid #f0f0f0',
            padding: '24px 30px',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '800',
              color: '#1A1C20',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            📊 Actualizar Inventario
          </h4>
        </CModalHeader>
        
        <CModalBody style={{ padding: '30px' }}>
          {insumoSeleccionado ? (
            <>
              {/* Información del insumo */}
              <div
                style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px', fontWeight: '600' }}>
                    Insumo:
                  </span>
                  <span
                    style={{
                      marginLeft: '8px',
                      color: '#333',
                      fontSize: '18px',
                      fontWeight: '700',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {insumoSeleccionado.nombre}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#666', fontSize: '14px', fontWeight: '600' }}>
                    Stock actual:
                  </span>
                  <span
                    style={{
                      marginLeft: '8px',
                      color: '#FF6600',
                      fontSize: '18px',
                      fontWeight: '800',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {insumoSeleccionado.stockActual} {insumoSeleccionado.unidadMedida}
                  </span>
                </div>
              </div>

              {/* Tipo movimiento */}
              <div style={{ marginBottom: '20px' }}>
                <CFormLabel
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Tipo de movimiento
                </CFormLabel>
                <CFormSelect
                  value={String(movimientoData.tipoMovimiento)}
                  onChange={(e) =>
                    setMovimientoData({
                      ...movimientoData,
                      tipoMovimiento: Number(e.target.value),
                    })
                  }
                  style={{
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <option value={1}>📥 Entrada (agregar stock)</option>
                  <option value={0}>📤 Salida (descontar stock)</option>
                </CFormSelect>
              </div>

              {/* Cantidad */}
              <div style={{ marginBottom: '20px' }}>
                <CFormLabel
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Cantidad *
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={movimientoData.cantidad}
                  onChange={(e) =>
                    setMovimientoData({
                      ...movimientoData,
                      cantidad: e.target.value,
                    })
                  }
                  placeholder={`Ej: 50 ${insumoSeleccionado.unidadMedida}`}
                  style={{
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    fontWeight: '600',
                  }}
                />
              </div>

              {/* Motivo */}
              <div>
                <CFormLabel
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Motivo *
                </CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Ej: Compra de proveedor, uso en producción, corrección..."
                  value={movimientoData.motivo}
                  onChange={(e) =>
                    setMovimientoData({
                      ...movimientoData,
                      motivo: e.target.value,
                    })
                  }
                  style={{
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: '10px',
                    border: '2px solid #e0e0e0',
                    fontWeight: '500',
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>Cargando datos del insumo...</p>
            </div>
          )}
        </CModalBody>

        <CModalFooter style={{ borderTop: '2px solid #f0f0f0', padding: '20px 30px', gap: '12px' }}>
          <CButton
            color="light"
            onClick={() => {
              setVisible(false)
              setInsumoSeleccionado(null)
            }}
            style={{ 
              padding: '12px 24px', 
              fontWeight: '600', 
              borderRadius: '10px',
              border: '1px solid #ddd'
            }}
          >
            Cancelar
          </CButton>
          <CButton 
            onClick={actualizarStock} 
            style={{ 
              padding: '12px 24px', 
              fontWeight: '700', 
              borderRadius: '10px', 
              fontSize: '14px', 
              background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)', 
              border: 'none', 
              color: 'white' 
            }}
          >
            ✅ Actualizar Stock
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Insumos