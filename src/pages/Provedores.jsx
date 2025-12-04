import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from "../config/api"
import {
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalBody,
  CModalHeader,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilPhone,
  cilSave,
  cilTrash,
  cilPen,
} from '@coreui/icons'

const Provedores = () => {
  const [usuarios, setUsuarios] = useState([])
  const [repartidores, setRepartidores] = useState([])

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    usuarioId: '',
  })

  const [editModal, setEditModal] = useState(false)
  const [repartidorEditando, setRepartidorEditando] = useState(null)

  // ======== CARGAR USUARIOS (solo rol 2) ==========
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Usuarios`)
      const data = await res.json()

      const filtrados = data.filter((u) => u.rol === 2 || u.rol === 3) // empleados o repartidores
      setUsuarios(filtrados)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    }
  }

  // ======== CARGAR REPARTIDORES ==========
  const fetchRepartidores = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Repartidores`)
      const data = await res.json()
      setRepartidores(data)
    } catch (err) {
      console.error('Error cargando repartidores:', err)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchRepartidores()
  }, [])

  // ========= MANEJAR FORM ==========
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ========= REGISTRAR REPARTIDOR ==========
  const handleAgregar = async (e) => {
    e.preventDefault()

    if (!form.nombre || !form.apellidos || !form.telefono || !form.usuarioId) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/Repartidores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        await fetchRepartidores()
        setForm({ nombre: '', apellidos: '', telefono: '', usuarioId: '' })
      }
    } catch (err) {
      console.error('Error registrando:', err)
    }
  }

  // ========= ELIMINAR ==========
  const handleEliminar = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/Repartidores/${id}`, {
        method: 'DELETE',
      })

      fetchRepartidores()
    } catch (err) {
      console.error('Error eliminando:', err)
    }
  }

  // ========= EDITAR ==========
  const abrirEditar = (rep) => {
    setRepartidorEditando(rep)
    setEditModal(true)
  }

  const handleGuardarEdicion = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/Repartidores/${repartidorEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repartidorEditando),
      })

      setEditModal(false)
      fetchRepartidores()
    } catch (err) {
      console.error('Error editando:', err)
    }
  }

 return (
    <>
      <div style={{ padding: '20px', background: '#F3F4F6', minHeight: '100vh' }}>
        <CCard className="fade-in" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <CCardHeader
            style={{
              background: 'white',
              borderBottom: '3px solid #FF6600',
              color: '#1A1C20',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '20px 30px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }}
          >
            Registro de Repartidores
          </CCardHeader>

          <CCardBody style={{ background: 'white', padding: '30px' }}>
            <CRow>
              {/* FORMULARIO */}
              <CCol md={4}>
                <h5 style={{ fontWeight: 'bold', color: '#333' }}>Nuevo Repartidor</h5>

                <CForm onSubmit={handleAgregar}>
                  {/* Nombre */}
                  <CFormLabel>Nombre</CFormLabel>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="nombre"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  {/* Apellidos */}
                  <CFormLabel>Apellidos</CFormLabel>
                  <CFormInput
                    className="mb-3"
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                  />

                  {/* Teléfono */}
                  <CFormLabel>Teléfono</CFormLabel>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="telefono"
                      placeholder="Número telefónico"
                      value={form.telefono}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  {/* Usuario */}
                  <CFormLabel>Usuario</CFormLabel>
                  <CFormInput
                    list="usuariosList"
                    name="usuarioId"
                    className="mb-3"
                    placeholder="Selecciona un usuario"
                    value={form.usuarioId}
                    onChange={handleChange}
                  />

                  <datalist id="usuariosList">
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombreUsuario}
                      </option>
                    ))}
                  </datalist>

                  <CButton type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)', border: 'none', padding: '12px', fontWeight: '700', borderRadius: '12px', color: 'white' }}>
                    <CIcon icon={cilSave} className="me-2" />
                    Guardar
                  </CButton>
                </CForm>
              </CCol>

              {/* TABLA */}
              <CCol md={8}>
                <h5 style={{ fontWeight: 'bold', color: '#333' }}>Lista de Repartidores</h5>

                <CTable hover bordered responsive>
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Teléfono</CTableHeaderCell>
                      <CTableHeaderCell>Usuario</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {repartidores.map((r) => (
                      <CTableRow key={r.id}>
                        <CTableDataCell>{r.nombre + ' ' + r.apellidos}</CTableDataCell>
                        <CTableDataCell>{r.telefono}</CTableDataCell>
                        <CTableDataCell>{r.usuario?.nombreUsuario || '-'}</CTableDataCell>

                        <CTableDataCell className="text-center">
                          <CButton
                            size="sm"
                            color="warning"
                            className="me-2 text-white"
                            onClick={() => abrirEditar(r)}
                          >
                            <CIcon icon={cilPen} />
                          </CButton>

                          <CButton
                            size="sm"
                            color="danger"
                            onClick={() => handleEliminar(r.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </div>

      {/* MODAL EDITAR */}
      <CModal visible={editModal} onClose={() => setEditModal(false)}>
        <CModalHeader>Editar Repartidor</CModalHeader>
        <CModalBody>
          {repartidorEditando && (
            <>
              <CFormLabel>Nombre</CFormLabel>
              <CFormInput
                className="mb-3"
                value={repartidorEditando.nombre}
                onChange={(e) =>
                  setRepartidorEditando({
                    ...repartidorEditando,
                    nombre: e.target.value,
                  })
                }
              />

              <CFormLabel>Apellidos</CFormLabel>
              <CFormInput
                className="mb-3"
                value={repartidorEditando.apellidos}
                onChange={(e) =>
                  setRepartidorEditando({
                    ...repartidorEditando,
                    apellidos: e.target.value,
                  })
                }
              />

              <CFormLabel>Teléfono</CFormLabel>
              <CFormInput
                className="mb-3"
                value={repartidorEditando.telefono}
                onChange={(e) =>
                  setRepartidorEditando({
                    ...repartidorEditando,
                    telefono: e.target.value,
                  })
                }
              />

              <CButton
                onClick={handleGuardarEdicion}
                style={{ background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)', border: 'none', padding: '12px 20px', fontWeight: '700', borderRadius: '10px', color: 'white' }}
              >
                <CIcon icon={cilSave} className="me-2" />
                Guardar Cambios
              </CButton>
            </>
          )}
        </CModalBody>
      </CModal>
    </>
)

}

export default Provedores
