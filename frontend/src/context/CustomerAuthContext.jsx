import { createContext, useContext, useState, useEffect } from "react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerAuthContext = createContext(null);

function authHeaders() {
  const token = localStorage.getItem("pp_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pp_token");
    if (!token) { setLoading(false); return; }
    fetch(`${API}/customer/me`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setCustomer(data); setLoading(false); })
      .catch(() => { localStorage.removeItem("pp_token"); setLoading(false); });
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    localStorage.setItem("pp_token", data.token);
    setCustomer({ id: data.id, name: data.name, email: data.email });
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/customer/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    localStorage.setItem("pp_token", data.token);
    setCustomer({ id: data.id, name: data.name, email: data.email });
    return data;
  };

  const logout = async () => {
    localStorage.removeItem("pp_token");
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout, authHeaders }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}

export { authHeaders };
