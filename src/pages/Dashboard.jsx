import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsA,
  CProgress,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPizza,
  cilBasket,
  cilChartLine,
  cilPeople,
  cilMoney,
} from '@coreui/icons';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Actualizar el reloj cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Obtener nombre del usuario del localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.nombre || 'Usuario');

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-container" style={{ width: '100%', padding: '20px', maxWidth: '100%' }}>
      {/* Banner de Bienvenida */}
      <CCard className="mb-4 welcome-banner" style={{ width: '100%' }}>
        <CCardBody>
          <CRow className="align-items-center">
            <CCol md={8}>
              <div className="welcome-content">
                <h1 className="welcome-title">
                  ¡Bienvenido a PizzaHub, {userName}! 🍕
                </h1>
                <p className="welcome-subtitle">
                  Panel de administración para gestionar tu pizzería
                </p>
                <div className="time-display">
                  <span className="current-date">{formatDate(currentTime)}</span>
                  <span className="current-time">{formatTime(currentTime)}</span>
                </div>
              </div>
            </CCol>
            <CCol md={4} className="text-center">
              <div className="pizza-animation">
                <CIcon icon={cilPizza} size="6xl" className="pizza-icon" />
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Estadísticas Rápidas */}
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={
              <>
                45
                <span className="fs-6 fw-normal ms-2">pedidos</span>
              </>
            }
            title="Pedidos de Hoy"
            action={
              <CIcon icon={cilBasket} height={24} />
            }
            chart={
              <div className="mt-3 mb-0">
                <CProgress
                  color="success"
                  height={4}
                  value={75}
                />
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="info"
            value={
              <>
                $12,350
                <span className="fs-6 fw-normal ms-2">MXN</span>
              </>
            }
            title="Ventas del Día"
            action={
              <CIcon icon={cilMoney} height={24} />
            }
            chart={
              <div className="mt-3 mb-0">
                <CProgress
                  color="success"
                  height={4}
                  value={85}
                />
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="warning"
            value={
              <>
                12
                <span className="fs-6 fw-normal ms-2">activos</span>
              </>
            }
            title="Pedidos en Proceso"
            action={
              <CIcon icon={cilChartLine} height={24} />
            }
            chart={
              <div className="mt-3 mb-0">
                <CProgress
                  color="warning"
                  height={4}
                  value={60}
                />
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="danger"
            value={
              <>
                8
                <span className="fs-6 fw-normal ms-2">disponibles</span>
              </>
            }
            title="Repartidores"
            action={
              <CIcon icon={cilPeople} height={24} />
            }
            chart={
              <div className="mt-3 mb-0">
                <CProgress
                  color="success"
                  height={4}
                  value={90}
                />
              </div>
            }
          />
        </CCol>
      </CRow>

      {/* Sección de Acciones Rápidas */}
      <CRow>
        <CCol md={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Acciones Rápidas</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={3} className="mb-3">
                  <div className="quick-action-card">
                    <CIcon icon={cilBasket} size="3xl" className="mb-2 text-primary" />
                    <h5>Nuevo Pedido</h5>
                    <p className="text-muted">Registra un nuevo pedido</p>
                  </div>
                </CCol>
                <CCol md={3} className="mb-3">
                  <div className="quick-action-card">
                    <CIcon icon={cilChartLine} size="3xl" className="mb-2 text-info" />
                    <h5>Ver Estadísticas</h5>
                    <p className="text-muted">Analiza tus ventas</p>
                  </div>
                </CCol>
                <CCol md={3} className="mb-3">
                  <div className="quick-action-card">
                    <CIcon icon={cilPizza} size="3xl" className="mb-2 text-warning" />
                    <h5>Productos</h5>
                    <p className="text-muted">Gestiona tu menú</p>
                  </div>
                </CCol>
                <CCol md={3} className="mb-3">
                  <div className="quick-action-card">
                    <CIcon icon={cilPeople} size="3xl" className="mb-2 text-danger" />
                    <h5>Empleados</h5>
                    <p className="text-muted">Administra tu equipo</p>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Sección de Información */}
      <CRow>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Pedidos Recientes</strong>
            </CCardHeader>
            <CCardBody>
              <div className="recent-orders">
                <div className="order-item">
                  <div className="order-info">
                    <span className="order-number">#001</span>
                    <span className="order-customer">Juan Pérez</span>
                  </div>
                  <span className="badge bg-warning">En preparación</span>
                </div>
                <div className="order-item">
                  <div className="order-info">
                    <span className="order-number">#002</span>
                    <span className="order-customer">María González</span>
                  </div>
                  <span className="badge bg-info">En camino</span>
                </div>
                <div className="order-item">
                  <div className="order-info">
                    <span className="order-number">#003</span>
                    <span className="order-customer">Carlos López</span>
                  </div>
                  <span className="badge bg-success">Entregado</span>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Productos Más Vendidos</strong>
            </CCardHeader>
            <CCardBody>
              <div className="top-products">
                <div className="product-item">
                  <div className="product-info">
                    <CIcon icon={cilPizza} className="me-2 text-primary" />
                    <span className="product-name">Pizza Hawaiana</span>
                  </div>
                  <span className="product-count">24 vendidas</span>
                </div>
                <div className="product-item">
                  <div className="product-info">
                    <CIcon icon={cilPizza} className="me-2 text-danger" />
                    <span className="product-name">Pizza Pepperoni</span>
                  </div>
                  <span className="product-count">18 vendidas</span>
                </div>
                <div className="product-item">
                  <div className="product-info">
                    <CIcon icon={cilPizza} className="me-2 text-warning" />
                    <span className="product-name">Pizza Mexicana</span>
                  </div>
                  <span className="product-count">15 vendidas</span>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default Dashboard;
