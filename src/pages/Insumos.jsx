import React, { useState, useEffect } from 'react'
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
    tipoMovimiento: 0, // 0 = salida, 1 = entrada (coincide con tu API ejemplo)
    motivo: '',
  })

  // --- Normaliza unidad (acepta número o texto) ---
  const parseUnidad = (u) => {
    if (u === null || u === undefined) return 3 // por defecto unidades
    // si es número ya
    if (!Number.isNaN(Number(u))) {
      const n = Number(u)
      switch (n) {
        case 0: return 0 // kg
        case 1: return 1 // litros
        case 2: return 2 // gramos
        case 3: return 3 // unidades
        default: return 3
      }
    }
    // si viene texto
    const s = String(u).toLowerCase()
    if (s.includes('kg')) return 0
    if (s.includes('kilo')) return 0
    if (s.includes('lit')) return 1
    if (s.includes('gram')) return 2
    if (s.includes('g')) return 2
    if (s.includes('unidad')) return 3
    return 3
  }

  const obtenerUnidad = (num) => {
    switch (num) {
      case 0: return 'kg'
      case 1: return 'litros'
      case 2: return 'gramos'
      case 3: return 'unidades'
      default: return ''
    }
  }

  // --- Fetch insumos robusto ---
  const fetchInsumos = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No hay token en localStorage')
        setInsumosAPI([])
        setLoading(false)
        return
      }

      const response = await fetch('https://pizzahub-api.onrender.com/api/Insumos', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        console.error('Error al cargar insumos:', response.status)
        setInsumosAPI([])
        setLoading(false)
        return
      }

      // leer seguro
      const text = await response.text()
      const data = text ? JSON.parse(text) : []

      // Convertir y añadir campos útiles para UI
      const insumosConvertidos = data.map((i) => {
        const unidadNorm = parseUnidad(i.unidadMedida)
        const stockNum = Number(i.stockActual ?? 0)
        return {
          raw: i, // mantenemos el objeto original por si lo necesitas
          id: i.id,
          nombre: i.nombre ?? 'Sin nombre',
          unidadMedidaRaw: i.unidadMedida,
          unidadMedida: unidadNorm, // 0..3
          stockActual: stockNum,
          cantidad: `${stockNum} ${obtenerUnidad(unidadNorm)}`,
          color: 'primary',
          imagen: '📦',
          tipoIcono: 'emoji',
        }
      })

      setInsumosAPI(insumosConvertidos)
    } catch (error) {
      console.error('Error en fetchInsumos:', error)
      setInsumosAPI([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsumos()
  }, [])

  const handleInsumoClick = (insumo) => {
  console.log("INSUMO SELECCIONADO:", insumo)
  setInsumoSeleccionado(insumo)
  setMovimientoData({
    cantidad: "",
    tipoMovimiento: 1,
    motivo: ""
  })
  setVisible(true)
}


  // --- actualizar stock (POST a InventarioLog) ---
  const actualizarStock = async () => {
    if (!insumoSeleccionado) {
      alert('Seleccione un insumo')
      return
    }
    const cantidadNum = parseFloat(movimientoData.cantidad)
    if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
      alert('Ingresa una cantidad válida mayor a 0.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('No autorizado. Falta token.')
      return
    }

    // Body exactamente como tu API espera
    const body = {
      insumoId: insumoSeleccionado.id,
      cantidad: cantidadNum,
      tipoMovimiento: Number(movimientoData.tipoMovimiento), // 0 o 1
      motivo: movimientoData.motivo || 'Actualización manual',
    }

    try {
      const response = await fetch('https://pizzahub-api.onrender.com/api/InventarioLog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => null)
        console.error('Error InventarioLog:', response.status, text)
        alert('Error al actualizar stock (ver consola).')
        return
      }

      // éxito
      alert('Stock actualizado correctamente')
      setVisible(false)
      // refrescar lista
      await fetchInsumos()
    } catch (error) {
      console.error('Error en actualizarStock:', error)
      alert('Error en la petición. Revisa consola.')
    }
  }

  const insumosFiltrados = insumosAPI.filter((insumo) =>
    insumo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const renderIcono = (insumo) => {
    if (insumo.tipoIcono === 'emoji') {
      return <span style={{ fontSize: '32px' }}>{insumo.imagen}</span>
    }
    return null
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F3F4F6',
        padding: '30px 20px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div
          className="fade-in"
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
                    Intenta con otro término de búsqueda
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
                          {insumo.cantidad}
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
        onClose={() => setVisible(false)}
        size="lg"
        style={{
          borderRadius: '20px',
        }}
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
      {console.log("MODAL — INSUMO:", insumoSeleccionado)}

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
            {insumoSeleccionado.stockActual}{' '}
            {obtenerUnidad(insumoSeleccionado.unidadMedida)}
          </span>
        </div>
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
          Cantidad
        </CFormLabel>
        <CFormInput
          type="number"
          value={movimientoData.cantidad}
          onChange={(e) =>
            setMovimientoData({
              ...movimientoData,
              cantidad: e.target.value,
            })
          }
          placeholder="Ingresa la cantidad..."
          style={{
            padding: '12px 16px',
            fontSize: '15px',
            borderRadius: '10px',
            border: '2px solid #e0e0e0',
            fontWeight: '500',
          }}
        />
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
          <option value={0}>📤 Salida (descontar)</option>
          <option value={1}>📥 Entrada (agregar)</option>
        </CFormSelect>
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
          Motivo
        </CFormLabel>
        <CFormInput
          type="text"
          placeholder="Ej: Corrección, consumo, compra..."
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
    <div>Cargando datos…</div>
  )}
</CModalBody>


        <CModalFooter style={{ borderTop: '2px solid #f0f0f0', padding: '20px 30px', gap: '12px' }}>
          <CButton
  color="secondary"
  onClick={() => setVisible(false)}
  style={{ padding: '12px 24px', fontWeight: '700', borderRadius: '10px' }}
>
  Cancelar
</CButton>

          <CButton onClick={actualizarStock} style={{ padding: '12px 24px', fontWeight: '700', borderRadius: '10px', fontSize: '14px', background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)', border: 'none', color: 'white' }}>
            ✅ Actualizar Stock
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Insumos
