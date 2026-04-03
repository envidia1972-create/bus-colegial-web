import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const estadosValidos = ["pendiente", "confirmado", "activado", "rechazado"];

const estadoColores = {
  pendiente: { bg: "#fef3c7", color: "#92400e" },
  confirmado: { bg: "#dbeafe", color: "#1d4ed8" },
  activado: { bg: "#dcfce7", color: "#166534" },
  rechazado: { bg: "#fee2e2", color: "#991b1b" },
};

export default function AdminPanel() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const cargarSolicitudes = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("solicitudes_transporte")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    } else {
      setSolicitudes(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const enviarCorreoEstado = async (solicitud, nuevoEstado) => {
    try {
      const resp = await fetch("/api/notificar-estudiante", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero_cupo: solicitud.numero_cupo,
          estudiante_nombre: solicitud.estudiante_nombre,
          correo_estudiante: solicitud.correo_estudiante,
          estado: nuevoEstado,
          ruta: solicitud.ruta,
          bus_asignado: solicitud.bus_asignado,
          tipo_servicio: solicitud.tipo_servicio,
          precio_anual: solicitud.precio_anual,
          cuota_mensual: solicitud.cuota_mensual,
        }),
      });

      const result = await resp.json();

      if (!resp.ok) {
        console.warn("Falló correo al estudiante:", result);
      }
    } catch (error) {
      console.warn("No se pudo enviar correo al estudiante:", error);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    if (!estadosValidos.includes(nuevoEstado)) {
      alert("Estado inválido");
      return;
    }

    const solicitudActual = solicitudes.find((item) => item.id === id);
    if (!solicitudActual) return;

    const { error } = await supabase
      .from("solicitudes_transporte")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("❌ Error actualizando estado: " + error.message);
      return;
    }

    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: nuevoEstado } : item
      )
    );

    await enviarCorreoEstado(solicitudActual, nuevoEstado);
  };

  const eliminarSolicitud = async (id, numeroCupo) => {
    const confirmar = window.confirm(`¿Eliminar la solicitud ${numeroCupo}?`);
    if (!confirmar) return;

    const { error } = await supabase
      .from("solicitudes_transporte")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("❌ Error eliminando: " + error.message);
      return;
    }

    setSolicitudes((prev) => prev.filter((item) => item.id !== id));
  };

  const solicitudesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return solicitudes.filter((sol) => {
      const cumpleBusqueda =
        !texto ||
        (sol.numero_cupo || "").toLowerCase().includes(texto) ||
        (sol.estudiante_nombre || "").toLowerCase().includes(texto) ||
        (sol.acudiente_nombre || "").toLowerCase().includes(texto);

      const cumpleEstado =
        filtroEstado === "todos" || (sol.estado || "pendiente") === filtroEstado;

      return cumpleBusqueda && cumpleEstado;
    });
  }, [solicitudes, busqueda, filtroEstado]);

  if (loading) return <p style={{ padding: 20 }}>Cargando solicitudes...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel de Administración V3.5 ULTRA PRO</h2>

      {errorMsg && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Error: {errorMsg}
        </p>
      )}

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por cupo, estudiante o acudiente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.input}
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="activado">Activado</option>
          <option value="rechazado">Rechazado</option>
        </select>

        <button onClick={cargarSolicitudes} style={styles.refreshBtn}>
          Refrescar
        </button>
      </div>

      <p style={{ marginBottom: "16px", fontWeight: "bold" }}>
        Total visibles: {solicitudesFiltradas.length}
      </p>

      <div style={{ display: "grid", gap: "16px" }}>
        {solicitudesFiltradas.map((sol) => {
          const estado = sol.estado || "pendiente";
          const colores = estadoColores[estado] || { bg: "#f3f4f6", color: "#111827" };

          return (
            <div key={sol.id} style={styles.card}>
              <div style={styles.headerRow}>
                <div>
                  <p><strong>Cupo:</strong> {sol.numero_cupo}</p>
                  <p><strong>Estudiante:</strong> {sol.estudiante_nombre}</p>
                </div>

                <span
                  style={{
                    background: colores.bg,
                    color: colores.color,
                    padding: "8px 12px",
                    borderRadius: "999px",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    height: "fit-content",
                  }}
                >
                  {estado}
                </span>
              </div>

              <p><strong>Grado:</strong> {sol.grado}</p>
              <p><strong>Sección:</strong> {sol.seccion}</p>
              <p><strong>Acudiente:</strong> {sol.acudiente_nombre}</p>
              <p><strong>Teléfono:</strong> {sol.telefono}</p>
              <p><strong>Correo estudiante:</strong> {sol.correo_estudiante}</p>
              <p><strong>Dirección:</strong> {sol.direccion}</p>
              <p><strong>Ruta:</strong> {sol.ruta}</p>
              <p><strong>Bus escogido:</strong> {sol.bus_asignado}</p>
              <p><strong>Tipo servicio:</strong> {sol.tipo_servicio}</p>
              <p><strong>Precio anual:</strong> ${Number(sol.precio_anual || 0).toFixed(2)}</p>
              <p><strong>10 cuotas:</strong> ${Number(sol.cuota_mensual || 0).toFixed(2)}</p>
              <p><strong>Nota adicional:</strong> {sol.nota_adicional || "Sin nota"}</p>

              <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>
                Estado del cupo:
              </label>

              <select
                value={estado}
                onChange={(e) => actualizarEstado(sol.id, e.target.value)}
                style={styles.select}
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="activado">Activado</option>
                <option value="rechazado">Rechazado</option>
              </select>

              <button
                onClick={() => eliminarSolicitud(sol.id, sol.numero_cupo)}
                style={styles.deleteBtn}
              >
                Eliminar solicitud
              </button>
            </div>
          );
        })}

        {solicitudesFiltradas.length === 0 && (
          <div style={styles.emptyBox}>
            No hay resultados con ese filtro o búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr 220px 140px",
    gap: "12px",
    marginBottom: "18px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  refreshBtn: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#0f766e",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "16px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  deleteBtn: {
    marginTop: "14px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#b91c1c",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  emptyBox: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    border: "1px dashed #ccc",
  },
};