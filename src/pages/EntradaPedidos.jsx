import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const EntradaPedidos = () => {
  const clienteId = Number(localStorage.getItem("pedidoClienteId")) || null;
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);

  const [form, setForm] = useState({
    tipo: 1,
    metodoPago: 1,
    origen: 1,
    direccionEntrega: "",
    observaciones: ""
  });

  // CARGAR PRODUCTOS
  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Productos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;

      const data = await res.json();
      setProductos(data);
    } catch (e) {
      console.log("Error productos:", e);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // AÑADIR PRODUCTO
  const agregarProducto = (productoId) => {
    const existe = detalles.find((d) => d.productoId === productoId);
    if (existe) {
      setDetalles(
        detalles.map((d) =>
          d.productoId === productoId
            ? { ...d, cantidad: d.cantidad + 1 }
            : d
        )
      );
    } else {
      setDetalles([...detalles, { productoId, cantidad: 1 }]);
    }
  };

  // QUITAR PRODUCTO
  const quitarProducto = (productoId) => {
    const existe = detalles.find((d) => d.productoId === productoId);
    if (existe && existe.cantidad > 1) {
      setDetalles(
        detalles.map((d) =>
          d.productoId === productoId
            ? { ...d, cantidad: d.cantidad - 1 }
            : d
        )
      );
    } else {
      setDetalles(detalles.filter((d) => d.productoId !== productoId));
    }
  };

  // TOTAL
  const calcularTotal = () =>
    detalles.reduce((sum, d) => {
      const prod = productos.find((p) => p.id === d.productoId);
      return sum + (prod?.precio || 0) * d.cantidad;
    }, 0);

  // REGISTRAR PEDIDO
const registrarPedido = async () => {
  if (detalles.length === 0)
    return alert("❌ Agrega al menos un producto.");

  const finalClienteId = clienteId || null;

  const payload = {
    clienteId: finalClienteId,
    ...form,
    detalles
  };

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/PedidosNew/registrar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      alert("Error al registrar pedido ❌");
      return;
    }

    alert("Pedido registrado con éxito ✔");
    localStorage.removeItem("pedidoClienteId");
    window.location.href = "/pedidos";
  } catch (e) {
    console.log("Error:", e);
  }
};


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
        {/* HEADER */}
        <div
          className="fade-in"
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px 35px",
            marginBottom: "30px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <span style={{ fontSize: "36px" }}>🛒</span>
            Registrar Nuevo Pedido
          </h1>

          <div
  style={{
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}
>
  <span style={{ color: "#6B7280", fontSize: "14px", fontWeight: "500" }}>
    Cliente ID:
  </span>

  <span
    style={{
      background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
      color: "white",
      padding: "6px 18px",
      borderRadius: "24px",
      fontWeight: "700",
      fontSize: "14px",
      boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.3)"
    }}
  >
    #{clienteId || "No seleccionado"}
  </span>

  {/* Nuevo botón para limpiar selección */}
  {clienteId && (
    <button
      style={{
        padding: "6px 14px",
        background: "#EF4444",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "700"
      }}
      onClick={() => {
        localStorage.removeItem("pedidoClienteId");
        window.location.reload();
      }}
    >
      ❌ Quitar cliente
    </button>
  )}
