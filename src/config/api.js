// En desarrollo, usar ruta relativa para que Vite haga el proxy
// En producción, usar la URL completa de la variable de entorno
export const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? '' // Ruta vacía para usar el proxy de Vite
  : (import.meta.env.VITE_API_URL || "http://localhost:5000");
