import React, { useState, useContext } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import AuthContext from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import logo from "../media/img/logo.jpg";

const Login = () => {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    usuario: "",
    contraseña: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.usuario,
          password: form.contraseña
        }),
      });

      if (!response.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data = await response.json();
      login(data.accessToken, data.usuario, data.roles);
      // El cambio de token en el contexto hará que App.jsx renderice DefaultLayout

    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <div
      className="d-flex flex-row align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #1A1C20 0%, #2D3748 50%, #1F2937 100%)",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(255, 102, 0, 0.1)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "rgba(255, 133, 51, 0.08)",
          filter: "blur(100px)",
        }}
      />

      <CContainer fluid="md" style={{ maxWidth: "500px" }}>
        <CRow className="justify-content-center">
          <CCol xs={12}>
            <CCard
              className="shadow-lg fade-in"
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CCardBody className="p-5">
                <div className="text-center mb-4">
                  <div
                    style={{
                      width: "140px",
                      height: "140px",
                      margin: "0 auto 24px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: "-8px",
                        background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                        borderRadius: "50%",
                        opacity: 0.2,
                        filter: "blur(20px)",
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    />
                    <img
                      src={logo}
                      alt="Logo PizzaHub"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "4px solid #FF6600",
                        boxShadow: "0 10px 25px rgba(255, 102, 0, 0.4)",
                        position: "relative",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                  <h2 style={{ 
                    color: "#1F2937", 
                    fontWeight: "800",
                    fontSize: "28px",
                    marginBottom: "8px",
                  }}>
                    ¡Bienvenido! 
                  </h2>
                  <p style={{ 
                    color: "#6B7280", 
                    fontSize: "15px",
                    fontWeight: "500",
                  }}>
                    Inicia sesión para acceder al panel
                  </p>
                </div>

                <CForm onSubmit={handleLogin}>
                  <CInputGroup className="mb-3">
                    <CInputGroupText
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderColor: "#E5E7EB",
                        border: "2px solid #E5E7EB",
                        borderRight: "none",
                        borderRadius: "12px 0 0 12px",
                      }}
                    >
                      <CIcon icon={cilUser} style={{ color: "#FF6600" }} />
                    </CInputGroupText>
                    <CFormInput
                      name="usuario"
                      placeholder="Correo electrónico"
                      autoComplete="username"
                      value={form.usuario}
                      onChange={handleChange}
                      style={{
                        borderColor: "#E5E7EB",
                        border: "2px solid #E5E7EB",
                        borderLeft: "none",
                        borderRadius: "0 12px 12px 0",
                        padding: "12px 16px",
                        fontSize: "15px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF6600";
                        e.target.previousSibling.style.borderColor = "#FF6600";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E7EB";
                        e.target.previousSibling.style.borderColor = "#E5E7EB";
                      }}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderColor: "#E5E7EB",
                        border: "2px solid #E5E7EB",
                        borderRight: "none",
                        borderRadius: "12px 0 0 12px",
                      }}
                    >
                      <CIcon icon={cilLockLocked} style={{ color: "#FF6600" }} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      name="contraseña"
                      placeholder="Contraseña"
                      autoComplete="current-password"
                      value={form.contraseña}
                      onChange={handleChange}
                      style={{
                        borderColor: "#E5E7EB",
                        border: "2px solid #E5E7EB",
                        borderLeft: "none",
                        borderRadius: "0 12px 12px 0",
                        padding: "12px 16px",
                        fontSize: "15px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF6600";
                        e.target.previousSibling.style.borderColor = "#FF6600";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#E5E7EB";
                        e.target.previousSibling.style.borderColor = "#E5E7EB";
                      }}
                    />
                  </CInputGroup>

                  <CButton
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                      border: "none",
                      width: "100%",
                      padding: "14px",
                      fontSize: "16px",
                      fontWeight: "700",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.3)",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 10px 15px -3px rgba(255, 102, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 6px -1px rgba(255, 102, 0, 0.3)";
                    }}
                  >
                     Iniciar Sesión
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;