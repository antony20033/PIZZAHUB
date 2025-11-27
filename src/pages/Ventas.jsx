import React, { useState, useEffect } from "react";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState("hoy");
  
  // Estado del formulario
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
      const response = await fetch("https://localhost:7188/api/Ventas", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener ventas");

      const data = await response.json();
      console.log("Ventas:", data);
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
      const response = await fetch("https://localhost:7188/api/PedidosNew", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      // Filtrar solo pedidos entregados (estado 3)
      const pedidosEntregados = data.filter(p => p.estado === 3);
      setPedidos(pedidosEntregados);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
  };

  // -------------------------------
  // CARGAR CAJAS ABIERTAS
  // -------------------------------
  const fetchCajas = async () => {
    try {
      const response = await fetch("https://localhost:7188/api/Cajas", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error al obtener cajas");

      const data = await response.json();
      // Filtrar solo cajas abiertas (estado 1)
      const cajasAbiertas = data.filter(c => c.estado === 1);
      setCajas(cajasAbiertas);
    } catch (error) {
      console.error("Error cargando cajas:", error);
    }
  };

  useEffect(() => {
    fetchVentas();
    fetchPedidos();
    fetchCajas();
  }, []);

  // -------------------------------
  // REGISTRAR VENTA
  // -------------------------------
  const registrarVenta = async () => {
    if (!nuevaVenta.cajaId || !nuevaVenta.pedidoId || !nuevaVenta.empleadoId) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const response = await fetch("https://localhost:7188/api/Ventas", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cajaId: parseInt(nuevaVenta.cajaId),
          pedidoId: parseInt(nuevaVenta.pedidoId),
          empleadoId: parseInt(nuevaVenta.empleadoId),
          metodoPago: parseInt(nuevaVenta.metodoPago),
          total: parseFloat(nuevaVenta.total)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error registrando venta: ${errorText}`);
      }

      alert("✅ Venta registrada exitosamente");
      setMostrarFormulario(false);
      setNuevaVenta({
        cajaId: "",
        pedidoId: "",
        empleadoId: "",
        metodoPago: 1,
        total: 0
      });
      fetchVentas();
      fetchPedidos();
    } catch (error) {
      console.error("Error registrando venta:", error);
      alert("❌ Error al registrar venta: " + error.message);
    }
  };

  // -------------------------------
  // OBTENER MÉTODO DE PAGO
  // -------------------------------
  const getMetodoPago = (metodo) => {
    switch (metodo) {
      case 1: return { text: "Efectivo", icon: "💵", color: "#4caf50" };
      case 2: return { text: "Tarjeta", icon: "💳", color: "#2196f3" };
      case 3: return { text: "Transferencia", icon: "🏦", color: "#9c27b0" };
      default: return { text: "Desconocido", icon: "❓", color: "#999" };
    }
  };

  // -------------------------------
  // FILTRAR VENTAS POR FECHA
  // -------------------------------
  const ventasFiltradas = ventas.filter(v => {
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

  // Calcular total de ventas
  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);

  // Manejar cambio en pedido seleccionado
  const handlePedidoChange = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === parseInt(pedidoId));
    if (pedido) {
      setNuevaVenta({
        ...nuevaVenta,
        pedidoId: pedidoId,
        total: pedido.total
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        padding: "30px 20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "36px",
                  fontWeight: "900",
                  background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                💰 Gestión de Ventas
              </h1>
              <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                Registra y monitorea todas las transacciones
              </p>
            </div>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              style={{
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease",
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
              {mostrarFormulario ? "❌ Cancelar" : "➕ Nueva Venta"}
            </button>
          </div>
        </div>

        {/* Formulario Nueva Venta */}
        {mostrarFormulario && (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "30px",
              marginBottom: "30px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "800", color: "#333" }}>
              📝 Registrar Nueva Venta
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              
              {/* Seleccionar Caja */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#666", marginBottom: "8px" }}>
                  🏦 Caja *
                </label>
                <select
                  value={nuevaVenta.cajaId}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, cajaId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <option value="">Seleccionar caja...</option>
                  {cajas.map(c => (
                    <option key={c.id} value={c.id}>
                      Caja #{c.id} - {c.empleado?.nombre || "Sin empleado"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleccionar Pedido */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#666", marginBottom: "8px" }}>
                  📦 Pedido Entregado *
                </label>
                <select
                  value={nuevaVenta.pedidoId}
                  onChange={(e) => handlePedidoChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <option value="">Seleccionar pedido...</option>
                  {pedidos.map(p => (
                    <option key={p.id} value={p.id}>
                      Pedido #{p.id} - ${p.total}
                    </option>
                  ))}
                </select>
              </div>

              {/* ID Empleado */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#666", marginBottom: "8px" }}>
                  👤 ID Empleado *
                </label>
                <input
                  type="number"
                  value={nuevaVenta.empleadoId}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, empleadoId: e.target.value })}
                  placeholder="ID del empleado"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#666", marginBottom: "8px" }}>
                  💳 Método de Pago *
                </label>
                <select
                  value={nuevaVenta.metodoPago}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, metodoPago: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <option value="1">💵 Efectivo</option>
                  <option value="2">💳 Tarjeta</option>
                  <option value="3">🏦 Transferencia</option>
                </select>
              </div>

              {/* Total */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#666", marginBottom: "8px" }}>
                  💰 Total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevaVenta.total}
                  onChange={(e) => setNuevaVenta({ ...nuevaVenta, total: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                />
              </div>
            </div>

            <button
              onClick={registrarVenta}
              style={{
                width: "100%",
                marginTop: "24px",
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(30, 60, 114, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(30, 60, 114, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 6px 20px rgba(30, 60, 114, 0.3)";
              }}
            >
              ✅ Registrar Venta
            </button>
          </div>
        )}

        {/* Filtros y Resumen */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "30px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFiltroFecha("hoy")}
              style={{
                padding: "10px 20px",
                border: filtroFecha === "hoy" ? "2px solid #1e3c72" : "2px solid #e0e0e0",
                background: filtroFecha === "hoy" ? "#e3f2fd" : "white",
                color: filtroFecha === "hoy" ? "#1e3c72" : "#666",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => setFiltroFecha("semana")}
              style={{
                padding: "10px 20px",
                border: filtroFecha === "semana" ? "2px solid #1e3c72" : "2px solid #e0e0e0",
                background: filtroFecha === "semana" ? "#e3f2fd" : "white",
                color: filtroFecha === "semana" ? "#1e3c72" : "#666",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              📆 Última Semana
            </button>
            <button
              onClick={() => setFiltroFecha("mes")}
              style={{
                padding: "10px 20px",
                border: filtroFecha === "mes" ? "2px solid #1e3c72" : "2px solid #e0e0e0",
                background: filtroFecha === "mes" ? "#e3f2fd" : "white",
                color: filtroFecha === "mes" ? "#1e3c72" : "#666",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              📊 Este Mes
            </button>
            <button
              onClick={() => setFiltroFecha("todas")}
              style={{
                padding: "10px 20px",
                border: filtroFecha === "todas" ? "2px solid #1e3c72" : "2px solid #e0e0e0",
                background: filtroFecha === "todas" ? "#e3f2fd" : "white",
                color: filtroFecha === "todas" ? "#1e3c72" : "#666",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              📋 Todas
            </button>
          </div>
          
          <div
            style={{
              background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
              padding: "16px 32px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "white", fontSize: "14px", opacity: 0.9 }}>
              Total de Ventas
            </div>
            <div style={{ color: "white", fontSize: "28px", fontWeight: "900", marginTop: "4px" }}>
              ${totalVentas.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Lista de Ventas */}
        {loading ? (
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
              Cargando ventas...
            </p>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
            <h3 style={{ color: "#666", fontWeight: "600", margin: 0 }}>
              No hay ventas registradas
            </h3>
            <p style={{ color: "#999", marginTop: "10px" }}>
              Las ventas aparecerán aquí
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
            {ventasFiltradas.map((v) => {
              const metodoPago = getMetodoPago(v.metodoPago);
              const fecha = new Date(v.fechaVenta);
              
              return (
                <div
                  key={v.id}
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
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
                  {/* Header */}
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "900", color: "#333" }}>
                      Venta #{v.id}
                    </h3>
                    <div style={{ color: "#999", fontSize: "13px" }}>
                      {fecha.toLocaleDateString()} - {fecha.toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                      borderRadius: "16px",
                      padding: "20px",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ color: "white", fontSize: "14px", opacity: 0.9 }}>
                      Total de la venta
                    </div>
                    <div style={{ color: "white", fontSize: "36px", fontWeight: "900", marginTop: "4px" }}>
                      ${v.total}
                    </div>
                  </div>

                  {/* Información */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{metodoPago.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", color: "#999" }}>Método de pago</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: metodoPago.color }}>
                          {metodoPago.text}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>📦</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", color: "#999" }}>Pedido</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>
                          #{v.pedidoId}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>🏦</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", color: "#999" }}>Caja</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>
                          #{v.cajaId}
                        </div>
                      </div>
                    </div>

                    {v.empleado && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px" }}>👤</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", color: "#999" }}>Empleado</div>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "#333" }}>
                            {v.empleado.nombre} {v.empleado.apellidos}
                          </div>
                        </div>
                      </div>
                    )}
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

export default Ventas;
