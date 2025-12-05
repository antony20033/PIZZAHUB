import callApi from "../utils/apiProxy";

/**
 * Obtener la caja abierta actual
 */
export const getCajaAbierta = async (token) => {
  const response = await callApi('/api/Caja/abierta', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null; // No hay caja abierta
  }

  if (!response.ok) {
    throw new Error("Error al obtener la caja abierta");
  }

  return response.json();
};

/**
 * Abrir una nueva caja
 */
export const abrirCaja = async (token, saldoInicial, empleadoId) => {
  const response = await callApi('/api/Caja/abrir', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      saldoInicial: parseFloat(saldoInicial),
      empleadoId: empleadoId || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al abrir la caja");
  }

  return response.json();
};

/**
 * Cerrar caja y obtener resumen
 */
export const cerrarCaja = async (token, cajaId, saldoFinal) => {
  const response = await callApi(`/api/Caja/${cajaId}/cerrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      saldoFinal: parseFloat(saldoFinal),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al cerrar la caja");
  }

  return response.json(); // Devuelve el ResumenCajaDto
};

/**
 * Obtener resumen de una caja específica
 */
export const getResumenCaja = async (token, cajaId) => {
  const response = await callApi(`/api/Caja/${cajaId}/resumen`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el resumen de la caja");
  }

  return response.json();
};

/**
 * Obtener historial de cajas
 */
export const getHistorialCajas = async (token) => {
  const response = await callApi('/api/Caja', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener el historial de cajas");
  }

  return response.json();
};
