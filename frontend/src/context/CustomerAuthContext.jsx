import { createContext, useContext, useState, useEffect } from "react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/customer/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setCustomer(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    setCustomer(data);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/customer/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    setCustomer(data);
    return data;
  };

  const logout = async () => {
    await fetch(`${API}/customer/logout`, { method: "POST", credentials: "include" });
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
