import { useState } from "react";
import AdminPanel from "./AdminPanel";

export default function AdminGate() {
  const [clave, setClave] = useState("");
  const [ok, setOk] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "1234";

  const entrar = (e) => {
    e.preventDefault();
    if (clave === ADMIN_PASSWORD) {
      setOk(true);
    } else {
      alert("Clave incorrecta");
    }
  };

  if (ok) return <AdminPanel />;

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2>Panel Administrativo</h2>
        <p>Ingrese la clave para continuar</p>

        <form onSubmit={entrar}>
          <input
            type="password"
            placeholder="Clave de administrador"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
    padding: 20,
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    marginTop: 10,
    marginBottom: 14,
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};