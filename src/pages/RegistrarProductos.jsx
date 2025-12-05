import React, { useState } from "react"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
  CFormCheck
} from "@coreui/react"
import callApi from "../utils/apiProxy"

const RegistrarProductos = () => {
  const initialFormState = {
    nombre: "",
    descripcion: "",
    tipo: "",
    precio: "",
    almacenable: false,
    imagenUrl: ""
  }

  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      // Preparar datos (convertir precio a número, imagenUrl null si está vacío)
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        precio: parseFloat(formData.precio),
        almacenable: formData.almacenable,
        imagenUrl: formData.imagenUrl.trim() === "" ? null : formData.imagenUrl
      }

      const res = await callApi('/api/Productos', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Error al registrar producto")
      }

      alert("✅ Producto registrado correctamente")
      setFormData(initialFormState)

    } catch (err) {
      console.error(err)
      alert(`❌ Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ============================
  // Estilos globales del diseño
  // ============================
  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    transition: "0.25s",
  }

  const inputFocus = (e) => (e.target.style.borderColor = "#FF6600")
  const inputBlur = (e) => (e.target.style.borderColor = "#E5E7EB")

  return (
    <div
      className="page-container"
      style={{
        background: "#F3F4F6",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        margin: 0
      }}
    >
      <CCard
        className="shadow-lg fade-in"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "none"
        }}
      >
        <CCardHeader
          style={{
            background: "white",
            borderBottom: "3px solid #FF6600",
            padding: "20px 30px"
          }}
        >
          <h3 className="mb-0" style={{ fontWeight: "700", color: "#1A1C20" }}>
            🍕 Registrar Nuevo Producto
          </h3>
          <p className="mb-0 mt-2" style={{ color: "#6B7280", fontSize: "14px" }}>
            Agrega pizzas, bebidas y más productos al menú
          </p>
        </CCardHeader>

        <CCardBody style={{ backgroundColor: "#ffffff", padding: "35px" }}>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-4">

              {/* Nombre del Producto */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Nombre del Producto *
                </CFormLabel>
                <CFormInput
                  name="nombre"
                  placeholder="Ej: Pizza Pepperoni Grande"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </CCol>

              {/* Tipo de Producto */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Tipo de Producto *
                </CFormLabel>
                <CFormSelect
                  name="tipo"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione tipo...</option>
                  <option value="Pizza">🍕 Pizza</option>
                  <option value="Bebida">🥤 Bebida</option>
                  <option value="Postre">🍰 Postre</option>
                  <option value="Entrada">🍟 Entrada</option>
                  <option value="Complemento">🧀 Complemento</option>
                  <option value="Otro">📦 Otro</option>
                </CFormSelect>
              </CCol>

              {/* Descripción */}
              <CCol xs={12}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Descripción *
                </CFormLabel>
                <CFormTextarea
                  rows={3}
                  name="descripcion"
                  placeholder="Ej: Pizza de 40cm con pepperoni premium y queso mozzarella"
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                />
              </CCol>

              {/* Precio */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Precio (MXN) *
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio"
                  placeholder="180.00"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                />
              </CCol>

              {/* URL de Imagen */}
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  URL de Imagen (Opcional)
                </CFormLabel>
                <CFormInput
                  name="imagenUrl"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.imagenUrl}
                  onChange={handleInputChange}
                />
              </CCol>

              {/* Almacenable */}
              <CCol xs={12}>
                <div
                  style={{
                    padding: "20px",
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    border: "2px solid #E5E7EB"
                  }}
                >
                  <CFormCheck
                    id="almacenable"
                    name="almacenable"
                    checked={formData.almacenable}
                    onChange={handleInputChange}
                    label={
                      <span style={{ fontWeight: "600", color: "#374151" }}>
                        📦 ¿Es un producto almacenable?
                      </span>
                    }
                  />
                  <small style={{ color: "#6B7280", display: "block", marginTop: "8px" }}>
                    Marca esta opción si el producto requiere control de inventario (ej: bebidas embotelladas).
                    Las pizzas generalmente NO son almacenables.
                  </small>
                </div>
              </CCol>

              {/* Botones */}
              <CCol xs={12}>
                <hr style={{ margin: "20px 0", border: "1px solid #E5E7EB" }} />
              </CCol>

              <CCol xs={12} className="d-flex justify-content-end gap-3">
                <CButton
                  type="button"
                  onClick={() => setFormData(initialFormState)}
                  disabled={loading}
                  style={{
                    padding: "14px 28px",
                    fontWeight: "600",
                    background: "white",
                    border: "2px solid #E5E7EB",
                    color: "#6B7280",
                    borderRadius: "12px",
                    transition: "0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#9CA3AF"
                    e.target.style.color = "#374151"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#E5E7EB"
                    e.target.style.color = "#6B7280"
                  }}
                >
                  🔄 Limpiar
                </CButton>

                <CButton
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "14px 28px",
                    fontWeight: "700",
                    background: loading 
                      ? "#9CA3AF" 
                      : "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.3)",
                    transition: "0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = "translateY(-2px)"
                      e.target.style.boxShadow = "0 10px 15px -3px rgba(255, 102, 0, 0.4)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)"
                    e.target.style.boxShadow = "0 4px 6px -1px rgba(255, 102, 0, 0.3)"
                  }}
                >
                  {loading ? "⏳ Registrando..." : "✅ Registrar Producto"}
                </CButton>
              </CCol>

            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {/* Preview del producto */}
      {formData.nombre && (
        <CCard
          className="mt-4 shadow-lg"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "none"
          }}
        >
          <CCardHeader
            style={{
              background: "white",
              borderBottom: "3px solid #10B981",
              padding: "20px 30px"
            }}
          >
            <h4 className="mb-0" style={{ fontWeight: "700", color: "#1A1C20" }}>
              👁️ Vista Previa
            </h4>
          </CCardHeader>
          <CCardBody style={{ backgroundColor: "#ffffff", padding: "35px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "20px",
                alignItems: "start"
              }}
            >
              {/* Imagen placeholder */}
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  background: formData.imagenUrl 
                    ? `url(${formData.imagenUrl}) center/cover` 
                    : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9CA3AF",
                  fontSize: "48px"
                }}
              >
                {!formData.imagenUrl && "🍕"}
              </div>

              {/* Info del producto */}
              <div>
                <h3 style={{ fontWeight: "700", color: "#1A1C20", marginBottom: "8px" }}>
                  {formData.nombre || "Nombre del producto"}
                </h3>
                <p style={{ color: "#6B7280", marginBottom: "12px" }}>
                  {formData.descripcion || "Descripción del producto"}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {formData.tipo && (
                    <span
                      style={{
                        padding: "6px 12px",
                        background: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      {formData.tipo}
                    </span>
                  )}
                  {formData.precio && (
                    <span
                      style={{
                        padding: "6px 12px",
                        background: "#D1FAE5",
                        color: "#065F46",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      ${parseFloat(formData.precio).toFixed(2)} MXN
                    </span>
                  )}
                  <span
                    style={{
                      padding: "6px 12px",
                      background: formData.almacenable ? "#DBEAFE" : "#FEE2E2",
                      color: formData.almacenable ? "#1E40AF" : "#991B1B",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    {formData.almacenable ? "📦 Almacenable" : "🍕 No almacenable"}
                  </span>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default RegistrarProductos