</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "30px"
          }}
        >
         

          {/* IZQUIERDA: PRODUCTOS */}
          <div>
            <div
              className="slide-in"
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                marginBottom: "20px",
                border: "1px solid rgba(0, 0, 0, 0.05)"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: "24px",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1F2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <span style={{ fontSize: "28px" }}>🍕</span>
                Menú de Productos
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "16px",
                  maxHeight: "calc(100vh - 300px)",
                  overflowY: "auto",
                  paddingRight: "10px"
                }}
              >
                {productos.map((p, index) => (
                  <div
                    key={p.id}
                    className="product-card"
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`,
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                    }}
                  >
                    {/* Placeholder de imagen con icono */}
                    <div
                      style={{
                        width: "100%",
                        height: "120px",
                        background: "linear-gradient(135deg, #FFF5EB 0%, #FFE8D6 100%)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                        fontSize: "48px"
                      }}
                    >
                      🍕
                    </div>

                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "17px",
                        marginBottom: "8px",
                        color: "#1F2937",
                        lineHeight: "1.3"
                      }}
                    >
                      {p.nombre}
                    </div>

                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: "16px"
                      }}
                    >
                      ${p.precio.toFixed(2)}
                    </div>

                    <button
                      onClick={() => agregarProducto(p.id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                        border: "none",
                        borderRadius: "10px",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.2)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(0.98)";
                        e.currentTarget.style.boxShadow = "0 2px 4px -1px rgba(255, 102, 0, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(255, 102, 0, 0.2)";
                      }}
                    >
                      ➕ Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DERECHA: FORM + RESUMEN */}
          <div>
            {/* FORMULARIO */}
            <div
              className="slide-in"
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                marginBottom: "20px",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                animationDelay: "0.1s"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: "24px",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1F2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span style={{ fontSize: "24px" }}>📋</span>
                Información del Pedido
              </h3>

              {/* DIRECCIÓN */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                    display: "block"
                  }}
                >
                  📍 Dirección de entrega
                </label>

                <input
                  type="text"
                  value={form.direccionEntrega}
                  onChange={(e) =>
                    setForm({ ...form, direccionEntrega: e.target.value })
                  }
                  placeholder="Ingresa la dirección..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "2px solid #E5E7EB",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF6600";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255, 102, 0, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* OBSERVACIONES */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    display: "block"
                  }}
                >
                  📝 Observaciones
                </label>

                <textarea
                  rows="3"
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                  placeholder="Notas adicionales..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* TIPO */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    display: "block"
                  }}
                >
                  🏠 Tipo de pedido
                </label>

                <select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({ ...form, tipo: Number(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0"
                  }}
                >
                  <option value={1}>🚚 Domicilio</option>
                  <option value={2}>🏪 Mostrador</option>
                </select>
              </div>

              {/* MÉTODO DE PAGO */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    display: "block"
                  }}
                >
                  💳 Método de pago
                </label>

                <select
                  value={form.metodoPago}
                  onChange={(e) =>
                    setForm({ ...form, metodoPago: Number(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0"
                  }}
                >
                  <option value={1}>💵 Efectivo</option>
                  <option value={2}>💳 Tarjeta</option>
                </select>
              </div>
            </div>

            {/* RESUMEN */}
            <div
              className="slide-in"
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                animationDelay: "0.2s"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: "24px",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1F2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <span style={{ fontSize: "24px" }}>🧾</span>
                Resumen del pedido
              </h3>

              {detalles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                    🛒
                  </div>
                  <p style={{ margin: 0 }}>Aún no has agregado productos</p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      marginBottom: "20px"
                    }}
                  >
                    {detalles.map((d) => {
                      const prod = productos.find(
                        (p) => p.id === d.productoId
                      );

                      return (
                        <div
                          key={d.productoId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "14px",
                            background: "#F9FAFB",
                            borderRadius: "12px",
                            marginBottom: "10px",
                            border: "1px solid #E5E7EB",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#F3F4F6";
                            e.currentTarget.style.borderColor = "#D1D5DB";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#F9FAFB";
                            e.currentTarget.style.borderColor = "#E5E7EB";
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                fontSize: "14px"
                              }}
                            >
                              {prod?.nombre}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#ff8c00"
                              }}
                            >
                              ${prod?.precio} c/u
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                          >
                            <button
                              onClick={() =>
                                quitarProducto(d.productoId)
                              }
                              style={{
                                width: "32px",
                                height: "32px",
                                border: "none",
                                background: "#FEE2E2",
                                color: "#DC2626",
                                fontWeight: "700",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                fontSize: "18px"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#DC2626";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#FEE2E2";
                                e.currentTarget.style.color = "#DC2626";
                              }}
                            >
                              −
                            </button>

                            <span
                              style={{
                                fontWeight: "700",
                                fontSize: "17px",
                                width: "35px",
                                textAlign: "center",
                                color: "#1F2937"
                              }}
                            >
                              {d.cantidad}
                            </span>

                            <button
                              onClick={() =>
                                agregarProducto(d.productoId)
                              }
                              style={{
                                width: "32px",
                                height: "32px",
                                border: "none",
                                background: "#DCFCE7",
                                color: "#16A34A",
                                fontWeight: "700",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                fontSize: "18px"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#16A34A";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#DCFCE7";
                                e.currentTarget.style.color = "#16A34A";
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* TOTAL */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                      borderRadius: "16px",
                      padding: "24px",
                      textAlign: "center",
                      marginBottom: "20px",
                      boxShadow: "0 10px 15px -3px rgba(255, 102, 0, 0.3)"
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        opacity: 0.95,
                        fontSize: "14px",
                        fontWeight: "600",
                        letterSpacing: "1px",
                        textTransform: "uppercase"
                      }}
                    >
                      Total a Pagar
                    </div>
                    <div
                      style={{
                        color: "white",
                        fontSize: "40px",
                        fontWeight: "800",
                        marginTop: "8px",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      ${calcularTotal().toFixed(2)}
                    </div>
                  </div>

                  {/* BOTÓN REGISTRAR */}
                  <button
                    onClick={registrarPedido}
                    style={{
                      width: "100%",
                      padding: "18px",
                      border: "none",
                      borderRadius: "14px",
                      fontWeight: "700",
                      fontSize: "16px",
                      cursor: "pointer",
                      color: "white",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(16, 185, 129, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(16, 185, 129, 0.3)";
                    }}
                  >
                    ✔ Registrar Pedido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntradaPedidos;
