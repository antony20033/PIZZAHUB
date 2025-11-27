import React, { useState } from 'react'
import {
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilWarning, cilText, cilNotes, cilLibraryAdd } from '@coreui/icons'

const AgregarMermas = () => {
  const [form, setForm] = useState({
    nombre: '',
    cantidad: '',
    unidad: '',
    motivo: '',
  })

  const [mensaje, setMensaje] = useState('')

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.nombre || !form.cantidad || !form.unidad || !form.motivo) {
      setMensaje('Por favor, completa todos los campos.')
      return
    }

    // Simulación de guardado
    console.log('Merma guardada:', form)
    setMensaje('Merma registrada correctamente.')
  }

  return (
    <div style={{ padding: '20px', background: '#F3F4F6', minHeight: '100vh' }}>
      <CCard className="fade-in" style={{ border: 'none', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <CCardHeader
          style={{
            background: 'white',
            borderBottom: '3px solid #FF6600',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '20px 30px',
            color: '#1A1C20',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          <CIcon icon={cilLibraryAdd} className="me-2" style={{ color: '#FF6600' }} />
          Registrar Nueva Merma
        </CCardHeader>

        <CCardBody style={{ background: 'white', padding: '30px' }}>
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-4">

            {/* Nombre de la merma */}
            <CCol md={6}>
              <CFormLabel style={{ fontWeight: '600', color: '#333' }}>
                Nombre de la Merma
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilText} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="nombre"
                  placeholder="Ej. Harina vencida"
                  value={form.nombre}
                  onChange={handleChange}
                  style={{ background: '#fff', borderColor: '#ccc' }}
                />
              </CInputGroup>
            </CCol>

            {/* Cantidad */}
            <CCol md={6}>
              <CFormLabel style={{ fontWeight: '600', color: '#333' }}>
                Cantidad
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilWarning} />
                </CInputGroupText>
                <CFormInput
                  type="number"
                  name="cantidad"
                  placeholder="Ej. 5"
                  value={form.cantidad}
                  onChange={handleChange}
                  style={{ background: '#fff', borderColor: '#ccc' }}
                  min="0"
                />
              </CInputGroup>
            </CCol>

          </CRow>

          <CRow className="mb-4">
            {/* Unidad */}
            <CCol md={6}>
              <CFormLabel style={{ fontWeight: '600', color: '#333' }}>
                Unidad
              </CFormLabel>
              <CFormSelect
                name="unidad"
                value={form.unidad}
                onChange={handleChange}
                style={{ background: '#fff', borderColor: '#ccc' }}
              >
                <option value="">Seleccione...</option>
                <option value="kg">Kilogramos</option>
                <option value="g">Gramos</option>
                <option value="unidades">Unidades</option>
                <option value="litros">Litros</option>
              </CFormSelect>
            </CCol>

            {/* Motivo */}
            <CCol md={6}>
              <CFormLabel style={{ fontWeight: '600', color: '#333' }}>
                Motivo
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilNotes} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  name="motivo"
                  placeholder="Ej. Producto vencido, derrame..."
                  value={form.motivo}
                  onChange={handleChange}
                  style={{ background: '#fff', borderColor: '#ccc' }}
                />
              </CInputGroup>
            </CCol>
          </CRow>

          {/* Mensaje de validación */}
          {mensaje && (
            <p
              style={{
                color: mensaje.includes('correctamente') ? 'green' : 'red',
                fontWeight: '600',
              }}
            >
              {mensaje}
            </p>
          )}

          {/* Botón guardar */}
          <div className="text-end">
            <CButton
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                border: 'none',
                padding: '14px 24px',
                fontWeight: '700',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              <CIcon icon={cilSave} className="me-2" />
              Guardar Merma
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
    </div>
  )
}

export default AgregarMermas
