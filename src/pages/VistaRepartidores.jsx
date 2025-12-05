import React, { useState } from "react";
import callApi from "../utils/apiProxy";

const VistaRepartidor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidor, setRepartidor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repartidorId, setRepartidorId] = useState("");
  const [mostrarInput, setMostrarInput] = useState(true);
  const [notificacion, setNotificacion] = useState(null);

  const token = localStorage.getItem("token");

  // Intentar detectar repartidor automáticamente desde el usuario logueado
  const autoDetectRepartidor = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = user?.id;
      if (!userId) return;

      // Obtener lista de repartidores y buscar el que corresponda al usuario
      const res = await callApi('/api/Repartidores', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const lista = await res.json();
      const found = lista.find(r => r.usuarioId === userId || (r.usuario && (r.usuario.id === userId || r.usuario.usuarioId === userId)));
      if (found) {
        setRepartidor(found);
        setRepartidorId(String(found.id));
        setMostrarInput(false);
        // Cargar pedidos asignados al repartidor
        await fetchPedidos(found.id);
      }
    } catch (err) {
      console.error('Auto-detect repartidor error:', err);
    }
  };

  // -------------------------------
  // MOSTRAR NOTIFICACIÓN
  // -------------------------------
  const mostrarNotificacion = (mensaje, tipo = "success") => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  // -------------------------------
  // OBTENER INFO DEL REPARTIDOR
  // -------------------------------
  const fetchRepartidorActual = async (id) => {
    try {
      const response = await callApi(`/api/Repartidores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener información del repartidor");

      const data = await response.json();
      setRepartidor(data);
    } catch (error) {
      console.error("Error cargando repartidor:", error);
      mostrarNotificacion("No se encontró el repartidor con ID " + id, "error");
    }
  };

  // -------------------------------
  // CARGAR PEDIDOS ASIGNADOS (Solo NO entregados)
  // -------------------------------
  const fetchPedidos = async (id) => {
    if (!id) {
      mostrarNotificacion("Por favor ingresa tu ID de repartidor", "warning");
      return;
    }
    
    try {
      setLoading(true);
      const response = await callApi('/api/PedidosNew', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      
      console.log("📋 Todos los pedidos:", data);
      console.log("🔍 Filtrando por repartidorId:", id);
      
      // Normalizar y filtrar pedidos asignados Y que NO estén entregados (estado !== 3) ni cancelados (estado !== 4)
      const pedidosAsignados = data.filter(p => {
        const esDelRepartidor = parseInt(p.repartidorId) === parseInt(id);
        const estadoNum = normalizarEstado(p.estado);
        const noEntregado = estadoNum !== 3;
        const noCancelado = estadoNum !== 4;

        console.log(`Pedido ${p.id}: repartidor=${p.repartidorId}, estado=${p.estado} (norm:${estadoNum}), mostrar=${esDelRepartidor && noEntregado && noCancelado}`);

        return esDelRepartidor && noEntregado && noCancelado;
      });
      
      console.log("✅ Pedidos filtrados:", pedidosAsignados);
      setPedidos(pedidosAsignados);
      setMostrarInput(false);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      mostrarNotificacion("Error al cargar pedidos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // CARGAR CON ID
  // -------------------------------
  const cargarPedidosConId = () => {
    if (repartidorId.trim()) {
      fetchRepartidorActual(repartidorId);
      fetchPedidos(repartidorId);
    } else {
      mostrarNotificacion("Por favor ingresa tu ID de repartidor", "warning");
    }
  };

  // Intentar auto-detección al montar
  React.useEffect(() => {
    autoDetectRepartidor();
  }, []);

  // -------------------------------
  // MARCAR COMO ENTREGADO
  // -------------------------------
  const marcarEntregado = async (pedidoId) => {
    try {
      console.log(`📦 Marcando pedido ${pedidoId} como entregado (estado: 3)`);
      
      const response = await callApi(`/api/PedidosNew/${pedidoId}/estado`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(3) // 3 = Entregado
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${errorText}`);
      }

      console.log("✅ Pedido marcado como entregado exitosamente");

      // Remover pedido de la lista local inmediatamente
      setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== pedidoId));
      
      // Mostrar notificación de éxito
      mostrarNotificacion(`Pedido #${pedidoId} entregado correctamente`, "success");
      
    } catch (error) {
      console.error("❌ Error marcando como entregado:", error);
      mostrarNotificacion("Error al marcar como entregado: " + error.message, "error");
    }
  };

  // -------------------------------
  // -------------------------------
  // NORMALIZAR Y OBTENER INFORMACIÓN DEL ESTADO
  // -------------------------------
  const normalizarEstado = (estado) => {
    if (typeof estado === 'number') return estado;
    if (typeof estado === 'string') {
      const s = estado.toLowerCase().trim();
      const map = { 'preparando': 0, 'preparación': 0, 'pendiente': 1, '1': 1, 'encamino': 2, 'en camino': 2, '2': 2, 'entregado': 3, '3': 3, 'cancelado': 4, '4': 4 };
      if (map.hasOwnProperty(s)) return map[s];
      const n = parseInt(estado);
      if (!isNaN(n)) return n;
    }
    return 1; // por defecto pendiente
  };

  const getEstadoInfo = (estado) => {
    const estadoNum = normalizarEstado(estado);

    switch (estadoNum) {
      case 0:
        return { color: "#475569", bg: "#f1f5f9", text: "Preparando", icon: "" };
      case 1:
        return { color: "#2563eb", bg: "#e7f0ff", text: "Pendiente", icon: "" };
      case 2:
        return { color: "#0ea5a4", bg: "#ecfdf5", text: "En camino", icon: "" };
      case 3:
        return { color: "#10b981", bg: "#ecfdf5", text: "Entregado", icon: "" };
      case 4:
        return { color: "#ef4444", bg: "#fff5f5", text: "Cancelado", icon: "" };
      default:
        return { color: "#6b7280", bg: "#f8fafc", text: "Desconocido", icon: "" };
    }
  };

  return (
    <div
      className="page-container"
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        width: "100%",
        maxWidth: "100%",
        margin: 0
      }}
    >
      {/* Notificación Flotante */}
      {notificacion && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            background: notificacion.tipo === "success" 
              ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
              : notificacion.tipo === "error"
              ? "linear-gradient(135deg, #f44336 0%, #e53935 100%)"
              : "linear-gradient(135deg, #ff9800 0%, #fb8c00 100%)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideInRight 0.3s ease-out",
            fontWeight: "700",
            fontSize: "15px",
            maxWidth: "400px",
          }}
        >
          <span style={{ marginLeft: 0 }}>{notificacion.mensaje}</span>
        </div>
      )}

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header del Repartidor */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.06)",
            textAlign: "center",
            borderBottom: "4px solid #2b6cb0",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#e6eef9",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "28px",
              color: "#2b6cb0",
              boxShadow: "0 4px 12px rgba(43, 108, 176, 0.06)",
            }}
          >
            {repartidor ? repartidor.nombreCompleto?.charAt(0) || "R" : "R"}
          </div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "24px",
              fontWeight: "800",
              color: "#1A1C20",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {repartidor ? `¡Hola, ${repartidor.nombreCompleto}!` : "Vista de Repartidor"}
          </h1>
          <p style={{ color: "#666", fontSize: "15px", margin: 0 }}>
            {!mostrarInput && (
              <>
                Tienes <span style={{ fontWeight: "800", color: "#2b6cb0" }}>{pedidos.length}</span>{" "}
                {pedidos.length === 1 ? "pedido pendiente" : "pedidos pendientes"}
              </>
            )}
          </p>
        </div>

        {/* Auto-detección: si no se detecta repartidor se muestra un aviso y botón */}
        {!repartidor && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "18px",
              marginBottom: "20px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.04)",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, color: "#555", fontWeight: 600 }}>
              No se detectó automáticamente el repartidor. Por favor pulsa el botón para intentar de nuevo.
            </p>
            <div style={{ marginTop: 12 }}>
              <button
                onClick={autoDetectRepartidor}
                disabled={loading}
                style={{
                  background: loading ? "#cbd5e1" : "#2b6cb0",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Cargando..." : "Detectar repartidor"}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Pedidos */}
        {!mostrarInput && (
          <>
            {loading && pedidos.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "60px 30px",
                  textAlign: "center",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
                <p style={{ color: "#666", fontSize: "18px", margin: 0, fontWeight: "600" }}>
                  Cargando pedidos...
                </p>
              </div>
            ) : pedidos.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "60px 30px",
                  textAlign: "center",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
                <h3 style={{ color: "#333", fontWeight: "700", margin: "0 0 10px 0", fontSize: "24px" }}>
                  ¡Todo entregado!
                </h3>
                <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
                  No tienes pedidos pendientes en este momento
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {pedidos.map((p) => {
                  const estadoInfo = getEstadoInfo(p.estado);
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: "white",
                        borderRadius: "20px",
                        padding: "24px",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                        position: "relative",
                        transition: "all 0.3s ease",
                        border: "2px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 15px 50px rgba(255, 102, 0, 0.2)";
                        e.currentTarget.style.borderColor = "#FF6600";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      {/* Badge de Estado */}
                        <div
                          style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            background: estadoInfo.bg,
                            color: estadoInfo.color,
                            padding: "8px 14px",
                            borderRadius: "16px",
                            fontSize: "13px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {estadoInfo.text}
                        </div>

                      {/* Número de Pedido */}
                      <div style={{ marginBottom: "20px", paddingRight: "120px" }}>
                        <h2
                          style={{
                            margin: "0 0 12px 0",
                            fontSize: "32px",
                            fontWeight: "900",
                            background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          Pedido #{p.id}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ color: "#666", fontSize: "16px", fontWeight: "600" }}>
                            {p.clienteNombre || "Cliente mostrador"}
                          </span>
                        </div>
                        {p.direccionEntrega && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: "#999", fontSize: "14px" }}>
                              {p.direccionEntrega}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                        <div
                          style={{
                            background: "#eef6ff",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "20px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ color: "#2b6cb0", fontSize: "13px", opacity: 0.95, fontWeight: "600" }}>
                            Valor del pedido
                          </div>
                          <div
                            style={{
                              color: "#1a365d",
                              fontSize: "28px",
                              fontWeight: "800",
                              marginTop: "4px",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            ${p.total}
                          </div>
                        </div>

                      {/* Productos */}
                      {p.detalles && p.detalles.length > 0 && (
                        <div
                          style={{
                            background: "#f8f9fa",
                            borderRadius: "16px",
                            padding: "20px",
                            marginBottom: "24px",
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          <h4
                            style={{
                              margin: "0 0 16px 0",
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#666",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Productos del pedido
                          </h4>
                          {p.detalles.map((d, index) => (
                            <div
                              key={d.id || index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 0",
                                borderBottom: index < p.detalles.length - 1 ? "1px solid #e0e0e0" : "none",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "700", color: "#333", fontSize: "15px" }}>
                                  {d.productoNombre}
                                </div>
                                <div style={{ color: "#999", fontSize: "13px", marginTop: "4px" }}>
                                  Cantidad: {d.cantidad}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontWeight: "800",
                                  color: "#FF6600",
                                  fontSize: "16px",
                                }}
                              >
                                ${d.subtotal}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Botón de Entregar */}
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Confirmas que entregaste el pedido #${p.id}?`)) {
                            marcarEntregado(p.id);
                          }
                        }}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "16px",
                          padding: "18px",
                          fontSize: "18px",
                          fontWeight: "800",
                          cursor: "pointer",
                          boxShadow: "0 6px 20px rgba(76, 175, 80, 0.3)",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 8px 25px rgba(76, 175, 80, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.3)";
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>✅</span>
                        <span>MARCAR COMO ENTREGADO</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VistaRepartidor;