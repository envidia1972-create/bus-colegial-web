import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import ClienteForm from "./ClienteForm";
import AdminGate from "./AdminGate";

function Header() {
  const location = useLocation();

  return (
    <div style={styles.headerWrap}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚌 Transporte Colegial</h1>
          <p style={styles.subtitle}>
            Contratación del servicio y gestión administrativa
          </p>
        </div>

        <div style={styles.nav}>
          <Link
            to="/"
            style={{
              ...styles.navBtn,
              ...(location.pathname === "/" ? styles.navBtnActive : {}),
            }}
          >
            Portal Cliente
          </Link>

          <Link
            to="/admin"
            style={{
              ...styles.navBtn,
              ...(location.pathname.startsWith("/admin")
                ? styles.navBtnActive
                : {}),
            }}
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={styles.appBg}>
      <Header />
      <div style={styles.page}>
        <Routes>
          <Route path="/" element={<ClienteForm />} />
          <Route path="/admin" element={<AdminGate />} />
        </Routes>
      </div>
    </div>
  );
}

const styles = {
  appBg: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },
  headerWrap: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  nav: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  navBtn: {
    textDecoration: "none",
    background: "#e5e7eb",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "14px",
  },
  navBtnActive: {
    background: "#111827",
    color: "#ffffff",
  },
  page: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
};