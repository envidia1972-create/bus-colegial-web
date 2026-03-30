import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import ClienteForm from "./ClienteForm";
import AdminGate from "./AdminGate";
import AdminPanel from "./AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#f5f7fb" }}>
        <Routes>
          <Route path="/" element={<ClienteForm />} />
          <Route path="/admin" element={<AdminGate><AdminPanel /></AdminGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Botón flotante opcional para entrar al admin */}
        <Link
          to="/admin"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            background: "#0f172a",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 6px 18px rgba(0,0,0,.2)"
          }}
        >
          Admin
        </Link>
      </div>
    </BrowserRouter>
  );
}