import React, { useEffect, useState, useContext } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CProgress,
  CWidgetStatsC,
} from "@coreui/react";
import { CChartLine, CChartBar } from "@coreui/react-chartjs";
import CIcon from "@coreui/icons-react";
import {
  cilMoney,
  cilCalendar,
  cilChart,
  cilBasket,
  cilArrowTop,
  cilArrowBottom,
} from "@coreui/icons";
import AuthContext from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const Movimientos = () => {
  const { token } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para datos de ventas
  const [ventas, setVentas] = useState([]);
  const [ventasHoy, setVentasHoy] = useState({ total: 0, cantidad: 0 });
  const [ventasMes, setVentasMes] = useState({ total: 0, cantidad: 0 });
  const [ventasAno, setVentasAno] = useState({ total: 0, cantidad: 0 });
  const [metodosPago, setMetodosPago] = useState({});
  const [ventasMensuales, setVentasMensuales] = useState([]);
  
  // Estados para datos de inventario
  const [insumos, setInsumos] = useState([]);
  const [insumosBajoStock, setInsumosBajoStock] = useState([]);
  const [entradasLog, setEntradasLog] = useState([]);
  const [salidasLog, setSalidasLog] = useState([]);
  const [movimientosHoy, setMovimientosHoy] = useState({ entradas: 0, salidas: 0 });
  const [insumosMasUsados, setInsumosMasUsados] = useState([]);
  const [insumosEstancados, setInsumosEstancados] = useState([]);
  const [totalEntradasMes, setTotalEntradasMes] = useState(0);
  const [totalSalidasMes, setTotalSalidasMes] = useState(0);
  const [valorInventario, setValorInventario] = useState(0);

  // Función para obtener ventas
  const fetchVentas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Ventas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener ventas");
      const data = await response.json();
      setVentas(data);
      calcularAnalíticasVentas(data);
      calcularVentasMensuales(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función para obtener insumos
  const fetchInsumos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Insumos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener insumos");
      const data = await response.json();
      setInsumos(data);
      calcularValorInventario(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función para obtener insumos bajo stock
  const fetchInsumosBajoStock = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Insumos/bajo-stock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener insumos");
      const data = await response.json();
      setInsumosBajoStock(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función para obtener entradas
  const fetchEntradas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/InventarioLog/entradas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener entradas");
      const data = await response.json();
      setEntradasLog(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función para obtener salidas
  const fetchSalidas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/InventarioLog/salidas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener salidas");
      const data = await response.json();
      setSalidasLog(data);
      calcularInsumosUsados(data);
      calcularInsumosEstancados(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Calcular movimientos de hoy
  const calcularMovimientosHoy = (entradas, salidas) => {
    const hoy = new Date().toDateString();
    
    const entradasHoy = entradas.filter(
      (mov) => new Date(mov.fecha).toDateString() === hoy
    ).length;
    
    const salidasHoy = salidas.filter(
      (mov) => new Date(mov.fecha).toDateString() === hoy
    ).length;

    setMovimientosHoy({ entradas: entradasHoy, salidas: salidasHoy });
  };

  // Calcular entradas y salidas del mes
  const calcularMovimientosMes = (entradas, salidas) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const entradasMes = entradas.filter(
      (mov) => new Date(mov.fecha) >= inicioMes
    ).length;

    const salidasMes = salidas.filter(
      (mov) => new Date(mov.fecha) >= inicioMes
    ).length;

    setTotalEntradasMes(entradasMes);
    setTotalSalidasMes(salidasMes);
  };

  // Calcular insumos más usados
  const calcularInsumosUsados = (salidas) => {
    const conteo = {};
    
    salidas.forEach((salida) => {
      const insumoId = salida.insumoId;
      const nombre = salida.insumo?.nombre || "Desconocido";
      
      if (!conteo[insumoId]) {
        conteo[insumoId] = { nombre, cantidad: 0 };
      }
      conteo[insumoId].cantidad += salida.cantidad;
    });

    const top5 = Object.entries(conteo)
      .sort(([, a], [, b]) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    setInsumosMasUsados(top5);
  };

  // Calcular insumos estancados (sin movimiento en 30 días)
  const calcularInsumosEstancados = (salidas) => {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const insumosConMovimiento = new Set(
      salidas
        .filter((s) => new Date(s.fecha) >= hace30Dias)
        .map((s) => s.insumoId)
    );

    const estancados = insumos
      .filter((insumo) => !insumosConMovimiento.has(insumo.id))
      .slice(0, 5);

    setInsumosEstancados(estancados);
  };

  // Calcular valor total del inventario
  const calcularValorInventario = (insumosData) => {
    // Nota: Esto asume que los insumos tienen un campo 'precio'
    // Si no existe, se puede calcular basándose en compras
    const total = insumosData.reduce((sum, insumo) => {
      const precio = insumo.precio || 0; // Si no hay precio, se asume 0
      return sum + (insumo.stockActual * precio);
    }, 0);

    setValorInventario(total);
  };

  // Calcular analíticas de ventas
  const calcularAnalíticasVentas = (ventasData) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAno = new Date(hoy.getFullYear(), 0, 1);

    let totalHoy = 0, cantidadHoy = 0;
    let totalMes = 0, cantidadMes = 0;
    let totalAno = 0, cantidadAno = 0;
    const metodosCount = {};

    ventasData.forEach((venta) => {
      const fechaVenta = new Date(venta.fechaVenta);
      const esHoy = fechaVenta.toDateString() === hoy.toDateString();
      const esMes = fechaVenta >= inicioMes;
      const esAno = fechaVenta >= inicioAno;

      if (esHoy) {
        totalHoy += venta.total;
        cantidadHoy++;
      }
      if (esMes) {
        totalMes += venta.total;
        cantidadMes++;
      }
      if (esAno) {
        totalAno += venta.total;
        cantidadAno++;
      }

      const metodo = venta.metodoPago || "No especificado";
      metodosCount[metodo] = (metodosCount[metodo] || 0) + venta.total;
    });

    setVentasHoy({ total: totalHoy, cantidad: cantidadHoy });
    setVentasMes({ total: totalMes, cantidad: cantidadMes });
    setVentasAno({ total: totalAno, cantidad: cantidadAno });
    setMetodosPago(metodosCount);
  };

  // Calcular ventas mensuales para gráfica (últimos 12 meses)
  const calcularVentasMensuales = (ventasData) => {
    const hoy = new Date();
    const meses = [];
    const totales = [];

    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const nombreMes = fecha.toLocaleDateString("es-MX", { month: "short" });
      
      const totalMes = ventasData
        .filter((v) => {
          const fechaVenta = new Date(v.fechaVenta);
          return (
            fechaVenta.getFullYear() === fecha.getFullYear() &&
            fechaVenta.getMonth() === fecha.getMonth()
          );
        })
        .reduce((sum, v) => sum + v.total, 0);

      meses.push(nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1));
      totales.push(totalMes);
    }

    setVentasMensuales({ labels: meses, data: totales });
  };

  // Cargar datos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        await fetchVentas();
        await fetchInsumos();
        await fetchInsumosBajoStock();
        const entradas = await fetchEntradas();
        const salidas = await fetchSalidas();
        
        // Esperar a que se carguen entradas y salidas
        Promise.all([
          fetch(`${API_BASE_URL}/api/InventarioLog/entradas`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/InventarioLog/salidas`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json())
        ]).then(([entradasData, salidasData]) => {
          calcularMovimientosHoy(entradasData, salidasData);
          calcularMovimientosMes(entradasData, salidasData);
        });
        
      } catch (err) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Efecto para calcular estancados cuando cambien insumos
  useEffect(() => {
    if (insumos.length > 0 && salidasLog.length > 0) {
      calcularInsumosEstancados(salidasLog);
    }
  }, [insumos, salidasLog]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <CSpinner color="primary" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <CAlert color="danger" className="m-4">
        {error}
      </CAlert>
    );
  }

  const calcularPorcentajeStock = (actual, minimo) => {
    if (minimo === 0) return 100;
    return Math.min((actual / minimo) * 100, 100);
  };

  return (
    <div className="page-container" style={{ background: "#F3F4F6", minHeight: "100vh", width: "100%", maxWidth: "100%", margin: 0 }}>
      {/* ========== SECCIÓN: RESUMEN GENERAL ========== */}
      <CRow xs={{ gutter: 4 }} className="mb-4" style={{ width: "100%", margin: 0 }}>
        <CCol sm={6} lg={3}>
          <CWidgetStatsC
            icon={<CIcon icon={cilMoney} height={36} />}
            value={`$${ventasHoy.total.toFixed(2)}`}
            title="Ventas Hoy"
            progress={{ color: "success", value: 75 }}
            text={`${ventasHoy.cantidad} transacciones`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsC
            icon={<CIcon icon={cilCalendar} height={36} />}
            value={`$${ventasMes.total.toFixed(2)}`}
            title="Ventas del Mes"
            progress={{ color: "info", value: 75 }}
            text={`${ventasMes.cantidad} transacciones`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsC
            icon={<CIcon icon={cilChart} height={36} />}
            value={`$${ventasAno.total.toFixed(2)}`}
            title="Ventas del Año"
            progress={{ color: "warning", value: 75 }}
            text={`${ventasAno.cantidad} transacciones`}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsC
            icon={<CIcon icon={cilBasket} height={36} />}
            value={movimientosHoy.entradas + movimientosHoy.salidas}
            title="Movimientos Hoy"
            progress={{ color: "primary", value: 75 }}
            text={`${movimientosHoy.entradas} entradas / ${movimientosHoy.salidas} salidas`}
          />
        </CCol>
      </CRow>

      {/* ========== SECCIÓN: ANÁLISIS DE VENTAS ========== */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="bg-primary text-white">
              <strong>📈 ANÁLISIS DE VENTAS</strong>
            </CCardHeader>
            <CCardBody>
              {/* Gráfica de ventas mensuales */}
              <CRow className="mb-4">
                <CCol xs={12}>
                  <h5 className="mb-3">Ventas de los Últimos 12 Meses</h5>
                  {ventasMensuales.labels && (
                    <CChartLine
                      style={{ height: "300px" }}
                      data={{
                        labels: ventasMensuales.labels,
                        datasets: [
                          {
                            label: "Ventas Mensuales",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            borderColor: "rgba(59, 130, 246, 1)",
                            pointBackgroundColor: "rgba(59, 130, 246, 1)",
                            pointBorderColor: "#fff",
                            data: ventasMensuales.data,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                          y: {
                            ticks: {
                              callback: function(value) {
                                return '$' + value.toFixed(2);
                              }
                            }
                          },
                        },
                      }}
                    />
                  )}
                </CCol>
              </CRow>

              <hr />

              {/* Métodos de pago */}
              <CRow>
                <CCol xs={12} md={6}>
                  <h6 className="mb-3">Ventas por Método de Pago</h6>
                  {Object.entries(metodosPago)
                    .sort(([, a], [, b]) => b - a)
                    .map(([metodo, total]) => {
                      const totalGeneral = Object.values(metodosPago).reduce(
                        (sum, val) => sum + val,
                        0
                      );
                      const porcentaje = (total / totalGeneral) * 100;

                      return (
                        <div className="progress-group mb-4" key={metodo}>
                          <div className="progress-group-prepend">
                            <span className="text-body-secondary small">
                              {metodo === "Efectivo" && "💵 "}
                              {metodo === "Tarjeta" && "💳 "}
                              {metodo === "Transferencia" && "🏦 "}
                              {metodo}
                            </span>
                          </div>
                          <div className="progress-group-bars">
                            <CProgress thin color="success" value={porcentaje} />
                          </div>
                        </div>
                      );
                    })}
                </CCol>

                <CCol xs={12} md={6}>
                  <h6 className="mb-3">Resumen por Método</h6>
                  {Object.entries(metodosPago)
                    .sort(([, a], [, b]) => b - a)
                    .map(([metodo, total]) => (
                      <div className="progress-group mb-3" key={`resumen-${metodo}`}>
                        <div className="progress-group-header">
                          <span className="fw-semibold">
                            {metodo === "Efectivo" && "💵"}
                            {metodo === "Tarjeta" && "💳"}
                            {metodo === "Transferencia" && "🏦"}
                            {` ${metodo}`}
                          </span>
                          <span className="ms-auto fw-semibold">
                            ${total.toFixed(2)}{" "}
                            <span className="text-body-secondary small">
                              ({((total / ventasMes.total) * 100).toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ========== SECCIÓN: ANÁLISIS DE INVENTARIO ========== */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="bg-success text-white">
              <strong>📦 ANÁLISIS DE INVENTARIO</strong>
            </CCardHeader>
            <CCardBody>
              {/* KPIs de inventario */}
              <CRow className="mb-4">
                <CCol xs={12} sm={6} lg={3}>
                  <div className="border-start border-start-4 border-start-success py-2 px-3 mb-3">
                    <div className="text-body-secondary text-truncate small">
                      Entradas del Mes
                    </div>
                    <div className="fs-4 fw-semibold">{totalEntradasMes}</div>
                  </div>
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <div className="border-start border-start-4 border-start-warning py-2 px-3 mb-3">
                    <div className="text-body-secondary text-truncate small">
                      Salidas del Mes
                    </div>
                    <div className="fs-4 fw-semibold">{totalSalidasMes}</div>
                  </div>
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <div className="border-start border-start-4 border-start-info py-2 px-3 mb-3">
                    <div className="text-body-secondary text-truncate small">
                      Total Insumos
                    </div>
                    <div className="fs-4 fw-semibold">{insumos.length}</div>
                  </div>
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <div className="border-start border-start-4 border-start-primary py-2 px-3 mb-3">
                    <div className="text-body-secondary text-truncate small">
                      Valor Inventario
                    </div>
                    <div className="fs-4 fw-semibold">
                      {valorInventario > 0 ? `$${valorInventario.toFixed(2)}` : "N/A"}
                    </div>
                  </div>
                </CCol>
              </CRow>

              <hr />

              {/* Insumos más usados y estancados */}
              <CRow className="mb-4">
                <CCol xs={12} md={6}>
                  <h6 className="mb-3">🔥 Top 5 Insumos Más Usados</h6>
                  {insumosMasUsados.length > 0 ? (
                    <CTable small hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>#</CTableHeaderCell>
                          <CTableHeaderCell>Insumo</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Salidas</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {insumosMasUsados.map((insumo, index) => (
                          <CTableRow key={insumo.id}>
                            <CTableDataCell>
                              <CBadge color="success">{index + 1}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>{insumo.nombre}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              <strong>{insumo.cantidad}</strong> unidades
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : (
                    <div className="text-center text-muted py-3">
                      No hay datos de salidas
                    </div>
                  )}
                </CCol>

                <CCol xs={12} md={6}>
                  <h6 className="mb-3">⚠️ Insumos Sin Movimiento (30 días)</h6>
                  {insumosEstancados.length > 0 ? (
                    <CTable small hover>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Insumo</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Stock</CTableHeaderCell>
                          <CTableHeaderCell>Estado</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {insumosEstancados.map((insumo) => (
                          <CTableRow key={insumo.id}>
                            <CTableDataCell>{insumo.nombre}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {insumo.stockActual}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="warning">Estancado</CBadge>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  ) : (
                    <div className="text-center text-success py-3">
                      ✅ Todos los insumos tienen movimiento reciente
                    </div>
                  )}
                </CCol>
              </CRow>

              <hr />

              {/* Alertas de stock bajo */}
              <h6 className="mb-3">🚨 Alertas de Stock Bajo o Crítico</h6>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Estado
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Insumo</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Unidad
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Stock</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Nivel de Stock
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {insumosBajoStock.length > 0 ? (
                    insumosBajoStock.map((insumo) => {
                      const porcentaje = calcularPorcentajeStock(
                        insumo.stockActual,
                        insumo.stockMinimo
                      );
                      const esCritico = insumo.stockActual < insumo.stockMinimo;

                      return (
                        <CTableRow key={insumo.id}>
                          <CTableDataCell className="text-center">
                            <CBadge color={esCritico ? "danger" : "warning"}>
                              {esCritico ? "Crítico" : "Bajo"}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="fw-semibold">{insumo.nombre}</div>
                            <div className="small text-body-secondary text-nowrap">
                              Mínimo: {insumo.stockMinimo}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CBadge color="info">{insumo.unidadMedida}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex justify-content-between text-nowrap">
                              <div className="fw-semibold">
                                {insumo.stockActual} unidades
                              </div>
                              <div className="ms-3">
                                <small className="text-body-secondary">
                                  {porcentaje.toFixed(0)}% del mínimo
                                </small>
                              </div>
                            </div>
                            <CProgress
                              thin
                              color={esCritico ? "danger" : "warning"}
                              value={porcentaje}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small text-body-secondary text-nowrap">
                              {esCritico ? "⚠️ Requiere reposición" : "⚡ Stock bajo"}
                            </div>
                            <div className="fw-semibold text-nowrap">
                              {esCritico ? (
                                <span className="text-danger">
                                  <CIcon icon={cilArrowBottom} /> Crítico
                                </span>
                              ) : (
                                <span className="text-warning">
                                  <CIcon icon={cilArrowBottom} /> Atención
                                </span>
                              )}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      );
                    })
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center py-4">
                        <div className="text-success fw-semibold">
                          <CIcon icon={cilArrowTop} size="lg" /> Todos los insumos tienen
                          stock suficiente
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Movimientos;