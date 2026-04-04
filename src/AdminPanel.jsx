import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

export default function AdminPanel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [actualizandoId, setActualizandoId] = useState(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("solicitudes_bus")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setData(data || []);
    } catch (err) {
      setError(err.message || "Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      setActualizandoId(id);

      const payload = { estado: nuevoEstado };

      const { error } = await supabase
        .from("solicitudes_bus")
        .update(payload)
        .eq("id", id);

      if (error) throw error;

      await cargarSolicitudes();
    } catch (err) {
      alert(err.message || "Error actualizando estado");
    } finally {
      setActualizandoId(null);
    }
  };

  const filtradas = useMemo(() => {
    return data.filter((item) => {
      const texto = busqueda.toLowerCase();

      const coincideTexto =
        !texto ||
        String(item.estudiante_nombre || "").toLowerCase().includes(texto) ||
        String(item.acudiente_nombre || "").toLowerCase().includes(texto) ||
        String(item.numero_cupo || "").toLowerCase().includes(texto) ||
        String(item.email || "").toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === "todos" ||
        String(item.estado || "").toLowerCase() === filtroEstado.toLowerCase();

      return coincideTexto && coincideEstado;
    });
  }, [data, busqueda, filtroEstado]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Panel Administrativo</h1>
            <p style={styles.subtitle}>Gestione las solicitudes de transporte escolar</p>
          </div>
          <button onClick={cargarSolicitudes} style={styles.reloadBtn}>
            Recargar
          </button>
        </div>

        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Buscar por estudiante, acudiente, cupo o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.search}
          />

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={styles.select}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="activo">Activo</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>

        {loading && <div style={styles.infoBox}>Cargando solicitudes...</div>}
        {error && <div style={styles.errorBox}>❌ {error}</div>}

        {!loading && !error && (
          <>
            <div style={styles.infoBox}>
              Total: <strong>{filtradas.length}</strong> solicitud(es)
            </div>

            <div style={styles.grid}>
              {filtradas.map((item) => (
                <div key={item.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <div style={styles.cupo}>{item.numero_cupo || "Sin cupo"}</div>
                      <div style={styles.estudiante}>{item.estudiante_nombre || "Sin nombre"}</div>
                    </div>

                    <span style={badgeStyle(item.estado)}>
                      {String(item.estado || "pendiente").toUpperCase()}
                    </span>
                  </div>

                  <div style={styles.cardGrid}>
                    <Item label="Acudiente" value={item.acudiente_nombre} />
                    <Item label="Teléfono" value={item.telefono} />
                    <Item label="Email" value={item.email} />
                    <Item label="Cédula" value={item.estudiante_cedula} />
                    <Item label="Grado" value={item.grado} />
                    <Item label="Dirección" value={item.direccion} />
                    <Item label="Ruta" value={item.ruta_id} />
                    <Item label="Bus asignado" value={item.bus_asignado} />
                    <Item label="Tipo servicio" value={item.tipo_servicio} />
                    <Item label="Precio anual" value={`$${item.precio_anual ?? 0}`} />
                    <Item label="Cuota mensual" value={`$${item.cuota_mensual ?? 0}`} />
                  </div>

                  <div style={styles.actions}>
                    <button
                      disabled={actualizandoId === item.id}
                      onClick={() => actualizarEstado(item.id, "aprobado")}
                      style={{ ...styles.btn, background: "#f59e0b" }}
                    >
                      Aprobar
                    </button>

                    <button
                      disabled={actualizandoId === item.id}
                      onClick={() => actualizarEstado(item.id, "activo")}
                      style={{ ...styles.btn, background: "#16a34a" }}
                    >
                      Activar
                    </button>

                    <button
                      disabled={actualizandoId === item.id}
                      onClick={() => actualizarEstado(item.id, "rechazado")}
                      style={{ ...styles.btn, background: "#dc2626" }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtradas.length === 0 && (
              <div style={styles.infoBox}>No hay solicitudes con esos filtros.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div style={styles.item}>
      <div style={styles.itemLabel}>{label}</div>
      <div style={styles.itemValue}>{value || "-"}</div>
    </div>
  );
}

function badgeStyle(estado) {
  const e = String(estado || "").toLowerCase();

  let bg = "#e2e8f0";
  let color = "#334155";

  if (e === "pendiente") {
    bg = "#fef3c7";
    color = "#92400e";
  }
  if (e === "aprobado") {
    bg = "#dbeafe";
    color = "#1d4ed8";
  }
  if (e === "activo") {
    bg = "#dcfce7";
    color = "#166534";
  }
  if (e === "rechazado") {
    bg = "#fee2e2";
    color = "#991b1b";
  }

  return {
    background: bg,
    color,
    padding: "8px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800
  };
}

const styles = {
  page: {
    padding: 18
  },
  container: {
    maxWidth: 1300,
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap"
  },
  title: {
    margin: 0,
    color: "#0f172a"
  },
  subtitle: {
    marginTop: 6,
    color: "#475569"
  },
  reloadBtn: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 12,
    marginBottom: 14
  },
  search: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    fontSize: 15
  },
  select: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    fontSize: 15
  },
  infoBox: {
    background: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    border: "1px solid #e2e8f0"
  },
  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    border: "1px solid #fecaca"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 24px rgba(15,23,42,.06)",
    border: "1px solid #e2e8f0"
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 12
  },
  cupo: {
    fontWeight: 900,
    fontSize: 18,
    color: "#1d4ed8"
  },
  estudiante: {
    fontWeight: 800,
    color: "#0f172a",
    marginTop: 4
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  item: {
    background: "#f8fafc",
    borderRadius: 12,
    padding: 10
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b"
  },
  itemValue: {
    marginTop: 4,
    fontWeight: 700,
    color: "#0f172a",
    wordBreak: "break-word"
  },
  actions: {
    display: "flex",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap"
  },
  btn: {
    border: "none",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800
  }
};