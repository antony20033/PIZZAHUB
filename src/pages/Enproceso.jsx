import React, { useState, useEffect } from "react"
import callApi from "../utils/apiProxy";
import { useNavigate } from "react-router-dom";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [mostrarCompletados, setMostrarCompletados] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // -------------------------------
  // NORMALIZAR ESTADO A NÚMERO
  // -------------------------------
  const normalizarEstado = (estado) => {
    // Si ya es número, retornarlo
    if (typeof estado === 'number') {
      return estado;
    }
    
    // Si es string, convertir
    if (typeof estado === 'string') {
      const estadoStr = estado.toLowerCase().trim();
      
      // Mapeo de strings a números
      const mapaEstados = {
        'pendiente': 1,
        '1': 1,
        'encamino': 2,
        'en camino': 2,
        '2': 2,
        'entregado': 3,
        '3': 3,
        'cancelado': 4,
        '4': 4
      };
      
      return mapaEstados[estadoStr] || parseInt(estado) || 1;
    }
    
    return 1; // Default: Pendiente
  };

  // -------------------------------
  // CARGAR PEDIDOS
  // -------------------------------
  const fetchPedidos = async () => {
    try {
      const response = await callApi('/api/PedidosNew', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      
      console.log("Datos recibidos del API:", data);
      if (data.length > 0) {
        console.log("Primer pedido completo:", data[0]);
        console.log("Estado original:", data[0].estado, "Tipo:", typeof data[0].estado);
        console.log("Estado normalizado:", normalizarEstado(data[0].estado));
      }
      
      // Normalizar estados al cargar
      const pedidosNormalizados = data.map(p => ({
        ...p,
        estadoOriginal: p.estado, // Guardar original para debugging
        estado: normalizarEstado(p.estado)
      }));
      
      console.log("Pedidos después de normalizar:", pedidosNormalizados);
      setPedidos(pedidosNormalizados);
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
      const response = await callApi('/api/Repartidores', {
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
        `/api/PedidosNew/${pedidoId}/estado`,
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

      // Actualizar el estado local inmediatamente
      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, estado: nuevoEstado, estadoOriginal: nuevoEstado } : p
        )
      );

      // Recargar todos los pedidos
      await fetchPedidos();
      
      alert("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al cambiar estado: " + error.message);
    }
  };

  // -------------------------------
  // ASIGNAR REPARTIDOR
  // -------------------------------
  const asignarRepartidor = async (pedidoId, repartidorId) => {
    if (!repartidorId || repartidorId === 0) {
      alert("Por favor selecciona un repartidor válido");
      return;
    }

    try {
      const response = await callApi(`/api/PedidosNew/${pedidoId}/asignar-repartidor`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ repartidorId: repartidorId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error asignando repartidor: ${errorText}`);
      }

      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, repartidorId: repartidorId } : p
        )
      );

      await fetchPedidos();
      
      alert("Repartidor asignado correctamente");
    } catch (error) {
      console.error("Error asignando repartidor:", error);
      alert("Error al asignar repartidor: " + error.message);
    }
  };

  // -------------------------------
  // IR A VENTAS CON ID DEL PEDIDO
  // -------------------------------
 const irAVentas = (pedidoId) => {
  navigate(`/pages/Ventas?pedidoId=${pedidoId}`);
};

  // -------------------------------
  // OBTENER COLOR Y BADGE DEL ESTADO
  // -------------------------------
  const getEstadoInfo = (estado) => {
    // El estado ya debe estar normalizado
    const estadoNum = typeof estado === 'number' ? estado : normalizarEstado(estado);
    
    console.log("getEstadoInfo - Estado recibido:", estado, "Normalizado:", estadoNum);
    
    switch (estadoNum) {
      case 1:
        return { color: "#ffc107", bg: "#fff8e1", text: "Pendiente", icon: "⏳" };
      case 2:
        return { color: "#2196f3", bg: "#e3f2fd", text: "En camino", icon: "🚚" };
      case 3:
        return { color: "#4caf50", bg: "#e8f5e9", text: "Entregado", icon: "✅" };
      case 4:
        return { color: "#f44336", bg: "#ffebee", text: "Cancelado", icon: "❌" };
      default:
        console.warn("Estado desconocido:", estado, "normalizado a:", estadoNum);
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

  // -------------------------------
  // FILTRAR PEDIDOS
  // -------------------------------
  const pedidosEnProceso = pedidos.filter(p => {
    const estado = p.estado; // Ya está normalizado
    const resultado = estado !== 3 && estado !== 4;
    console.log(`Pedido #${p.id} - Estado: ${estado} (original: ${p.estadoOriginal}) - En proceso: ${resultado}`);
    return resultado;
  });

  const pedidosCompletados = pedidos.filter(p => {
    const estado = p.estado; // Ya está normalizado
    const resultado = estado === 3 || estado === 4;
    console.log(`Pedido #${p.id} - Estado: ${estado} (original: ${p.estadoOriginal}) - Completado: ${resultado}`);
    return resultado;
  });

  const pedidosMostrar = mostrarCompletados ? pedidosCompletados : pedidosEnProceso;

  console.log("=== RESUMEN DE FILTRADO ===");
  console.log("Total pedidos:", pedidos.length);
  console.log("En proceso:", pedidosEnProceso.length);
  console.log("Completados:", pedidosCompletados.length);
  console.log("Mostrando:", mostrarCompletados ? "Completados" : "En proceso");
  console.log("Pedidos a mostrar:", pedidosMostrar.length);

  return (
    <div
      className="page-container"
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        width: "100%",
        maxWidth: "100%",
        margin: 0
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div
          className="fade-in"
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "25px 30px",
            marginBottom: "30px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            borderBottom: "4px solid #FF6600",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
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
              Total: {pedidosMostrar.length} pedidos
            </div>
          </div>

          {/* Botones de filtro */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setMostrarCompletados(false)}
              style={{
                padding: "12px 24px",
                background: !mostrarCompletados 
                  ? "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)" 
                  : "white",
                color: !mostrarCompletados ? "white" : "#666",
                border: !mostrarCompletados ? "none" : "2px solid #e0e0e0",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: !mostrarCompletados ? "0 4px 15px rgba(33, 150, 243, 0.3)" : "none",
              }}
            >
              🔄 En Proceso ({pedidosEnProceso.length})
            </button>
            <button
              onClick={() => setMostrarCompletados(true)}
              style={{
                padding: "12px 24px",
                background: mostrarCompletados 
                  ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)" 
                  : "white",
                color: mostrarCompletados ? "white" : "#666",
                border: mostrarCompletados ? "none" : "2px solid #e0e0e0",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: mostrarCompletados ? "0 4px 15px rgba(76, 175, 80, 0.3)" : "none",
              }}
            >
              ✅ Completados ({pedidosCompletados.length})
            </button>
          </div>
        </div>

        {/* Grid de Pedidos */}
        {pedidosMostrar.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>
              {mostrarCompletados ? "📋" : "📭"}
            </div>
            <h3 style={{ color: "#666", fontWeight: "600", margin: 0 }}>
              {mostrarCompletados 
                ? "No hay pedidos completados" 
                : "No hay pedidos en proceso"}
            </h3>
            <p style={{ color: "#999", marginTop: "10px" }}>
              {mostrarCompletados 
                ? "Los pedidos entregados y cancelados aparecerán aquí" 
                : "Los nuevos pedidos aparecerán aquí"}
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
            {pedidosMostrar.map((p) => {
              const estadoInfo = getEstadoInfo(p.estado);
              const nombreRepartidor = getNombreRepartidor(p.repartidorId);
              const esEntregado = p.estado === 3;
              
              console.log(`Renderizando Pedido #${p.id} - Estado: ${p.estado} - Es entregado: ${esEntregado}`);
              
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

                  {/* Repartidor Asignado */}
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

                  {/* Botón de Venta para pedidos entregados - SIEMPRE VISIBLE */}
                  {esEntregado && (
  <button
    onClick={() => {
      console.log("🚀 Navegando a Ventas con pedido:", p.id);
      irAVentas(p.id);
    }}
    style={{
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontWeight: "700",
      fontSize: "15px",
      cursor: "pointer",
      marginBottom: "16px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
    }}
  >
    <span style={{ fontSize: "18px" }}>💰</span>
    Registrar Venta
  </button>
)}

                  {/* Cambiar Estado - Solo para pedidos en proceso */}
                  {!mostrarCompletados && (
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
                        >
                          ❌ Cancelado
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Asignar Repartidor - Solo para pedidos en proceso */}
                  {!mostrarCompletados && (
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
                  )}
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