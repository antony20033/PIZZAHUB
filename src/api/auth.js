import callApi from "../utils/apiProxy";

export const loginRequest = async (email, password) => {
  const response = await callApi(`/api/v1/auth/login`, {
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
