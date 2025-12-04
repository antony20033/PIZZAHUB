import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

const useNewPedidos = (enabled = true, intervalo = 30000) => { // enabled controla si está activo
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const [hayNuevos, setHayNuevos] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  // Inicializar el audio (opcional)
  useEffect(() => {
    // Puedes usar un sonido de notificación
    audioRef.current = new Audio('/notification.mp3'); // Coloca un archivo de sonido en public/
    audioRef.current.volume = 0.5;
  }, []);

  const fetchPedidosPendientes = async () => {
    if (!enabled) return; // No consultar si está desactivado

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/api/PedidosNew/estado/Pendiente`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener pedidos');
      }

      const data = await response.json();
      const nuevaCantidad = data.length;

      // Obtener el último conteo guardado
      const ultimoConteo = parseInt(localStorage.getItem('ultimoConteoPedidos') || '0', 10);

      // Si hay más pedidos que antes, hay nuevos
      if (nuevaCantidad > ultimoConteo) {
        setHayNuevos(true);
        
        // Reproducir sonido (opcional)
        if (audioRef.current && ultimoConteo > 0) {
          audioRef.current.play().catch(err => console.log('Error al reproducir sonido:', err));
        }
      }

      setPedidosPendientes(nuevaCantidad);
      localStorage.setItem('ultimoConteoPedidos', nuevaCantidad.toString());

    } catch (error) {
      console.error('Error al consultar pedidos pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Consultar periódicamente solo si está habilitado
  useEffect(() => {
    if (!enabled) {
      // Si se desactiva, limpiar los datos
      setPedidosPendientes(0);
      setHayNuevos(false);
      return;
    }

    fetchPedidosPendientes(); // Primera consulta inmediata

    const intervalId = setInterval(() => {
      fetchPedidosPendientes();
    }, intervalo);

    return () => clearInterval(intervalId);
  }, [enabled, intervalo]);

  // Función para marcar como vistos
  const marcarComoVistos = () => {
    setHayNuevos(false);
  };

  return {
    pedidosPendientes,
    hayNuevos,
    loading,
    marcarComoVistos,
    refrescar: fetchPedidosPendientes,
  };
};

export default useNewPedidos;