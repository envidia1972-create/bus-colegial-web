import { useState } from "react";

export default function AdminGate({ children }) {
  const [ok, setOk] = useState(sessionStorage.getItem("admin_ok") === "1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASSWORD = "1234"; // 👈 cámbiala luego

  const handleLogin = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_ok", "1");
      setOk(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_ok");
    setOk(false);
    setPassword("");
  };

  if (!ok) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.title}>Acceso Administrador</h2>
          <p style={styles.subtitle}>Ingrese la contraseña para acceder al panel</p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            {error && <p style={{ color: "#dc2626", marginTop: 8 }}>{error}</p>}

            <button type="submit" style={styles.button}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.topbar}>
        <span style={{ fontWeight: 700 }}>Panel Admin</span>
        <button onClick={logout} style={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </div>
      {children}
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,.08)"
  },
  title: {
    margin: 0,
    color: "#0f172a"
  },
  subtitle: {
    color: "#475569",
    marginTop: 8,
    marginBottom: 16
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 16,
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    marginTop: 14,
    padding: 12,
    border: "none",
    borderRadius: 12,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    background: "#0f172a",
    color: "#fff"
  },
  logoutBtn: {
    border: "none",
    background: "#ef4444",
    color: "#fff",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700
  }
};