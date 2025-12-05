import React, { useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CListGroup,
  CListGroupItem,
  CRow,
  CCol,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus } from '@coreui/icons'
import { useNavigate } from "react-router-dom"

const UsuariosMovil = () => {
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    apellidos: '',
    telefono: '',
    colonia: '',
    calle: '',
    numeroCasa: '',
    observaciones: '',
    usuarioId: 0,
  })

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const esCliente = (c) => {
    if (!c.usuario) return true
    return c.usuario.rol === 3
  }

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setClientes(data.filter(esCliente))
    } catch (err) {
      console.error('Error al cargar clientes:', err)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const filtrados = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const openModal = (cliente = null) => {
    if (cliente) {
      setFormData({
        id: cliente.id,
        nombre: cliente.nombre || '',
        apellidos: cliente.apellidos || '',
        telefono: cliente.telefono || '',
        colonia: cliente.colonia || '',
        calle: cliente.calle || '',
        numeroCasa: cliente.numeroCasa || '',
        observaciones: cliente.observaciones || '',
        usuarioId: 0,
      })
    } else {
      setFormData({
        id: 0,
        nombre: '',
        apellidos: '',
        telefono: '',
        colonia: '',
        calle: '',
        numeroCasa: '',
        observaciones: '',
        usuarioId: 0,
      })
    }
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      let url = `${API_BASE_URL}/api/Clientes`
      let method = 'POST'
      if (formData.id && formData.id > 0) {
        url += `/${formData.id}`
        method = 'PUT'
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        alert('Error al guardar cliente')
        return
      }

      alert(`Cliente ${formData.id ? 'actualizado' : 'registrado'} correctamente ✔`)
      setModalVisible(false)
      fetchClientes()
    } catch (err) {
      console.error(err)
      alert('Error en el servidor')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Desea eliminar este cliente?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/Clientes/${formData.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        alert('Error al eliminar cliente')
        return
      }
      alert('Cliente eliminado correctamente ✔')
      setModalVisible(false)
      fetchClientes()
    } catch (err) {
      console.error(err)
      alert('Error en el servidor')
    }
  }

  return (
    <>
      <div className="page-container" style={{ background: '#F3F4F6', minHeight: '100vh', width: '100%', maxWidth: '100%', margin: 0 }}>
      <CCard className="fade-in" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <CCardHeader
          style={{
            background: 'white',
            borderBottom: '3px solid #FF6600',
            color: '#1A1C20',
            fontWeight: '700',
            fontSize: '1.2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 30px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          Clientes

          <CButton
            onClick={() => openModal()}
            size="sm"
            style={{ 
              fontWeight: '700', 
              background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '10px',
              color: 'white'
            }}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Agregar
          </CButton>
        </CCardHeader>

        <CCardBody style={{ background: 'white', padding: '30px' }}>
          <CRow className="mb-4">
            <CCol md={6} lg={4}>
              <CInputGroup className="shadow-sm">
                <CInputGroupText style={{ background: '#eef1f6' }}>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </CInputGroup>
            </CCol>
          </CRow>

          <CListGroup>
            {filtrados.length > 0 ? (
              filtrados.map((c) => (
                <CListGroupItem
                  key={c.id}
                  className="d-flex align-items-center justify-content-between"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    padding: '15px',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: '0.25s',
                  }}
                  onClick={() => openModal(c)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'scale(1.01)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'scale(1)')
                  }
                >
                  <div>
                    <h6 style={{ margin: 0, fontWeight: '600', color: '#333' }}>{c.nombre}</h6>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{c.telefono}</p>
                    <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>{c.colonia}</p>
                  </div>

                  <CButton
                    size="sm"
                    style={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      localStorage.setItem("pedidoClienteId", c.id)
                      navigate("/pages/EntradaPedidos")
                    }}
                  >
                    Hacer Pedido
                  </CButton>
                </CListGroupItem>
              ))
            ) : (
              <p className="text-center text-muted py-4">
                No se encontraron clientes con "{busqueda}"
              </p>
            )}
          </CListGroup>
        </CCardBody>
      </CCard>
      </div>

      {/* MODAL */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ fontWeight: '600' }}>
          {formData.id ? 'Editar Cliente' : 'Registrar Cliente'}
        </CModalHeader>

        <CModalBody style={{ background: '#f8f9fa' }}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Nombre</CFormLabel>
              <CFormInput name="nombre" value={formData.nombre} onChange={handleInputChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Apellidos</CFormLabel>
              <CFormInput name="apellidos" value={formData.apellidos} onChange={handleInputChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Teléfono</CFormLabel>
              <CFormInput name="telefono" value={formData.telefono} onChange={handleInputChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Colonia</CFormLabel>
              <CFormInput name="colonia" value={formData.colonia} onChange={handleInputChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Calle</CFormLabel>
              <CFormInput name="calle" value={formData.calle} onChange={handleInputChange} />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Número Casa</CFormLabel>
              <CFormInput name="numeroCasa" value={formData.numeroCasa} onChange={handleInputChange} />
            </CCol>

            <CCol xs={12}>
              <CFormLabel>Observaciones</CFormLabel>
              <CFormTextarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          {formData.id > 0 && (
            <CButton color="danger" onClick={handleDelete}>
              Eliminar
            </CButton>
          )}
          <CButton onClick={handleSubmit} style={{ background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)', border: 'none', padding: '10px 20px', fontWeight: '700', borderRadius: '10px', color: 'white' }}>
            {formData.id ? 'Actualizar' : 'Registrar'}
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default UsuariosMovil
