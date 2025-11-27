import React, { useEffect, useState, useContext } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CAlert,
  CSpinner,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import AuthContext from "../context/AuthContext";
import {
  getCajaAbierta,
  abrirCaja as abrirCajaAPI,
  cerrarCaja as cerrarCajaAPI,
} from "../api/caja";
import { getMiEmpleado } from "../api/empleados";

const Caja = () => {
  const { token, user, roles } = useContext(AuthContext);
  
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [empleadoInfo, setEmpleadoInfo] = useState(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [saldoFinal, setSaldoFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [showResumenModal, setShowResumenModal] = useState(false);

  // Obtener empleadoId del usuario logueado o del empleadoInfo cargado
  const empleadoId = user?.empleadoId || empleadoInfo?.id || null;

  // -------------------------------
  // Obtener información del empleado
  // -------------------------------
  const fetchEmpleadoInfo = async () => {
    // Solo intentar obtener info si el usuario es Empleado o Administrador
    if (!roles?.includes("Empleado") && !roles?.includes("Administrador")) {
      return;
    }

    try {
      const empleado = await getMiEmpleado(token, user?.id);
      setEmpleadoInfo(empleado);
    } catch (err) {
      console.error("Error obteniendo información del empleado:", err);
      // No mostrar error al usuario, solo loguear
    }
  };

  // -------------------------------
  // Consultar caja abierta
  // -------------------------------
  const fetchCaja = async () => {
    try {
      setError(null);
      const data = await getCajaAbierta(token);
      setCajaAbierta(data);
    } catch (err) {
      console.error("Error consultando caja:", err);
      if (err.message !== "Error al obtener la caja abierta") {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    fetchCaja();
    fetchEmpleadoInfo();
  }, []);

  // -------------------------------
  // Abrir caja
  // -------------------------------
  const handleAbrirCaja = async () => {
    if (!saldoInicial || parseFloat(saldoInicial) < 0) {
      setError("Ingrese un saldo inicial válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await abrirCajaAPI(token, saldoInicial, empleadoId);
      setSuccess("✅ Caja abierta exitosamente");
      setSaldoInicial("");
      await fetchCaja();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al abrir la caja");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Cerrar caja
  // -------------------------------
  const handleCerrarCaja = async () => {
    if (!cajaAbierta) return;
    
    if (!saldoFinal || parseFloat(saldoFinal) < 0) {
      setError("Ingrese un saldo final válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const resumenData = await cerrarCajaAPI(token, cajaAbierta.id, saldoFinal);
      setResumen(resumenData);
      setSuccess("✅ Caja cerrada correctamente");
      setSaldoFinal("");
      setCajaAbierta(null);
      setShowResumenModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cerrar la caja");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Cerrar modal de resumen
  // -------------------------------
  const handleCloseResumen = () => {
    setShowResumenModal(false);
    setResumen(null);
  };

  return (
    <div className="container mt-4 fade-in" style={{ maxWidth: "800px" }}>
      <h2 className="text-center mb-4" style={{
        fontWeight: "800",
        fontSize: "32px",
        background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "36px" }}>💰</span>
        Gestión de Caja
      </h2>

      {/* Mensajes de error y éxito */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}

      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </CAlert>
      )}

      {/* Si NO hay caja abierta → mostrar abrir */}
      {!cajaAbierta && (
        <CCard className="shadow-sm mb-4 slide-in" style={{
          borderRadius: "20px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          <CCardHeader
            style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              color: "white",
              padding: "20px 24px",
              border: "none"
            }}
          >
            <h5 className="mb-0" style={{ fontWeight: "700", fontSize: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🏦</span>
              Abrir Caja
            </h5>
          </CCardHeader>

          <CCardBody style={{ backgroundColor: "white", padding: "28px" }}>
            {(empleadoInfo || user?.nombre) && (
              <div style={{
                background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
                padding: "14px 18px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid #93C5FD"
              }}>
                <div style={{ fontSize: "13px", color: "#1E40AF", fontWeight: "600" }}>
                  <span style={{ fontSize: "16px", marginRight: "8px" }}>👤</span>
                  Empleado: {empleadoInfo
                    ? `${empleadoInfo.nombre} ${empleadoInfo.apellidos}`
                    : user?.nombreUsuario || "No especificado"}
                </div>
              </div>
            )}

            <label className="form-label" style={{ fontWeight: "600", color: "#374151", fontSize: "14px", marginBottom: "10px" }}>
              Saldo Inicial <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <CFormInput
              type="number"
              step="0.01"
              min="0"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              placeholder="Ej: 500.00"
              className="mb-3"
              disabled={loading}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "2px solid #E5E7EB",
                fontSize: "15px",
                transition: "all 0.2s ease"
              }}
            />

            <CButton
              color="primary"
              className="w-100"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                border: "none",
                padding: "14px",
                fontWeight: "700",
                fontSize: "15px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                transition: "all 0.2s ease"
              }}
              onClick={handleAbrirCaja}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(59, 130, 246, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(59, 130, 246, 0.3)";
              }}
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Procesando...
                </>
              ) : (
                <>
                  <span style={{ fontSize: "18px", marginRight: "8px" }}>🔓</span>
                  Abrir Caja
                </>
              )}
            </CButton>
          </CCardBody>
        </CCard>
      )}

      {/* Si hay caja abierta → mostrar cerrar */}
      {cajaAbierta && (
        <CCard className="shadow-sm mb-4 slide-in" style={{
          borderRadius: "20px",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          <CCardHeader
            style={{
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              color: "white",
              padding: "20px 24px",
              border: "none"
            }}
          >
            <h5 className="mb-0" style={{ fontWeight: "700", fontSize: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🔒</span>
              Cerrar Caja
            </h5>
          </CCardHeader>

          <CCardBody style={{ backgroundColor: "white", padding: "28px" }}>
            <div className="alert alert-warning mb-3">
              <p className="mb-1">
                <strong>📅 Fecha:</strong>{" "}
                {new Date(cajaAbierta.fecha).toLocaleDateString("es-MX")}
              </p>
              <p className="mb-1">
                <strong>💵 Saldo inicial:</strong> $
                {cajaAbierta.saldoInicial.toFixed(2)}
              </p>
              {cajaAbierta.empleado && (
                <p className="mb-0">
                  <strong>👤 Empleado:</strong>{" "}
                  {cajaAbierta.empleado.nombre} {cajaAbierta.empleado.apellidos}
                </p>
              )}
            </div>

            <label className="form-label mt-2">
              Saldo Final <span className="text-danger">*</span>
            </label>
            <CFormInput
              type="number"
              step="0.01"
              min="0"
              value={saldoFinal}
              onChange={(e) => setSaldoFinal(e.target.value)}
              placeholder="Ej: 800.00"
              className="mb-3"
              disabled={loading}
            />

            <CButton
              color="danger"
              className="w-100"
              style={{
                background: "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                border: "none",
                padding: "12px",
                fontWeight: "600",
              }}
              onClick={handleCerrarCaja}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Procesando...
                </>
              ) : (
                "🔒 Cerrar Caja"
              )}
            </CButton>
          </CCardBody>
        </CCard>
      )}

      {/* Modal de Resumen de Caja */}
      <CModal
        visible={showResumenModal}
        onClose={handleCloseResumen}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>📊 Resumen de Caja</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {resumen && (
            <div>
              <div className="mb-4">
                <h5 className="border-bottom pb-2">Información General</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(resumen.fecha).toLocaleDateString("es-MX")}
                    </p>
                    <p>
                      <strong>Empleado:</strong>{" "}
                      {resumen.empleadoNombre || "No especificado"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Total de Ventas:</strong> {resumen.cantidadVentas}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">Resumen Financiero</h5>
                <CTable striped bordered hover responsive>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell>
                        <strong>Saldo Inicial</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        ${resumen.saldoInicial.toFixed(2)}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>
                        <strong>Total Ventas</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-end text-success">
                        + ${resumen.totalVentas.toFixed(2)}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>
                        <strong>Esperado</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        ${(resumen.saldoInicial + resumen.totalVentas).toFixed(2)}
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow className="table-primary">
                      <CTableDataCell>
                        <strong>Saldo Final (Real)</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <strong>${resumen.saldoFinal.toFixed(2)}</strong>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow
                      color={
                        resumen.saldoFinal ===
                        resumen.saldoInicial + resumen.totalVentas
                          ? "success"
                          : "warning"
                      }
                    >
                      <CTableDataCell>
                        <strong>Diferencia</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <strong>
                          $
                          {(
                            resumen.saldoFinal -
                            (resumen.saldoInicial + resumen.totalVentas)
                          ).toFixed(2)}
                        </strong>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>

              {resumen.ventasPorMetodoPago &&
                Object.keys(resumen.ventasPorMetodoPago).length > 0 && (
                  <div className="mb-3">
                    <h5 className="border-bottom pb-2">
                      Ventas por Método de Pago
                    </h5>
                    <CTable striped bordered hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Método de Pago</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">
                            Total
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {Object.entries(resumen.ventasPorMetodoPago).map(
                          ([metodo, total]) => (
                            <CTableRow key={metodo}>
                              <CTableDataCell>
                                {metodo === "Efectivo" && "💵 Efectivo"}
                                {metodo === "Tarjeta" && "💳 Tarjeta"}
                                {metodo === "Transferencia" && "🏦 Transferencia"}
                                {!["Efectivo", "Tarjeta", "Transferencia"].includes(
                                  metodo
                                ) && metodo}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                ${total.toFixed(2)}
                              </CTableDataCell>
                            </CTableRow>
                          )
                        )}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseResumen}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Caja;
