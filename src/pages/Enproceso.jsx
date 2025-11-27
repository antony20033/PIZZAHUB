import React, { useState, useEffect } from "react";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);

  const token = localStorage.getItem("token");

  // -------------------------------
  // CARGAR PEDIDOS
  // -------------------------------
  const fetchPedidos = async () => {
    try {
      const response = await fetch("https://pizzahub-api.onrender.com/api/PedidosNew", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      
      // DEBUG: Ver qué formato tiene el estado
      console.log("Datos recibidos del API:", data);
      if (data.length > 0) {
        console.log("Primer pedido completo:", data[0]);
        console.log("Estado del primer pedido:", data[0].estado, "Tipo:", typeof data[0].estado);
      }
      
      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      alert("Error al cargar pedidos: " + error.message);
    }
  };

  // -------------------------------
  // CARGAR REPARTIDORES
  // -------------------------------
  const fetchRepartidores = async () => {
    try {
      const response = await fetch("https://pizzahub-api.onrender.com/api/Repartidores", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener repartidores");

      const data = await response.json();
      setRepartidores(data);
    } catch (error) {
      console.error("Error cargando repartidores:", error);
      alert("Error al cargar repartidores: " + error.message);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchRepartidores();
  }, []);

  // -------------------------------
  // CAMBIAR ESTADO
  // -------------------------------
  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const response = await fetch(
        `https://pizzahub-api.onrender.com/api/PedidosNew/${pedidoId}/estado`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(nuevoEstado)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error cambiando estado: ${errorText}`);
      }

      // Actualizar el estado local inmediatamente para feedback visual
      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
        )
      );

      // Recargar todos los pedidos para asegurar sincronización
      await fetchPedidos();
      
      alert("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al cambiar estado: " + error.message);
    }
  };

  // -------------------------------
  // ASIGNAR REPARTIDOR (CORREGIDO)
  // -------------------------------
  const asignarRepartidor = async (pedidoId, repartidorId) => {
    if (!repartidorId || repartidorId === 0) {
      alert("Por favor selecciona un repartidor válido");
      return;
    }

    try {
      const response = await fetch(
        `https://pizzahub-api.onrender.com/api/PedidosNew/${pedidoId}/asignar-repartidor`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ repartidorId: repartidorId })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error asignando repartidor: ${errorText}`);
      }

      // Actualizar el estado local inmediatamente
      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, repartidorId: repartidorId } : p
        )
      );

      // Recargar pedidos para sincronizar con el servidor
      await fetchPedidos();
      
      alert("Repartidor asignado correctamente");
    } catch (error) {
      console.error("Error asignando repartidor:", error);
      alert("Error al asignar repartidor: " + error.message);
    }
  };

  // -------------------------------
  // OBTENER COLOR Y BADGE DEL ESTADO
  // -------------------------------
  const getEstadoInfo = (estado) => {
    // Normalizar el estado (puede venir como número o string)
    let estadoNormalizado = estado;
    
    // Si viene como string, convertir a número
    if (typeof estado === 'string') {
      const estadoStr = estado.toLowerCase();
      if (estadoStr === 'pendiente' || estadoStr === '1') estadoNormalizado = 1;
      else if (estadoStr === 'encamino' || estadoStr === 'en camino' || estadoStr === '2') estadoNormalizado = 2;
      else if (estadoStr === 'entregado' || estadoStr === '3') estadoNormalizado = 3;
      else if (estadoStr === 'cancelado' || estadoStr === '4') estadoNormalizado = 4;
    }
    
    console.log("Estado recibido:", estado, "Normalizado a:", estadoNormalizado);
    
    switch (estadoNormalizado) {
      case 1:
        return { color: "#ffc107", bg: "#fff8e1", text: "Pendiente", icon: "⏳" };
      case 2:
        return { color: "#2196f3", bg: "#e3f2fd", text: "En camino", icon: "🚚" };
      case 3:
        return { color: "#4caf50", bg: "#e8f5e9", text: "Entregado", icon: "✅" };
      case 4:
        return { color: "#f44336", bg: "#ffebee", text: "Cancelado", icon: "❌" };
      default:
        console.warn("Estado desconocido:", estado);
        return { color: "#9e9e9e", bg: "#f5f5f5", text: "Desconocido", icon: "❓" };
    }
  };

  // -------------------------------
  // OBTENER NOMBRE DEL REPARTIDOR
  // -------------------------------
  const getNombreRepartidor = (repartidorId) => {
    const repartidor = repartidores.find(r => r.id === repartidorId);
    return repartidor ? repartidor.nombre : null;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        padding: "30px 20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          className="fade-in"
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "25px 30px",
            marginBottom: "30px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "4px solid #FF6600",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "800",
                color: "#1A1C20",
              }}
            >
              📦 Gestión de Pedidos
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#666", fontSize: "14px" }}>
              Administra y monitorea todos los pedidos en tiempo real
            </p>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "18px",
              boxShadow: "0 4px 15px rgba(255, 102, 0, 0.3)",
            }}
          >
            Total: {pedidos.length} pedidos
          </div>
        </div>

        {/* Grid de Pedidos */}
        {pedidos.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
            <h3 style={{ color: "#666", fontWeight: "600", margin: 0 }}>
              No hay pedidos en este momento
            </h3>
            <p style={{ color: "#999", marginTop: "10px" }}>
              Los nuevos pedidos aparecerán aquí
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "20px",
            }}
          >
            {pedidos.map((p) => {
              const estadoInfo = getEstadoInfo(p.estado);
              const nombreRepartidor = getNombreRepartidor(p.repartidorId);
              
              return (
                <div
                  key={p.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    border: `2px solid ${estadoInfo.color}20`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                  }}
                >
                  {/* Badge de Estado */}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: estadoInfo.bg,
                      color: estadoInfo.color,
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{estadoInfo.icon}</span>
                    {estadoInfo.text}
                  </div>

                  {/* Header del Pedido */}
                  <div style={{ marginBottom: "20px", paddingRight: "100px" }}>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "24px",
                        fontWeight: "800",
                        color: "#333",
                      }}
                    >
                      Pedido #{p.id}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>👤</span>
                      <span style={{ color: "#666", fontSize: "14px", fontWeight: "500" }}>
                        {p.clienteNombre || "Mostrador"}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ color: "white", fontSize: "14px", opacity: 0.9 }}>
                      Total del pedido
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontSize: "32px",
                        fontWeight: "800",
                        marginTop: "4px",
                      }}
                    >
                      ${p.total}
                    </div>
                  </div>

                  {/* Repartidor Asignado (NUEVO) */}
                  {nombreRepartidor && (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #4A5568 0%, #2D3748 100%)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>🚴</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "white", fontSize: "11px", opacity: 0.9 }}>
                          Repartidor asignado
                        </div>
                        <div style={{ color: "white", fontSize: "15px", fontWeight: "700" }}>
                          {nombreRepartidor}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detalles del Pedido */}
                  <div
                    style={{
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "20px",
                      maxHeight: "180px",
                      overflowY: "auto",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      🍕 Productos
                    </h4>
                    {p.detalles?.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>
                            {d.productoNombre}
                          </div>
                          <div style={{ color: "#999", fontSize: "12px" }}>
                            Cantidad: {d.cantidad}
                          </div>
                        </div>
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#FF6600",
                            fontSize: "14px",
                          }}
                        >
                          ${d.subtotal}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cambiar Estado */}
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#666",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      ⚡ Cambiar Estado
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() => cambiarEstado(p.id, 1)}
                        style={{
                          padding: "10px",
                          border: "2px solid #ffc107",
                          background: p.estado === 1 ? "#ffc107" : "white",
                          color: p.estado === 1 ? "white" : "#ffc107",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (p.estado !== 1) {
                            e.target.style.background = "#fff8e1";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (p.estado !== 1) {
                            e.target.style.background = "white";
                          }
                        }}
                      >
                        ⏳ Pendiente
                      </button>
                      <button
                        onClick={() => cambiarEstado(p.id, 2)}
                        style={{
                          padding: "10px",
                          border: "2px solid #2196f3",
                          background: p.estado === 2 ? "#2196f3" : "white",
                          color: p.estado === 2 ? "white" : "#2196f3",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (p.estado !== 2) {
                            e.target.style.background = "#e3f2fd";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (p.estado !== 2) {
                            e.target.style.background = "white";
                          }
                        }}
                      >
                        🚚 En camino
                      </button>
                      <button
                        onClick={() => cambiarEstado(p.id, 3)}
                        style={{
                          padding: "10px",
                          border: "2px solid #4caf50",
                          background: p.estado === 3 ? "#4caf50" : "white",
                          color: p.estado === 3 ? "white" : "#4caf50",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (p.estado !== 3) {
                            e.target.style.background = "#e8f5e9";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (p.estado !== 3) {
                            e.target.style.background = "white";
                          }
                        }}
                      >
                        ✅ Entregado
                      </button>
                      <button
                        onClick={() => cambiarEstado(p.id, 4)}
                        style={{
                          padding: "10px",
                          border: "2px solid #f44336",
                          background: p.estado === 4 ? "#f44336" : "white",
                          color: p.estado === 4 ? "white" : "#f44336",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (p.estado !== 4) {
                            e.target.style.background = "#ffebee";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (p.estado !== 4) {
                            e.target.style.background = "white";
                          }
                        }}
                      >
                        ❌ Cancelado
                      </button>
                    </div>
                  </div>

                  {/* Asignar Repartidor (MEJORADO) */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#666",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      🚴 Asignar Repartidor
                    </label>
                    <select
                      onChange={(e) =>
                        asignarRepartidor(p.id, Number(e.target.value))
                      }
                      value={p.repartidorId || ""}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: "white",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#FF6600";
                        e.target.style.outline = "none";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e0e0";
                      }}
                    >
                      <option value="">
                        Seleccionar repartidor...
                      </option>
                      {repartidores.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pedidos;