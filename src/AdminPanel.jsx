import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfcadzabfmijelrmmfvn.supabase.co";
const supabaseAnonKey = "sb_publishable_jnWNEBKugsO1MRX6tKpDrA_L8uXoxAV";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ESTADOS = [
  "todos",
  "pendiente",
  "preinscrito",
  "aprobado",
  "activo",
  "rechazado",
];

export default function AdminPanel() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [actualizandoId, setActualizandoId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function cargarSolicitudes() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("solicitudes_bus")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando solicitudes:", error);
      setError(error.message);
      setSolicitudes([]);
    } else {
      setSolicitudes(data || []);
    }

    setLoading(false);
  }

  async function cambiarEstado(id, nuevoEstado) {
    setActualizandoId(id);
    setError("");

    const { error } = await supabase
      .from("solicitudes_bus")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando estado:", error);
      setError(error.message);
    } else {
      setSolicitudes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estado: nuevoEstado } : item
        )
      );
    }

    setActualizandoId(null);
  }

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((item) => {
      const texto = buscando.toLowerCase();

      const coincideTexto =
        (item.nombre_estudiante || "").toLowerCase().includes(texto) ||
        (item.nombre_acudiente || "").toLowerCase().includes(texto) ||
        (item.telefono || "").toLowerCase().includes(texto) ||
        (item.ruta_nombre || "").toLowerCase().includes(texto) ||
        (item.bus_asignado || "").toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === "todos" ? true : item.estado === filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }, [solicitudes, buscando, filtroEstado]);

  const resumen = useMemo(() => {
    return {
      total: solicitudes.length,
      pendiente: solicitudes.filter((s) => s.estado === "pendiente").length,
      preinscrito: solicitudes.filter((s) => s.estado === "preinscrito").length,
      aprobado: solicitudes.filter((s) => s.estado === "aprobado").length,
      activo: solicitudes.filter((s) => s.estado === "activo").length,
      rechazado: solicitudes.filter((s) => s.estado === "rechazado").length,
    };
  }, [solicitudes]);

  function formatearDinero(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    return Number(valor).toLocaleString("es-PA", {
      style: "currency",
      currency: "USD",
    });
  }

  function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-PA");
  }

  function colorEstado(estado) {
    switch (estado) {
      case "pendiente":
        return "#f59e0b";
      case "preinscrito":
        return "#3b82f6";
      case "aprobado":
        return "#10b981";
      case "activo":
        return "#059669";
      case "rechazado":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>🚍 Panel Admin - Transporte Colegial</h1>
            <p style={styles.subtitle}>
              Gestión de solicitudes, rutas, buses y estados
            </p>
          </div>

          <button onClick={cargarSolicitudes} style={styles.reloadBtn}>
            🔄 Recargar
          </button>
        </header>

        <section style={styles.cards}>
          <StatCard label="Total" value={resumen.total} />
          <StatCard label="Pendiente" value={resumen.pendiente} />
          <StatCard label="Preinscrito" value={resumen.preinscrito} />
          <StatCard label="Aprobado" value={resumen.aprobado} />
          <StatCard label="Activo" value={resumen.activo} />
          <StatCard label="Rechazado" value={resumen.rechazado} />
        </section>

        <section style={styles.filters}>
          <input
            type="text"
            placeholder="Buscar por estudiante, acudiente, teléfono, ruta o bus..."
            value={buscando}
            onChange={(e) => setBuscando(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={styles.select}
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado.toUpperCase()}
              </option>
            ))}
          </select>
        </section>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <section style={styles.tableWrapper}>
          {loading ? (
            <div style={styles.loading}>Cargando solicitudes...</div>
          ) : solicitudesFiltradas.length === 0 ? (
            <div style={styles.empty}>No hay solicitudes para mostrar.</div>
          ) : (
            <div style={styles.grid}>
              {solicitudesFiltradas.map((item) => (
                <div key={item.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={styles.studentName}>
                        {item.estudiante_nombre || "Sin nombre"}
                      </h3>
                      <p style={styles.gradeText}>
                        Grado: {item.grado || "-"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: colorEstado(item.estado),
                      }}
                    >
                      {item.estado || "sin estado"}
                    </span>
                  </div>

                  <div style={styles.infoGrid}>
                    <Info label="Acudiente" value={item.acudiente_nombre} />
                    <Info label="Teléfono" value={item.telefono} />
                    <Info label="Email" value={item.email} />
                    <Info label="Dirección" value={item.barriada + ", " + item.calle + ", " + item.casa + "."} />
                    <Info label="Ruta" value={item.ruta_nombre} />
                    <Info label="Bus asignado" value={item.bus_asignado} />
                    <Info
                      label="Precio anual"
                      value={formatearDinero(item.precio_anual)}
                    />
                    <Info
                      label="cuota_10_meses"
                      value={formatearDinero(item.cuota_10_meses)}
                    />
                    <Info
                      label="Fecha registro"
                      value={formatearFecha(item.created_at)}
                    />
                  </div>

                  <div style={styles.actions}>
                    <button
                      onClick={() => cambiarEstado(item.id, "pendiente")}
                      disabled={actualizandoId === item.id}
                      style={{ ...styles.actionBtn, background: "#f59e0b" }}
                    >
                      Pendiente
                    </button>

                    <button
                      onClick={() => cambiarEstado(item.id, "aprobado")}
                      disabled={actualizandoId === item.id}
                      style={{ ...styles.actionBtn, background: "#10b981" }}
                    >
                      Aprobar
                    </button>

                    <button
                      onClick={() => cambiarEstado(item.id, "activo")}
                      disabled={actualizandoId === item.id}
                      style={{ ...styles.actionBtn, background: "#059669" }}
                    >
                      Activar
                    </button>

                    <button
                      onClick={() => cambiarEstado(item.id, "rechazado")}
                      disabled={actualizandoId === item.id}
                      style={{ ...styles.actionBtn, background: "#ef4444" }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}:</span>
      <span style={styles.infoValue}>{value || "-"}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
  },
  reloadBtn: {
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    background: "white",
    borderRadius: "14px",
    padding: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "14px",
  },
  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "280px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  select: {
    minWidth: "180px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "white",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontWeight: "bold",
  },
  tableWrapper: {
    marginTop: "10px",
  },
  loading: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#6b7280",
  },
  empty: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    textAlign: "center",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "14px",
  },
  studentName: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },
  gradeText: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  badge: {
    color: "white",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  infoGrid: {
    display: "grid",
    gap: "8px",
    marginBottom: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "10px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: "14px",
    color: "#111827",
    wordBreak: "break-word",
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  actionBtn: {
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
  },
};