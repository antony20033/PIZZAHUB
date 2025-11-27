// context/AuthProvider.jsx
import { useState } from "react";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [roles, setRoles] = useState(JSON.parse(localStorage.getItem("roles")));

  const login = (token, userData, userRoles) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("roles", JSON.stringify(userRoles));

    setToken(token);
    setUser(userData);
    setRoles(userRoles);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");

    setToken(null);
    setUser(null);
    setRoles(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, roles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
