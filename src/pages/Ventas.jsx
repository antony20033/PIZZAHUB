import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CBadge,
  CSpinner,
  CAlert
} from "@coreui/react";
import { API_BASE_URL } from "../config/api";

const Ventas = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedidoIdFromUrl = searchParams.get("pedidoId");

  const [ventas, setVentas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("todas");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  
  const [nuevaVenta, setNuevaVenta] = useState({
    cajaId: "",
    pedidoId: "",
    empleadoId: "",
    metodoPago: 1,
    total: 0
  });

  const token = localStorage.getItem("token");

  // -------------------------------
  // CARGAR VENTAS
  // -------------------------------
  const fetchVentas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/Ventas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error al obtener ventas");

      const data = await response.json();
      setVentas(data);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      alert("Error al cargar ventas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // CARGAR PEDIDOS ENTREGADOS
  // -------------------------------
  const fetchPedidos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/PedidosNew`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      // Filtrar pedidos entregados (estado 3)
      const pedidosEntregados = data.filter(p => {
        const estado = typeof p.estado === 'string' ? parseInt(p.estado) : p.estado;
        return estado === 3;
      });
      console.log("Pedidos entregados:", pedidosEntregados);
      setPedidos(pedidosEntregados);
      return pedidosEntregados;
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      return [];
    }
  };

  // -------------------------------
  // CARGAR CAJA ABIERTA
  // -------------------------------
  const fetchCajas = async () => {
    try {
      const responseAbierta = await fetch(`${API_BASE_URL}/api/Caja/abierta`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (responseAbierta.ok) {
        const caja = await responseAbierta.json();
        console.log("Caja abierta encontrada:", caja);
        setCajas([caja]);
        return [caja];
      }

      console.log("No hay caja abierta, intentando listar todas...");
      const responseAll = await fetch(`${API_BASE_URL}/api/Caja`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!responseAll.ok) {
        throw new Error("Error al obtener cajas");
      }

      const data = await responseAll.json();
      console.log("Todas las cajas:", data);
      
      const cajasAbiertas = data.filter(c => c.estado === 1);
      console.log("Cajas filtradas (estado=1):", cajasAbiertas);
      setCajas(cajasAbiertas);
      return cajasAbiertas;

    } catch (error) {
      console.error("Error cargando caja:", error);
      setCajas([]);
      return [];
    }
  };

  // -------------------------------
  // CARGAR DATOS Y VERIFICAR PEDIDO DE URL
  // -------------------------------
useEffect(() => {
  const cargarDatos = async () => {
    console.log("🔍 Iniciando carga de datos...");
    console.log("📋 Parámetro pedidoId de URL:", pedidoIdFromUrl);
    
    await fetchVentas();
    const pedidosData = await fetchPedidos();
    const cajasData = await fetchCajas();

    console.log("📦 Pedidos cargados:", pedidosData.length);
    console.log("🏦 Cajas cargadas:", cajasData.length);

    // Si hay pedidoId en la URL, abrir modal con datos precargados
    if (pedidoIdFromUrl && pedidosData.length > 0) {
      const pedidoIdNum = parseInt(pedidoIdFromUrl);
      console.log("🔍 Buscando pedido con ID:", pedidoIdNum);
      
      const pedido = pedidosData.find(p => p.id === pedidoIdNum);
      
      if (pedido) {
        console.log("✅ Pedido encontrado:", pedido);
        setPedidoSeleccionado(pedido);
        
        // Obtener empleadoId de la caja si existe
        const empleadoIdCaja = cajasData.length > 0 && cajasData[0].empleado 
          ? cajasData[0].empleado.id.toString() 
          : "";

        console.log("👤 Empleado ID de caja:", empleadoIdCaja);
        
        // Precargar datos en el formulario
        const datosVenta = {
          cajaId: cajasData.length > 0 ? cajasData[0].id.toString() : "",
          pedidoId: pedido.id.toString(),
          empleadoId: empleadoIdCaja,
          metodoPago: 1,
          total: pedido.total
        };

        console.log("📝 Precargando formulario con:", datosVenta);
        setNuevaVenta(datosVenta);
        
        // Abrir el modal después de un pequeño delay para asegurar que todo se renderice
        setTimeout(() => {
          console.log("🎬 Abriendo modal...");
          setModalVisible(true);
        }, 100);
        
      } else {
        console.error("❌ Pedido no encontrado en la lista de entregados");
        console.log("IDs disponibles:", pedidosData.map(p => p.id));
        alert(`⚠️ El pedido #${pedidoIdFromUrl} no existe o no está en estado Entregado`);
        // Limpiar el parámetro de la URL
        navigate("/ventas", { replace: true });
      }
    } else if (pedidoIdFromUrl && pedidosData.length === 0) {
      console.warn("⚠️ Se recibió pedidoId pero no hay pedidos entregados");
      alert("⚠️ No hay pedidos entregados disponibles");
      navigate("/ventas", { replace: true });
    }
  };

  cargarDatos();
}, [pedidoIdFromUrl, navigate]); // Agregar navigate como dependencia
  // -------------------------------
  // ABRIR CAJA MANUALMENTE
  // -------------------------------
  const abrirCajaManual = async () => {
    const empleadoId = prompt("Ingresa el ID del empleado para abrir la caja:");
    if (!empleadoId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/Caja/abrir`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          empleadoId: parseInt(empleadoId),
          saldoInicial: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al abrir caja");
      }

      alert("✅ Caja abierta exitosamente");
      fetchCajas();
    } catch (error) {
      console.error("Error abriendo caja:", error);
      alert("❌ Error: " + error.message);
    }
  };

  // -------------------------------
  // REGISTRAR VENTA
  // -------------------------------
  const registrarVenta = async () => {
    if (!nuevaVenta.cajaId || !nuevaVenta.pedidoId || !nuevaVenta.empleadoId) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const dataToSend = {
        cajaId: parseInt(nuevaVenta.cajaId),
        pedidoId: parseInt(nuevaVenta.pedidoId),
        empleadoId: parseInt(nuevaVenta.empleadoId),
        metodoPago: parseInt(nuevaVenta.metodoPago),
        total: parseFloat(nuevaVenta.total)
      };

      console.log("Enviando venta:", dataToSend);

      const response = await fetch(`${API_BASE_URL}/api/Ventas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.message || "Error registrando venta");
      }

      alert("✅ Venta registrada exitosamente");
      setModalVisible(false);
      setPedidoSeleccionado(null);
      setNuevaVenta({
        cajaId: "",
        pedidoId: "",
        empleadoId: "",
        metodoPago: 1,
        total: 0
      });
      
      // Limpiar URL si venía con pedidoId
      if (pedidoIdFromUrl) {
        navigate("/ventas", { replace: true });
      }
      
      fetchVentas();
      fetchPedidos();
    } catch (error) {
      console.error("Error registrando venta:", error);
      alert("❌ Error: " + error.message);
    }
  };

  // -------------------------------
  // OBTENER BADGE DE MÉTODO DE PAGO
  // -------------------------------
  const getMetodoPagoBadge = (metodo) => {
    const metodos = {
      1: { color: "success", icon: "💵", text: "Efectivo" },
      2: { color: "primary", icon: "💳", text: "Tarjeta" },
      3: { color: "info", icon: "🏦", text: "Transferencia" }
    };
    return metodos[metodo] || { color: "secondary", icon: "❓", text: "Desconocido" };
  };

  // -------------------------------
  // FILTRAR VENTAS POR FECHA
  // -------------------------------
  const ventasFiltradas = ventas.filter(v => {
    if (filtroFecha === "todas") return true;
    
    const fechaVenta = new Date(v.fechaVenta);
    const hoy = new Date();
    
    if (filtroFecha === "hoy") {
      return fechaVenta.toDateString() === hoy.toDateString();
    } else if (filtroFecha === "semana") {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - 7);
      return fechaVenta >= inicioSemana;
    } else if (filtroFecha === "mes") {
      return fechaVenta.getMonth() === hoy.getMonth() && 
             fechaVenta.getFullYear() === hoy.getFullYear();
    }
    return true;
  });

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);

  const handlePedidoChange = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === parseInt(pedidoId));
    if (pedido) {
      setPedidoSeleccionado(pedido);
      setNuevaVenta({
        ...nuevaVenta,
        pedidoId: pedidoId,
        total: pedido.total
      });
    }
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setPedidoSeleccionado(null);
    setNuevaVenta({
      cajaId: "",
      pedidoId: "",
      empleadoId: "",
      metodoPago: 1,
      total: 0
    });
    
    // Limpiar URL si venía con pedidoId
    if (pedidoIdFromUrl) {
      navigate("/ventas", { replace: true });
    }
  };

  // Estilos
  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    transition: "0.25s",
  };

  const inputFocus = (e) => (e.target.style.borderColor = "#FF6600");
  const inputBlur = (e) => (e.target.style.borderColor = "#E5E7EB");

  return (
    <div style={{ padding: "20px", background: "#F3F4F6", minHeight: "100vh" }}>
      
      {/* Header Card */}
      <CCard className="shadow-lg mb-4" style={{ borderRadius: "20px", border: "none" }}>
        <CCardHeader style={{
          background: "white",
          borderBottom: "3px solid #FF6600",
          padding: "20px 30px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div>
              <h3 className="mb-0" style={{ fontWeight: "700", color: "#1A1C20" }}>
                💰 Gestión de Ventas
              </h3>
              <p className="mb-0 mt-1" style={{ color: "#6B7280", fontSize: "14px" }}>
                Registra y monitorea todas las transacciones
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {cajas.length === 0 && (
                <CButton
                  onClick={abrirCajaManual}
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontWeight: "700",
                    color: "white",
                    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  🏦 Abrir Caja
                </CButton>
              )}
              <CButton
                onClick={() => setModalVisible(true)}
                disabled={cajas.length === 0}
                style={{
                  background: cajas.length === 0 
                    ? "#9CA3AF" 
                    : "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontWeight: "700",
                  color: "white",
                  boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.3)",
                  cursor: cajas.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                ➕ Nueva Venta
              </CButton>
            </div>
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: "20px 30px" }}>
          {/* Filtros y Resumen */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "20px"
          }}>
            {/* Alerta si no hay caja abierta */}
            {cajas.length === 0 && (
              <div style={{
                width: "100%",
                padding: "16px 20px",
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                borderRadius: "12px",
                border: "2px solid #F59E0B",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "15px"
              }}>
                <span style={{ fontSize: "24px" }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: "#92400E", fontWeight: "700" }}>
                    No hay caja abierta
                  </strong>
                  <p style={{ margin: "4px 0 0 0", color: "#78350F", fontSize: "14px" }}>
                    Debes abrir una caja antes de registrar ventas. Haz clic en "Abrir Caja" arriba.
                  </p>
                </div>
              </div>
            )}

            {/* Alerta si se viene de un pedido */}
            {pedidoIdFromUrl && pedidoSeleccionado && (
              <CAlert color="info" style={{ width: "100%", marginBottom: "15px" }}>
                <strong>📦 Pedido #{pedidoIdFromUrl} seleccionado</strong>
                <p className="mb-0 mt-1">
                  Total: ${pedidoSeleccionado.total.toFixed(2)} - Cliente: {pedidoSeleccionado.clienteNombre || "Mostrador"}
                </p>
              </CAlert>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["todas", "hoy", "semana", "mes"].map(filtro => (
                <CButton
                  key={filtro}
                  onClick={() => setFiltroFecha(filtro)}
                  style={{
                    background: filtroFecha === filtro
                      ? "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)"
                      : "white",
                    color: filtroFecha === filtro ? "white" : "#6B7280",
                    border: filtroFecha === filtro ? "none" : "2px solid #E5E7EB",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {filtro === "todas" && "📋 Todas"}
                  {filtro === "hoy" && "📅 Hoy"}
                  {filtro === "semana" && "📆 Semana"}
                  {filtro === "mes" && "📊 Mes"}
                </CButton>
              ))}
            </div>

            <div style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              padding: "12px 24px",
              borderRadius: "12px",
              textAlign: "center",
            }}>
              <div style={{ color: "white", fontSize: "12px", opacity: 0.9 }}>
                Total Ventas
              </div>
              <div style={{ color: "white", fontSize: "24px", fontWeight: "900", marginTop: "4px" }}>
                ${totalVentas.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Tabla de Ventas */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <CSpinner color="primary" />
              <p className="mt-3" style={{ color: "#6B7280" }}>Cargando ventas...</p>
            </div>
          ) : ventasFiltradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <h5 style={{ color: "#6B7280" }}>No hay ventas registradas</h5>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Pedido</CTableHeaderCell>
                    <CTableHeaderCell>Caja</CTableHeaderCell>
                    <CTableHeaderCell>Empleado</CTableHeaderCell>
                    <CTableHeaderCell>Método Pago</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {ventasFiltradas.map((v) => {
                    const metodo = getMetodoPagoBadge(v.metodoPago);
                    return (
                      <CTableRow key={v.id}>
                        <CTableDataCell style={{ fontWeight: "700" }}>#{v.id}</CTableDataCell>
                        <CTableDataCell>
                          {new Date(v.fechaVenta).toLocaleString()}
                        </CTableDataCell>
                        <CTableDataCell>#{v.pedidoId}</CTableDataCell>
                        <CTableDataCell>#{v.cajaId}</CTableDataCell>
                        <CTableDataCell>
                          {v.empleado ? `${v.empleado.nombre} ${v.empleado.apellidos}` : "N/A"}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={metodo.color}>
                            {metodo.icon} {metodo.text}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell style={{ fontWeight: "700", color: "#10B981" }}>
                          ${v.total.toFixed(2)}
                        </CTableDataCell>
                      </CTableRow>
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Nueva Venta */}
      <CModal visible={modalVisible} onClose={handleCerrarModal} size="lg">
        <CModalHeader>
          <CModalTitle style={{ fontWeight: "700", color: "#1A1C20" }}>
            📝 Registrar Nueva Venta
            {pedidoSeleccionado && (
              <CBadge color="info" className="ms-2">
                Pedido #{pedidoSeleccionado.id}
              </CBadge>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {pedidoSeleccionado && (
            <CAlert color="success" className="mb-3">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>📦 Detalles del Pedido</strong>
                  <p className="mb-0 mt-1">
                    Cliente: {pedidoSeleccionado.clienteNombre || "Mostrador"}
                  </p>
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>
                  ${pedidoSeleccionado.total.toFixed(2)}
                </div>
              </div>
            </CAlert>
          )}

          <CForm>
            <CRow className="g-3">
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600" }}>🏦 Caja *</CFormLabel>
                <CFormSelect
                  value={nuevaVenta.cajaId}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, cajaId: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                >
                  <option value="">Seleccionar caja...</option>
                  {cajas.map(c => (
                    <option key={c.id} value={c.id}>
                      Caja #{c.id} - {c.empleado?.nombre || "Sin empleado"}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600" }}>📦 Pedido Entregado *</CFormLabel>
                <CFormSelect
                  value={nuevaVenta.pedidoId}
                  onChange={(e) => handlePedidoChange(e.target.value)}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  disabled={!!pedidoIdFromUrl}
                >
                  <option value="">Seleccionar pedido...</option>
                  {pedidos.map(p => (
                    <option key={p.id} value={p.id}>
                      Pedido #{p.id} - ${p.total.toFixed(2)}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600" }}>👤 ID Empleado *</CFormLabel>
                <CFormInput
                  type="number"
                  value={nuevaVenta.empleadoId}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, empleadoId: e.target.value })}
                  placeholder="ID del empleado"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600" }}>💳 Método de Pago *</CFormLabel>
                <CFormSelect
                  value={nuevaVenta.metodoPago}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, metodoPago: e.target.value })}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                >
                  <option value="1">💵 Efectivo</option>
                  <option value="2">💳 Tarjeta</option>
                  <option value="3">🏦 Transferencia</option>
                </CFormSelect>
              </CCol>

              <CCol xs={12}>
                <CFormLabel style={{ fontWeight: "600" }}>💰 Total *</CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  value={nuevaVenta.total}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, total: e.target.value })}
                  placeholder="0.00"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  disabled={!!pedidoSeleccionado}
                />
              </CCol>

              <CCol xs={12} className="text-end mt-3">
                <CButton
                  onClick={registrarVenta}
                  style={{
                    background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 32px",
                    fontWeight: "700",
                    color: "white",
                    boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.3)",
                  }}
                >
                  ✅ Registrar Venta
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
      </CModal>
    </div>
  );
};

export default Ventas;