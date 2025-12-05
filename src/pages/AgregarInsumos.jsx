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
} from '@coreui/react'
import { API_BASE_URL } from '../config/api'

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
      case "kg": return "Kg";
      case "g": return "g";
      case "litros": return "L";
      case "ml": return "ml";
      case "unidades":
      case "piezas":
      case "cajas":
      case "paquetes":
        return "Uds";
      default:
        return "Uds";
    }
  }

  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // 🔍 Función para decodificar y ver el token
  const verificarToken = () => {
    const token = localStorage.getItem("token");
    const roles = localStorage.getItem("roles");
    
    if (!token) {
      alert("❌ No hay token");
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("📋 Contenido completo del token:", payload);
      console.log("🔑 Roles en localStorage:", roles);
      
      // Buscar el claim de rol (puede tener diferentes nombres)
      const roleClaim = payload.role || 
                       payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                       payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];
      
      alert(`🔍 DIAGNÓSTICO DEL TOKEN:\n\n` +
            `Roles en el token JWT: ${roleClaim || 'NO ENCONTRADO ❌'}\n\n` +
            `Roles en localStorage: ${roles}\n\n` +
            `Usuario ID: ${payload.nameid || payload.sub || 'N/A'}\n\n` +
            `El problema es: ${!roleClaim ? 'El token NO contiene roles. Necesitas regenerar el token.' : 'El token SÍ tiene roles ✅'}`);
    } catch (error) {
      console.error("Error al decodificar:", error);
      alert("❌ Error al decodificar el token");
    }
  };

  // 🔧 Función para cambiar rol a Administrador (solo para pruebas)
  const cambiarAAdministrador = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ No hay token");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.nameid || payload.sub || payload["http://schemas.xmlsoap.org/ws/2008/06/identity/claims/nameidentifier"];

      if (!userId) {
        alert("❌ No se pudo obtener el ID de usuario del token");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/cambiar-rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          usuarioId: parseInt(userId),
          nuevoRol: "Administrador"
        })
      });

      if (!response.ok) {
        const error = await response.text();
        alert(`❌ Error: ${error}`);
        return;
      }

      const result = await response.json();
      alert(`✅ ${result.message}\n\n⚠️ IMPORTANTE: Debes cerrar sesión y volver a iniciar sesión para que el nuevo rol se aplique al token.`);
      
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al cambiar el rol");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠️ No hay token de autenticación. Por favor inicia sesión.");
      return;
    }

    // Verificar roles en el token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roleClaim = payload.role || 
                       payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                       payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];
      
      console.log("🔍 Verificando token antes de enviar:");
      console.log("  - Roles:", roleClaim);
      console.log("  - Usuario ID:", payload.nameid || payload.sub);
      console.log("  - Expira:", new Date(payload.exp * 1000));
      
      if (!roleClaim || (roleClaim !== "Administrador" && roleClaim !== "Empleado")) {
        alert(`⚠️ ADVERTENCIA: Tu token tiene rol "${roleClaim || 'ninguno'}"\n\nPara crear insumos necesitas ser "Administrador" o "Empleado".\n\n¿Quieres intentarlo de todas formas?`);
      }
    } catch (err) {
      console.error("Error al verificar token:", err);
    }

    if (!formData.nombre || !formData.cantidad || !formData.unidad) {
      alert("Completa los campos obligatorios: Nombre, Cantidad y Unidad");
      return;
    }

    // Convertir la unidad a la forma correcta
    const unidadTexto = convertirUnidad(formData.unidad);

    // Validar y limpiar la cantidad
    let cantidadLimpia = parseFloat(formData.cantidad);
    if (isNaN(cantidadLimpia) || cantidadLimpia < 0) {
      alert("⚠️ La cantidad debe ser un número válido mayor o igual a 0");
      return;
    }
    // Redondear a 2 decimales para coincidir con decimal(10,2) de la BD
    cantidadLimpia = Math.round(cantidadLimpia * 100) / 100;

    // Crear el objeto con el formato exacto que espera el DTO de C#
    // IMPORTANTE: Las propiedades deben estar en PascalCase (primera letra mayúscula)
    const data = {
      Nombre: formData.nombre.trim(),
      UnidadMedida: unidadTexto,
      StockInicial: cantidadLimpia,
      StockMinimo: 10
    };

    console.log("📤 Enviando datos:", data);
    console.log("🔑 Token (primeros 20 chars):", token.substring(0, 20) + "...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/Insumos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      console.log("📥 Status de respuesta:", response.status);

      if (!response.ok) {
        // Clonar la respuesta para poder leerla múltiples veces
        const responseClone = response.clone();
        let errorMessage = `Error ${response.status}`;
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          console.error("❌ Error del servidor (JSON):", errorData);
          
          // Extraer información detallada del error
          if (errorData.errors) {
            // Errores de validación de ModelState
            errorDetails = Object.entries(errorData.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
              .join('\n');
            errorMessage = errorData.title || 'Error de validación';
          } else {
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
          }
        } catch {
          try {
            const errorText = await responseClone.text();
            console.error("❌ Error (texto):", errorText);
            errorMessage = errorText || errorMessage;
          } catch (err) {
            console.error("❌ No se pudo leer el error:", err);
          }
        }

        if (response.status === 403) {
          alert(`🚫 Error 403: Acceso denegado\n\nTu token no tiene el rol "Administrador" o "Empleado" necesario.\n\nPor favor verifica con el administrador del sistema.`);
        } else if (response.status === 401) {
          alert(`🔒 Error 401: No autorizado\n\nTu sesión puede haber expirado. Por favor inicia sesión nuevamente.`);
        } else if (response.status === 400 && errorDetails) {
          alert(`❌ Error de validación:\n\n${errorDetails}`);
        } else {
          alert(`❌ Error ${response.status}: ${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
        }
        return;
      }

      const resultado = await response.json();
      console.log("✅ Insumo creado:", resultado);
      
      alert(`✅ Insumo registrado correctamente!\n\nID: ${resultado.id}\nNombre: ${resultado.nombre}\nStock: ${resultado.stockActual} ${resultado.unidadMedida}`);
      
      // Resetear formulario
      setFormData({
        nombre: "",
        cantidad: "",
        unidad: "",
        proveedor: "",
        caducidad: "",
        costo: "",
        tipoIcono: "emoji",
        imagen: "",
        color: "primary",
        notas: ""
      });

    } catch (error) {
      console.error("💥 Error en POST:", error);
      alert("Error al conectar con el servidor. Revisa la consola para más detalles.");
    }
  }

  const handleCancel = () => {
    if (window.confirm("¿Deseas cancelar y limpiar el formulario?")) {
      setFormData({
        nombre: "",
        cantidad: "",
        unidad: "",
        proveedor: "",
        caducidad: "",
        costo: "",
        tipoIcono: "emoji",
        imagen: "",
        color: "primary",
        notas: ""
      });
    }
  }

  // Estilos base
  const formInputStyle = {
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }

  const formLabelStyle = {
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#555',
    marginBottom: '8px',
  }

  const primaryColor = '#FF6600';

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
                  <div style={{ 
            marginTop: '12px', 
            padding: '8px 12px', 
            background: '#fff3cd', 
            borderRadius: '8px',
            fontSize: '13px',
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>🔧 <strong>Modo Diagnóstico:</strong> Verifica tu token</span>
            <button
              type="button"
              onClick={verificarToken}
              style={{
                padding: '4px 12px',
                background: '#FF6600',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔍 Ver Token
            </button>
          </div>
        </div>

        {/* Formulario */}
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
                {/* Información Básica */}
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

                {/* Nombre */}
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
                    required
                    style={formInputStyle}
                  />
                </CCol>

                {/* Cantidad */}
                <CCol md={3}>
                  <CFormLabel htmlFor="cantidad" style={formLabelStyle}>
                    Cantidad *
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    step="0.01"
                    id="cantidad"
                    name="cantidad"
                    placeholder="Ej: 50"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    required
                    style={{...formInputStyle, fontWeight: '600'}}
                  />
                </CCol>

                {/* Unidad */}
                <CCol md={3}>
                  <CFormLabel htmlFor="unidad" style={formLabelStyle}>
                    Unidad *
                  </CFormLabel>
                  <CFormSelect
                    id="unidad"
                    name="unidad"
                    value={formData.unidad}
                    onChange={handleInputChange}
                    required
                    style={{...formInputStyle, fontWeight: '600', cursor: 'pointer'}}
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

                {/* Vista Previa */}
                <CCol xs={12}>
                  <CFormLabel style={{...formLabelStyle, marginTop: '15px'}}>
                    👁️ Vista Previa del Insumo
                  </CFormLabel>
                  <div
                    style={{
                      padding: '25px',
                      borderRadius: '16px',
                      background: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      border: '2px dashed #dee2e6',
                    }}
                  >
                    <div style={{ 
                      fontSize: '48px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      backgroundColor: '#FF6600',
                      boxShadow: '0 4px 8px rgba(255, 102, 0, 0.3)',
                    }}>
                      <span style={{ filter: 'grayscale(0.1)' }}>📦</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '22px', color: '#333', marginBottom: '4px' }}>
                        {formData.nombre || 'Nombre del Insumo'}
                      </div>
                      <div style={{ color: '#555', fontSize: '16px', fontWeight: '500' }}>
                        {formData.cantidad && formData.unidad
                          ? `Stock Inicial: ${formData.cantidad} ${convertirUnidad(formData.unidad)}`
                          : 'Ingresa cantidad y unidad'}
                      </div>
                    </div>
                  </div>
                </CCol>

                {/* Botones */}
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
                    <CButton
                      type="button"
                      color="light"
                      onClick={handleCancel}
                      style={{
                        padding: '14px 30px',
                        fontWeight: '600',
                        borderRadius: '10px',
                        fontSize: '15px',
                        border: '1px solid #ddd',
                        color: '#444',
                      }}
                    >
                      Cancelar
                    </CButton>
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