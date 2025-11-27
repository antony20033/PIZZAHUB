const API_URL = "https://pizzahub-api.onrender.com/api/v1/auth";

export const loginRequest = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "text/plain"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Credenciales incorrectas");
  }

  return response.text(); // La API devuelve el token como string
};
