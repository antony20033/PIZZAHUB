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
  CTableDataCell,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilUser, cilUserPlus, cilPhone } from '@coreui/icons'

const RegistroEmpleado = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    usuarioId: '',
  })

  const [usuarios, setUsuarios] = useState([])
  const [empleados, setEmpleados] = useState([])

  // 🔹 Cargar usuarios con rol 2
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/Clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return

      const data = await res.json()

      const empleadosDisponibles = data
        .filter((u) => u.usuario && u.usuario.rol === 2)
        .map((u) => ({
          id: u.usuario.id,
          nombreUsuario: u.usuario.nombreUsuario,
        }))

      setUsuarios(empleadosDisponibles)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
    }
  }

  // 🔹 Cargar empleados desde API
  const fetchEmpleados = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/Empleados`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return

      const data = await res.json()
      setEmpleados(data)
    } catch (err) {
      console.error('Error al cargar empleados:', err)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchEmpleados()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.usuarioId) {
      alert('Seleccione un usuario para registrar')
      return
    }

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_BASE_URL}/api/Empleados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          usuarioId: parseInt(formData.usuarioId),
        }),
      })

      if (!response.ok) {
        alert('Error al registrar empleado')
        return
      }

      alert('Empleado registrado correctamente ✔')

      setFormData({
        nombre: '',
        apellidos: '',
        telefono: '',
        usuarioId: '',
      })

      fetchEmpleados()
    } catch (err) {
      console.error('Error al registrar empleado:', err)
      alert('Error en el servidor')
    }
  }

  return (
    <div className="page-container" style={{ background: '#F3F4F6', minHeight: '100vh', width: '100%', maxWidth: '100%', margin: 0 }}>
      {/* FORMULARIO */}
      <CCard
        className="shadow-lg mb-4 fade-in"
        style={{ borderRadius: '20px', border: 'none' }}
      >
        <CCardHeader
          style={{
            background: 'white',
            borderBottom: '3px solid #FF6600',
            padding: '20px 30px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          <div className="d-flex align-items-center">
            <CIcon icon={cilUser} size="lg" className="me-2" style={{ color: '#FF6600' }} />
            <span style={{ color: '#1A1C20' }}>Registrar Nuevo Empleado</span>
          </div>
        </CCardHeader>

        <CCardBody style={{ backgroundColor: 'white', padding: '30px' }}>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">
              {/* Usuario */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: '600' }}>Usuario</CFormLabel>
                <CFormSelect
                  name="usuarioId"
                  value={formData.usuarioId}
                  onChange={handleInputChange}
                  style={{ borderRadius: '10px' }}
                >
                  <option value="">-- Seleccione un usuario --</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombreUsuario}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Nombre */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: '600' }}>Nombre</CFormLabel>
                <CInputGroup>
                  <CInputGroupText style={{ background: '#eef3ff' }}>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    name="nombre"
                    placeholder="Nombre del empleado"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    style={{ borderRadius: '10px' }}
                  />
                </CInputGroup>
              </CCol>

              {/* Apellidos */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: '600' }}>Apellidos</CFormLabel>
                <CInputGroup>
                  <CInputGroupText style={{ background: '#eef3ff' }}>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    name="apellidos"
                    placeholder="Apellidos del empleado"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    style={{ borderRadius: '10px' }}
                  />
                </CInputGroup>
              </CCol>

              {/* Teléfono */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: '600' }}>Teléfono</CFormLabel>
                <CInputGroup>
                  <CInputGroupText style={{ background: '#eef3ff' }}>
                    <CIcon icon={cilPhone} />
                  </CInputGroupText>
                  <CFormInput
                    name="telefono"
                    placeholder="4771234567"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    style={{ borderRadius: '10px' }}
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
                    color: 'white'
                  }}
                >
                  <CIcon icon={cilUserPlus} className="me-2" />
                  Registrar Empleado
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {/* TABLA */}
      <CCard
        className="shadow-lg fade-in"
        style={{ borderRadius: '20px', border: 'none' }}
      >
        <CCardHeader
          style={{
            background: 'white',
            borderBottom: '3px solid #FF6600',
            color: '#1A1C20',
            fontWeight: 'bold',
            padding: '20px 30px',
            fontSize: '1.2rem',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          Lista de Empleados
        </CCardHeader>

        <CCardBody style={{ background: 'white', padding: '30px' }}>
          <CTable hover responsive>
            <CTableHead style={{ background: '#F3F4F6' }}>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Teléfono</CTableHeaderCell>
                <CTableHeaderCell>Usuario</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {empleados.map((emp) => (
                <CTableRow key={emp.id}>
                  <CTableDataCell>{emp.id}</CTableDataCell>
                  <CTableDataCell>
                    {emp.nombre} {emp.apellidos}
                  </CTableDataCell>
                  <CTableDataCell>{emp.telefono}</CTableDataCell>
                  <CTableDataCell>{emp.usuario?.nombreUsuario}</CTableDataCell>
                  <CTableDataCell>
                    {emp.estado === 0 ? 'Activo' : 'Inactivo'}
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

export default RegistroEmpleado
