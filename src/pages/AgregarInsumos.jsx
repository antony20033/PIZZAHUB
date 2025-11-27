import React, { useState } from 'react'
import {
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CCard,
  CCardBody,
  // CCardHeader, // Se puede remover si no se usa
} from '@coreui/react'

const AgregarInsumos = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: '',
    unidad: '',
    proveedor: '',
    caducidad: '',
    costo: '',
    tipoIcono: 'emoji',
    imagen: '',
    color: 'primary',
    notas: ''
  })

  const convertirUnidad = (unidadTexto) => {
    switch (unidadTexto) {
      case "kg": return 0;
      case "litros": return 1;
      case "g": return 2;
      case "unidades": return 3;
      default: return 3;
    }
  };

  const coloresDisponibles = [
    { value: 'primary', label: 'Azul' },
    { value: 'secondary', label: 'Gris' },
    { value: 'success', label: 'Verde' },
    { value: 'danger', label: 'Rojo' },
    { value: 'warning', label: 'Amarillo' },
    { value: 'info', label: 'Cian' },
    { value: 'dark', label: 'Negro' }
  ]

  const emojisComunes = ['🌾', '🍬', '🥚', '🧈', '🥛', '🍫', '🌼', '🧂', '🫙', '🌿', '🍯', '🥜', '🥄', '🍞', '🥖', '🧁', '🍰', '☕', '🧃', '🥤']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    // Lógica para unidades, manteniendo la original
    const unidadNumero = convertirUnidad(formData.unidad);

    const data = {
      nombre: formData.nombre,
      unidadMedida: unidadNumero,
      stockInicial: parseFloat(formData.cantidad),
      stockMinimo: 10
    };

    try {
      const response = await fetch("https://pizzahub-api.onrender.com/api/Insumos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.error("Error API:", response.status);
        alert("No se pudo registrar el insumo");
        return;
      }

      alert("Insumo registrado correctamente");
      console.log("Respuesta API:", await response.json());

    } catch (error) {
      console.error("Error en POST:", error);
      alert("Ocurrió un error al enviar el insumo");
    }
  };

  const handleCancel = () => {
    console.log('Cancelar registro')
    // Puedes agregar aquí la lógica de navegación o reseteo
  }

  // Estilos base para campos de formulario
  const formInputStyle = {
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }

 

  // Estilos para etiquetas
  const formLabelStyle = {
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#555', // Gris oscuro para la etiqueta
    marginBottom: '8px',
  }

  // Color principal para títulos y líneas divisorias
  const primaryColor = '#FF6600'; // Naranja PizzaHub

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F3F4F6',
        padding: '30px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header con Sombra Suave */}
        <div
          className="fade-in"
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderBottom: '4px solid #FF6600',
          }}
        >
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '32px',
              fontWeight: '700',
              color: primaryColor,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ➕ Registro de Insumos
          </h1>
          <p style={{ margin: 0, color: '#777', fontSize: '16px' }}>
            Introduce la información del nuevo insumo para añadirlo al inventario.
          </p>
        </div>

        {/* Formulario Principal en Card */}
        <CCard
          style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          <CCardBody style={{ padding: '40px' }}>
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-4">
                {/* Título: Información Básica */}
                <CCol xs={12}>
                  <h5
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: primaryColor,
                      marginBottom: '20px',
                      paddingBottom: '12px',
                      borderBottom: `2px solid ${primaryColor}`,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    📋 Información Básica
                  </h5>
                </CCol>

                {/* Nombre del Insumo */}
                <CCol md={6}>
                  <CFormLabel htmlFor="nombre" style={formLabelStyle}>
                    Nombre del Insumo *
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Harina de trigo"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    style={formInputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  />
                </CCol>

                {/* Cantidad */}
                <CCol md={3}>
                  <CFormLabel htmlFor="cantidad" style={formLabelStyle}>
                    Cantidad *
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    placeholder="Ej: 50"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    style={{...formInputStyle, fontWeight: '600'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  />
                </CCol>

                {/* Unidad de Medida */}
                <CCol md={3}>
                  <CFormLabel htmlFor="unidad" style={formLabelStyle}>
                    Unidad *
                  </CFormLabel>
                  <CFormSelect
                    id="unidad"
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleInputChange}
                    style={{...formInputStyle, fontWeight: '600', cursor: 'pointer'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="kg">⚖️ Kilogramos (kg)</option>
                    <option value="g">📏 Gramos (g)</option>
                    <option value="litros">🧪 Litros</option>
                    <option value="ml">💧 Mililitros (ml)</option>
                    <option value="unidades">📦 Unidades</option>
                    <option value="piezas">🔢 Piezas</option>
                    <option value="cajas">📦 Cajas</option>
                    <option value="paquetes">📦 Paquetes</option>
                  </CFormSelect>
                </CCol>

                {/* Título: Detalles Adicionales */}
                <CCol xs={12}>
                  <h5
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: primaryColor,
                      marginTop: '20px',
                      marginBottom: '20px',
                      paddingBottom: '12px',
                      borderBottom: `2px solid ${primaryColor}`,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    📦 Información de Abastecimiento
                  </h5>
                </CCol>

                {/* Proveedor */}
                <CCol md={6}>
                  <CFormLabel htmlFor="proveedor" style={formLabelStyle}>
                    Proveedor
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="proveedor"
                    name="proveedor"
                    placeholder="Nombre del proveedor"
                    value={formData.proveedor}
                    onChange={handleInputChange}
                    style={formInputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  />
                </CCol>

                {/* Fecha de Caducidad */}
                <CCol md={3}>
                  <CFormLabel htmlFor="caducidad" style={formLabelStyle}>
                    Fecha de Caducidad
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    id="caducidad"
                    name="caducidad"
                    value={formData.caducidad}
                    onChange={handleInputChange}
                    style={{...formInputStyle, cursor: 'pointer'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  />
                </CCol>

                {/* Costo Unitario */}
                <CCol md={3}>
                  <CFormLabel htmlFor="costo" style={formLabelStyle}>
                    Costo Unitario
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.01"
                    id="costo"
                    name="costo"
                    placeholder="$0.00"
                    value={formData.costo}
                    onChange={handleInputChange}
                    style={{...formInputStyle, fontWeight: '600'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  />
                </CCol>

                {/* Título: Personalización Visual */}
                <CCol xs={12}>
                  <h5
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: primaryColor,
                      marginTop: '20px',
                      marginBottom: '20px',
                      paddingBottom: '12px',
                      borderBottom: `2px solid ${primaryColor}`,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    🎨 Personalización Visual
                  </h5>
                </CCol>

                {/* Tipo de Icono */}
                <CCol md={4}>
                  <CFormLabel htmlFor="tipoIcono" style={formLabelStyle}>
                    Tipo de Icono
                  </CFormLabel>
                  <CFormSelect
                    id="tipoIcono"
                    name="tipoIcono"
                    value={formData.tipoIcono}
                    onChange={handleInputChange}
                    style={{...formInputStyle, fontWeight: '600', cursor: 'pointer'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  >
                    <option value="emoji"> Emoji</option>
                    <option value="imagen"> URL de Imagen</option>
                  </CFormSelect>
                </CCol>

                {/* Imagen/Emoji (Lógica de visualización mantenida) */}
                {formData.tipoIcono === 'emoji' ? (
                  <CCol md={4}>
                    <CFormLabel htmlFor="imagen" style={formLabelStyle}>
                      Seleccionar Emoji
                    </CFormLabel>
                    <CFormSelect
                      id="imagen"
                      name="imagen"
                      value={formData.imagen}
                      onChange={handleInputChange}
                      style={{...formInputStyle, fontWeight: '600', cursor: 'pointer'}}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor
                        e.target.style.outline = 'none'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                      }}
                    >
                      <option value="">Seleccionar emoji...</option>
                      {emojisComunes.map((emoji, index) => (
                        <option key={index} value={emoji}>
                          {emoji} {emoji.replace(/\s/g, "")}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                ) : (
                  <CCol md={4}>
                    <CFormLabel htmlFor="imagen" style={formLabelStyle}>
                      URL de la Imagen
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="imagen"
                      name="imagen"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={formData.imagen}
                      onChange={handleInputChange}
                      style={formInputStyle}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor
                        e.target.style.outline = 'none'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                      }}
                    />
                  </CCol>
                )}

                {/* Color */}
                <CCol md={4}>
                  <CFormLabel htmlFor="color" style={formLabelStyle}>
                    Color de la Tarjeta
                  </CFormLabel>
                  <CFormSelect
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    style={{...formInputStyle, fontWeight: '600', cursor: 'pointer'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  >
                    {coloresDisponibles.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                {/* Vista Previa */}
                <CCol xs={12}>
                  <CFormLabel style={{...formLabelStyle, marginTop: '15px'}}>
                    👁️ Vista Previa del Insumo
                  </CFormLabel>
                  <div
                    style={{
                      padding: '25px',
                      borderRadius: '16px',
                      background: '#f1f1f1', // Fondo más neutral para la vista previa
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      border: '1px solid #ddd',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Icono/Imagen */}
                    <div style={{ 
                      fontSize: '48px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      // Estilo de tarjeta de color
                      backgroundColor: `var(--cui-${formData.color})`, // Usa la variable CSS de CoreUI
                      boxShadow: `0 4px 8px rgba(var(--cui-${formData.color}-rgb), 0.3)`,
                    }}>
                      {formData.tipoIcono === 'emoji' && formData.imagen ? (
                        <span style={{ filter: 'grayscale(0.1)' }}>{formData.imagen}</span>
                      ) : formData.tipoIcono === 'imagen' && formData.imagen ? (
                        <img src={formData.imagen} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                      ) : (
                        <span style={{color: 'white', fontSize: '32px'}}>❓</span>
                      )}
                    </div>
                    {/* Detalles */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '22px', color: '#333', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>
                        {formData.nombre || 'Nombre del Insumo'}
                      </div>
                      <div style={{ color: '#555', fontSize: '16px', fontWeight: '500' }}>
                        {formData.cantidad && formData.unidad
                          ? `Stock Inicial: ${formData.cantidad} ${formData.unidad}`
                          : 'Cantidad y unidad'}
                      </div>
                      <span className={`badge bg-${formData.color}`} style={{ padding: '6px 10px', fontSize: '12px', marginTop: '8px' }}>
                        {coloresDisponibles.find(c => c.value === formData.color)?.label || 'Sin color'}
                      </span>
                    </div>
                  </div>
                </CCol>


                {/* Notas Adicionales */}
                <CCol xs={12}>
                  <CFormLabel htmlFor="notas" style={{...formLabelStyle, marginTop: '15px'}}>
                    📝 Notas Adicionales (Opcional)
                  </CFormLabel>
                  <CFormTextarea
                    id="notas"
                    name="notas"
                    rows="4"
                    placeholder="Información adicional sobre el insumo, detalles de almacenamiento, etc."
                    value={formData.notas}
                    onChange={handleInputChange}
                    style={{...formInputStyle, resize: 'vertical'}}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor
                      e.target.style.outline = 'none'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                    }}
                  />
                </CCol>

                {/* Botones de Acción */}
                <CCol xs={12}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      justifyContent: 'flex-end',
                      marginTop: '30px',
                      paddingTop: '20px',
                      borderTop: '1px solid #e9ecef',
                    }}
                  >
                    {/* Botón Cancelar */}
                    <CButton
                      color="light"
                      onClick={handleCancel}
                      style={{
                        padding: '14px 30px',
                        fontWeight: '600',
                        borderRadius: '10px',
                        fontSize: '15px',
                        border: '1px solid #ddd',
                        color: '#444',
                        backgroundColor: 'white',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.target.style.backgroundColor = '#f1f1f1'; }}
                      onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; }}
                    >
                      Cancelar
                    </CButton>
                    {/* Botón Registrar Insumo */}
                    <CButton
                      type="submit"
                      style={{
                        padding: '14px 30px',
                        fontWeight: '700',
                        borderRadius: '12px',
                        fontSize: '15px',
                        background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(255, 102, 0, 0.4)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 20px rgba(255, 102, 0, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 15px rgba(255, 102, 0, 0.4)'
                      }}
                    >
                      ✅ Registrar Insumo
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

export default AgregarInsumos