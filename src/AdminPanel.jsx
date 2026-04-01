import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function AdminPanel() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function cargarSolicitudes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("solicitudes_bus")
      .select("*")
      .order("fecha_solicitud", { ascending: false, nullsFirst: false });

    if (error) {
      console.error(error);
      alert("Error cargando solicitudes");
    } else {
      setSolicitudes(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function cambiarEstado(id, nuevoEstado) {
    const updateData = { estado: nuevoEstado };

    const { error } = await supabase
      .from("solicitudes_bus")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error actualizando estado");
      return;
    }

    cargarSolicitudes();
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Admin - Solicitudes de Transporte</h1>

      <button onClick={cargarSolicitudes} style={styles.refresh}>
        Recargar
      </button>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : solicitudes.length === 0 ? (
        <p>No hay solicitudes registradas.</p>
      ) : (
        <div style={styles.grid}>
          {solicitudes.map((s) => (
            <div key={s.id} style={styles.card}>
              <h3 style={{ marginTop: 0 }}>
                {s.numero_cupo || "Sin cupo"} - {s.estudiante_nombre}
              </h3>

              <p><b>Acudiente:</b> {s.acudiente_nombre}</p>
              <p><b>Cédula:</b> {s.acudiente_cedula}</p>
              <p><b>Teléfono:</b> {s.telefono}</p>
              <p><b>Email:</b> {s.email}</p>
              <p><b>Grado:</b> {s.grado}</p>
              <p><b>Colegio:</b> {s.colegio}</p>
              <p><b>Ruta:</b> {s.ruta}</p>
              <p><b>Bus:</b> {s.bus_asignado}</p>
              <p><b>Servicio:</b> {s.tipo_servicio}</p>
              <p><b>Precio anual:</b> ${Number(s.precio_anual || 0).toFixed(2)}</p>
              <p><b>10 cuotas:</b> ${Number(s.cuota_mensual || 0).toFixed(2)}</p>
              <p>
                <b>Estado:</b>{" "}
                <span style={badgeStyle(s.estado)}>{s.estado || "pendiente"}</span>
              </p>

              <div style={styles.actions}>
                <button onClick={() => cambiarEstado(s.id, "pendiente")} style={styles.smallBtn}>
                  Pendiente
                </button>
                <button onClick={() => cambiarEstado(s.id, "aprobado")} style={styles.smallBtn}>
                  Aprobado
                </button>
                <button onClick={() => cambiarEstado(s.id, "activado")} style={styles.smallBtn}>
                  Activado
                </button>
                <button onClick={() => cambiarEstado(s.id, "rechazado")} style={styles.smallBtnDanger}>
                  Rechazado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function badgeStyle(estado) {
  let bg = "#e5e7eb";
  let color = "#111827";

  if (estado === "pendiente") {
    bg = "#fef3c7";
    color = "#92400e";
  } else if (estado === "aprobado") {
    bg = "#dbeafe";
    color = "#1e40af";
  } else if (estado === "activado") {
    bg = "#dcfce7";
    color = "#166534";
  } else if (estado === "rechazado") {
    bg = "#fee2e2";
    color = "#991b1b";
  }

  return {
    background: bg,
    color,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  };
}

const styles = {
  wrap: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  refresh: {
    marginBottom: 20,
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginTop: 14,
  },
  smallBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  smallBtnDanger: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #fecaca",
    background: "#fff5f5",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#991b1b",
  },
};