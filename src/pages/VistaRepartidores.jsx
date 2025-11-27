import React, { useState } from "react";

const VistaRepartidor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidor, setRepartidor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repartidorId, setRepartidorId] = useState("");
  const [mostrarInput, setMostrarInput] = useState(true);

  const token = localStorage.getItem("token");

  // -------------------------------
  // OBTENER INFO DEL REPARTIDOR ACTUAL
  // -------------------------------
  const fetchRepartidorActual = async (id) => {
    try {
      const response = await fetch(`https://localhost:7188/api/Repartidores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener información del repartidor");

      const data = await response.json();
      setRepartidor(data);
    } catch (error) {
      console.error("Error cargando repartidor:", error);
      alert("Error: No se encontró el repartidor con ID " + id);
    }
  };

  // -------------------------------
  // CARGAR PEDIDOS ASIGNADOS
  // -------------------------------
  const fetchPedidos = async (id) => {
    if (!id) {
      alert("Por favor ingresa tu ID de repartidor");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("https://localhost:7188/api/PedidosNew", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      
      console.log("Todos los pedidos:", data);
      console.log("Filtrando por repartidorId:", id);
      
      // Filtrar solo los pedidos asignados a este repartidor
      const pedidosAsignados = data.filter(p => {
        console.log(`Pedido ${p.id}: repartidorId=${p.repartidorId}, estado=${p.estado}`);
        return p.repartidorId === parseInt(id) && p.estado !== 3 && p.estado !== 4;
      });
      
      console.log("Pedidos asignados filtrados:", pedidosAsignados);
      setPedidos(pedidosAsignados);
      setMostrarInput(false);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      alert("Error al cargar pedidos: " + error.message);
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
      alert("Por favor ingresa tu ID de repartidor");
    }
  };

  // -------------------------------
  // MARCAR COMO ENTREGADO
  // -------------------------------
  const marcarEntregado = async (pedidoId) => {
    try {
      const response = await fetch(
        `https://localhost:7188/api/PedidosNew/${pedidoId}/estado`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(3) // 3 = Entregado
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error marcando como entregado: ${errorText}`);
      }

      // Actualizar estado local
      setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== pedidoId));
      
      // Mostrar confirmación
      alert("✅ Pedido marcado como entregado exitosamente");
      
      // Recargar pedidos
      await fetchPedidos(repartidorId);
    } catch (error) {
      console.error("Error marcando como entregado:", error);
      alert("❌ Error al marcar como entregado: " + error.message);
    }
  };

  // -------------------------------
  // OBTENER COLOR DEL ESTADO
  // -------------------------------
  const getEstadoInfo = (estado) => {
    let estadoNormalizado = estado;
    
    if (typeof estado === 'string') {
      const estadoStr = estado.toLowerCase();
      if (estadoStr === 'pendiente' || estadoStr === '1') estadoNormalizado = 1;
      else if (estadoStr === 'encamino' || estadoStr === 'en camino' || estadoStr === '2') estadoNormalizado = 2;
    }
    
    switch (estadoNormalizado) {
      case 1:
        return { color: "#ffc107", bg: "#fff8e1", text: "Pendiente", icon: "⏳" };
      case 2:
        return { color: "#2196f3", bg: "#e3f2fd", text: "En camino", icon: "🚚" };
      default:
        return { color: "#9e9e9e", bg: "#f5f5f5", text: "Desconocido", icon: "❓" };
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header del Repartidor */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "40px",
            }}
          >
            🚴
          </div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "28px",
              fontWeight: "800",
              color: "#333",
            }}
          >
            {repartidor ? `¡Hola, ${repartidor.nombreCompleto}!` : "Vista de Repartidor"}
          </h1>
          <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
            {!mostrarInput && `Tienes ${pedidos.length} ${pedidos.length === 1 ? "pedido pendiente" : "pedidos pendientes"}`}
          </p>
        </div>

        {/* Input y Botón de Cargar */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "700",
              color: "#667eea",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            🆔 Ingresa tu ID de Repartidor
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number"
              value={repartidorId}
              onChange={(e) => setRepartidorId(e.target.value)}
              placeholder="Ej: 1, 2, 3..."
              style={{
                flex: 1,
                padding: "14px",
                border: "2px solid #667eea",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#764ba2";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "none";
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  cargarPedidosConId();
                }
              }}
            />
            <button
              onClick={cargarPedidosConId}
              disabled={loading}
              style={{
                background: loading 
                  ? "#ccc" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px 30px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
              }}
            >
              {loading ? "🔄 Cargando..." : "🔄 Cargar Pedidos"}
            </button>
          </div>
        </div>

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
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
                <p style={{ color: "#666", fontSize: "18px", margin: 0 }}>
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
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
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
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                        position: "relative",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.2)";
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
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>{estadoInfo.icon}</span>
                        {estadoInfo.text}
                      </div>

                      {/* Número de Pedido */}
                      <div style={{ marginBottom: "20px", paddingRight: "120px" }}>
                        <h2
                          style={{
                            margin: "0 0 12px 0",
                            fontSize: "32px",
                            fontWeight: "900",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          Pedido #{p.id}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "18px" }}>👤</span>
                          <span style={{ color: "#666", fontSize: "16px", fontWeight: "600" }}>
                            {p.clienteNombre || "Cliente mostrador"}
                          </span>
                        </div>
                        {p.direccionEntrega && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>📍</span>
                            <span style={{ color: "#999", fontSize: "14px" }}>
                              {p.direccionEntrega}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: "16px",
                          padding: "20px",
                          marginBottom: "20px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ color: "white", fontSize: "14px", opacity: 0.9 }}>
                          Valor del pedido
                        </div>
                        <div
                          style={{
                            color: "white",
                            fontSize: "36px",
                            fontWeight: "900",
                            marginTop: "4px",
                          }}
                        >
                          ${p.total}
                        </div>
                      </div>

                      {/* Productos */}
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
                          📦 Productos del pedido
                        </h4>
                        {p.detalles?.map((d, index) => (
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
                                color: "#667eea",
                                fontSize: "16px",
                              }}
                            >
                              ${d.subtotal}
                            </div>
                          </div>
                        ))}
                      </div>

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
    </div>
  );
};

export default VistaRepartidor;