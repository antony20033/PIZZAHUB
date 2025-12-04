import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from "../config/api"
import {
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilUserPlus, cilPhone, cilTruck } from '@coreui/icons'

const Repartidores = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    usuarioId: ''
  })

  const [usuarios, setUsuarios] = useState([])
  const [repartidores, setRepartidores] = useState([])

  // 🔹 Cargar usuarios con rol 2
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/Clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return

      const data = await res.json()

      const empleados = data
        .filter(u => u.usuario && u.usuario.rol === 2)
        .map(u => ({
          id: u.usuario.id,
          nombreUsuario: u.usuario.nombreUsuario
        }))

      setUsuarios(empleados)
    } catch (err) {
      console.error("Error cargando usuarios:", err)
    }
  }

  // 🔹 Cargar repartidores
  const fetchRepartidores = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/Repartidores`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return

      const data = await res.json()
      setRepartidores(data)
    } catch (err) {
      console.error("Error cargando repartidores:", err)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchRepartidores()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')

      const res = await fetch(`${API_BASE_URL}/api/Repartidores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          usuarioId: parseInt(formData.usuarioId)
        })
      })

      if (!res.ok) {
        alert("Error al registrar el repartidor")
        return
      }

      alert("Repartidor registrado correctamente ✔")

      // Reset form
      setFormData({
        nombre: '',
        apellidos: '',
        telefono: '',
        usuarioId: ''
      })

      // Refrescar tabla
      fetchRepartidores()
    } catch (err) {
      console.error("Error al registrar repartidor:", err)
    }
  }

  return (
    <div style={{ padding: '20px', background: '#F3F4F6', minHeight: '100vh' }}>
      {/* FORMULARIO */}
      <CCard className="shadow-lg mb-4 fade-in" style={{ borderRadius: '20px', border: 'none' }}>
        <CCardHeader style={{ 
          background: 'white', 
          borderBottom: '3px solid #FF6600',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '20px 30px'
        }}>
          <div className="d-flex align-items-center">
            <CIcon icon={cilTruck} size="lg" className="me-2" style={{ color: '#FF6600' }} />
            <h5 className="mb-0" style={{ fontWeight: '700', color: '#1A1C20' }}>Registrar Repartidor</h5>
          </div>
        </CCardHeader>

        <CCardBody style={{ backgroundColor: 'white', padding: '30px' }}>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">

              {/* Usuario */}
              <CCol md={6}>
                <CFormLabel>Usuario</CFormLabel>
                <CFormSelect
                  name="usuarioId"
                  value={formData.usuarioId}
                  onChange={handleInputChange}
                >
                  <option value="">-- Seleccione un usuario --</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombreUsuario}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Nombre */}
              <CCol md={6}>
                <CFormLabel>Nombre</CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormInput
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre del repartidor"
                  />
                </CInputGroup>
              </CCol>

              {/* Apellidos */}
              <CCol md={6}>
                <CFormLabel>Apellidos</CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormInput
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    placeholder="Apellidos"
                  />
                </CInputGroup>
              </CCol>

              {/* Teléfono */}
              <CCol md={6}>
                <CFormLabel>Teléfono</CFormLabel>
                <CInputGroup>
                  <CInputGroupText><CIcon icon={cilPhone} /></CInputGroupText>
                  <CFormInput
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="4771234567"
                  />
                </CInputGroup>
              </CCol>

              {/* Botón */}
              <CCol xs={12}>
                <CButton
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                    border: 'none',
                    padding: '14px',
                    fontWeight: '700',
                    borderRadius: '12px',
                    color: 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CIcon icon={cilUserPlus} className="me-2" />
                  Registrar Repartidor
                </CButton>
              </CCol>

            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {/* TABLA DE REPARTIDORES */}
      <CCard className="shadow-lg fade-in" style={{ borderRadius: '20px', border: 'none' }}>
        <CCardHeader style={{ 
          background: 'white', 
          borderBottom: '3px solid #FF6600',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '20px 30px'
        }}>
          <h5 className="mb-0" style={{ fontWeight: '700', color: '#1A1C20' }}>📋 Lista de Repartidores</h5>
        </CCardHeader>

        <CCardBody style={{ padding: '30px', background: 'white' }}>
          <CTable hover responsive>
            <CTableHead style={{ background: '#F3F4F6' }}>
              <CTableRow>
                <CTableHeaderCell style={{ fontWeight: '700', color: '#1A1C20', borderBottom: '2px solid #E5E7EB' }}>ID</CTableHeaderCell>
                <CTableHeaderCell style={{ fontWeight: '700', color: '#1A1C20', borderBottom: '2px solid #E5E7EB' }}>Nombre</CTableHeaderCell>
                <CTableHeaderCell style={{ fontWeight: '700', color: '#1A1C20', borderBottom: '2px solid #E5E7EB' }}>Teléfono</CTableHeaderCell>
                <CTableHeaderCell style={{ fontWeight: '700', color: '#1A1C20', borderBottom: '2px solid #E5E7EB' }}>Usuario</CTableHeaderCell>
                <CTableHeaderCell style={{ fontWeight: '700', color: '#1A1C20', borderBottom: '2px solid #E5E7EB' }}>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {repartidores.map(r => (
                <CTableRow key={r.id}>
                  <CTableDataCell>{r.id}</CTableDataCell>
                  <CTableDataCell>{r.nombre} {r.apellidos}</CTableDataCell>
                  <CTableDataCell>{r.telefono}</CTableDataCell>
                  <CTableDataCell>{r.usuario?.nombreUsuario}</CTableDataCell>
                  <CTableDataCell>
                    {r.estado === 0 ? "Activo" : "Inactivo"}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Repartidores
