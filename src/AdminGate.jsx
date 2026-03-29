import React, { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";

export default function AdminGate() {
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "admin2026";
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bus_admin_ok");
    if (saved === "yes") setAllowed(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      localStorage.setItem("bus_admin_ok", "yes");
      setAllowed(true);
      setError("");
    } else {
      setError("Clave incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bus_admin_ok");
    setAllowed(false);
    setPassword("");
  };

  if (allowed) {
    return (
      <div>
        <div style={styles.topBar}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar sesión Admin
          </button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Acceso Administrativo</h2>
        <p style={styles.subtitle}>
          Ingresa la clave para abrir el panel de administración.
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Escribe la clave"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.btn}>
            Entrar al Admin
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "8px",
    marginBottom: "18px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  },
  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
};