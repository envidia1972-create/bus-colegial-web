import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const estadosValidos = ["pendiente", "confirmado", "activado", "rechazado"];

export default function AdminPanel() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

  const actualizarEstado = async (id, nuevoEstado) => {
    if (!estadosValidos.includes(nuevoEstado)) {
      alert("Estado inválido");
      return;
    }

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
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando solicitudes...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel de Administración</h2>

      {errorMsg && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          Error: {errorMsg}
        </p>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {solicitudes.map((sol) => (
          <div
            key={sol.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p><strong>Cupo:</strong> {sol.numero_cupo}</p>
            <p><strong>Estudiante:</strong> {sol.estudiante_nombre}</p>
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

            <label style={{ display: "block", marginTop: "10px" }}>
              <strong>Estado del cupo:</strong>
            </label>

            <select
              value={sol.estado || "pendiente"}
              onChange={(e) => actualizarEstado(sol.id, e.target.value)}
              style={{
                marginTop: "8px",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmado">Confirmado</option>
              <option value="activado">Activado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}