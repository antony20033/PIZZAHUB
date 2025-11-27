import { API_BASE_URL } from "../config/api";

/**
 * Obtener información del empleado actual
 * Busca el empleado asociado al usuario logueado
 */
export const getMiEmpleado = async (token, userId) => {
  const response = await fetch(`${API_BASE_URL}/api/Empleados`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener información del empleado");
  }

  const empleados = await response.json();
  
  // Si se proporciona userId, buscar el empleado que coincida
  if (userId && empleados.length > 0) {
    const empleado = empleados.find(e => e.usuarioId === userId);
    return empleado || null;
  }
  
  // Si no hay userId o no se encuentra, retornar el primero
  return empleados.length > 0 ? empleados[0] : null;
};

/**
 * Obtener todos los empleados
 */
export const getEmpleados = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/Empleados`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener empleados");
  }

  return response.json();
};
