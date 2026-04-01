import { useState } from "react";
import ClienteForm from "./components/ClienteForm";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [modo, setModo] = useState("cliente");
  const [clave, setClave] = useState("");
  const [adminOk, setAdminOk] = useState(false);

  const entrarAdmin = () => {
    if (clave === import.meta.env.VITE_ADMIN_PASSWORD) {
      setAdminOk(true);
    } else {
      alert("Clave incorrecta");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f4f6f8", minHeight: "100vh" }}>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Transporte Escolar IESC</h1>

        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => setModo("cliente")} style={btnStyle}>
            Cliente
          </button>
          <button onClick={() => setModo("admin")} style={btnStyle}>
            Administrador
          </button>
        </div>

        {modo === "cliente" && <ClienteForm />}

        {modo === "admin" && !adminOk && (
          <div style={loginCard}>
            <h3>Ingreso Administrador</h3>
            <input
              type="password"
              placeholder="Ingrese clave"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              style={inputStyle}
            />
            <button onClick={entrarAdmin} style={btnStyle}>
              Entrar
            </button>
          </div>
        )}

        {modo === "admin" && adminOk && <AdminPanel />}
      </div>
    </div>
  );
}

const btnStyle = {
  margin: "6px",
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#1e40af",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
  marginBottom: "12px",
};

const loginCard = {
  maxWidth: "400px",
  margin: "0 auto",
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};