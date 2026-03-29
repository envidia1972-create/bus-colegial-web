import React, { useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const RUTAS = [
  { id: 1, codigo: "RUTA-1", nombre: "Villa Lucre", bus: "Bus 01", precio: 850 },
  { id: 2, codigo: "RUTA-2", nombre: "Brisas del Golf", bus: "Bus 02", precio: 920 },
  { id: 3, codigo: "RUTA-3", nombre: "San Antonio", bus: "Bus 03", precio: 980 },
  { id: 4, codigo: "RUTA-4", nombre: "Cerro Viento", bus: "Bus 04", precio: 890 },
  { id: 5, codigo: "RUTA-5", nombre: "Juan Díaz", bus: "Bus 05", precio: 1050 },
];

const initialForm = {
  acudiente_nombre: "",
  acudiente_cedula: "",
  telefono: "",
  email: "",
  estudiante_nombre: "",
  estudiante_cedula: "",
  grado: "",
  barriada: "",
  calle: "",
  casa: "",
  ruta_id: "",
  comentarios: "",
};

export default function ClienteForm() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const rutaSeleccionada = useMemo(() => {
    return RUTAS.find((r) => String(r.id) === String(form.ruta_id)) || null;
  }, [form.ruta_id]);

  const precioAnual = rutaSeleccionada?.precio || 0;
  const cuota10 = precioAnual ? (precioAnual / 10).toFixed(2) : "0.00";
  const busAsignado = rutaSeleccionada?.bus || "";

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");

    try {
      if (!form.email.trim()) {
        throw new Error("El correo es obligatorio");
      }

      if (!form.ruta_id) {
        throw new Error("Debes seleccionar una ruta");
      }

      const payload = {
        acudiente_nombre: form.acudiente_nombre,
        acudiente_cedula: form.acudiente_cedula,
        telefono: form.telefono,
        email: form.email,
        estudiante_nombre: form.estudiante_nombre,
        estudiante_cedula: form.estudiante_cedula,
        grado: form.grado,
        barriada: form.barriada,
        calle: form.calle,
        casa: form.casa,
        ruta_id: Number(form.ruta_id), // importante: entero
        ruta_codigo: rutaSeleccionada?.codigo || null,
        ruta_nombre: rutaSeleccionada?.nombre || null,
        bus_asignado: busAsignado || null,
        precio_anual: precioAnual,
        cuota_10_meses: Number(cuota10),
        estado: "pendiente",
        comentarios: form.comentarios || null,
      };

      const { error } = await supabase.from("solicitudes_bus").insert([payload]);

      if (error) throw error;

      setMsg("✅ Solicitud enviada correctamente");
      setForm(initialForm);
    } catch (err) {
      setError("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚌 Solicitud de Transporte Colegial</h2>
        <p style={styles.subtitle}>
          Complete los datos del acudiente y del estudiante.
        </p>

        <form onSubmit={guardar}>
          <Section title="Datos del Acudiente" />
          <div style={styles.grid2}>
            <Input label="Nombre del acudiente" name="acudiente_nombre" value={form.acudiente_nombre} onChange={onChange} required />
            <Input label="Cédula del acudiente" name="acudiente_cedula" value={form.acudiente_cedula} onChange={onChange} />
            <Input label="Teléfono" name="telefono" value={form.telefono} onChange={onChange} required />
            <Input label="Correo electrónico" name="email" type="email" value={form.email} onChange={onChange} required />
          </div>

          <Section title="Datos del Estudiante" />
          <div style={styles.grid2}>
            <Input label="Nombre del estudiante" name="estudiante_nombre" value={form.estudiante_nombre} onChange={onChange} required />
            <Input label="Cédula del estudiante" name="estudiante_cedula" value={form.estudiante_cedula} onChange={onChange} />
            <Input label="Grado" name="grado" value={form.grado} onChange={onChange} required />
          </div>

          <Section title="Dirección" />
          <div style={styles.grid3}>
            <Input label="Barriada" name="barriada" value={form.barriada} onChange={onChange} required />
            <Input label="Calle" name="calle" value={form.calle} onChange={onChange} required />
            <Input label="Casa" name="casa" value={form.casa} onChange={onChange} required />
          </div>

          <Section title="Ruta y Asignación Automática" />
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Seleccione la ruta</label>
              <select
                name="ruta_id"
                value={form.ruta_id}
                onChange={onChange}
                style={styles.input}
                required
              >
                <option value="">-- Seleccione una ruta --</option>
                {RUTAS.map((ruta) => (
                  <option key={ruta.id} value={ruta.id}>
                    {ruta.codigo} - {ruta.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Bus asignado automáticamente</label>
              <input
                value={busAsignado}
                readOnly
                style={{ ...styles.input, background: "#f9fafb" }}
              />
            </div>
          </div>

          <div style={styles.priceBox}>
            <div style={styles.priceItem}>
              <span style={styles.priceLabel}>Precio anual</span>
              <strong>B/. {precioAnual.toFixed(2)}</strong>
            </div>
            <div style={styles.priceItem}>
              <span style={styles.priceLabel}>Prorrateado en 10 cuotas</span>
              <strong>B/. {cuota10}</strong>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={styles.label}>Comentarios (opcional)</label>
            <textarea
              name="comentarios"
              value={form.comentarios}
              onChange={onChange}
              rows={4}
              style={styles.textarea}
            />
          </div>

          {msg && <div style={styles.ok}>{msg}</div>}
          {error && <div style={styles.err}>{error}</div>}

          <button type="submit" disabled={saving} style={styles.btn}>
            {saving ? "Guardando..." : "Enviar Solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title }) {
  return <h3 style={styles.section}>{title}</h3>;
}

function Input({ label, ...props }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input {...props} style={styles.input} />
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    marginTop: 0,
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "18px",
  },
  section: {
    marginTop: "22px",
    marginBottom: "12px",
    color: "#111827",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#374151",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
    resize: "vertical",
  },
  priceBox: {
    marginTop: "16px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  priceItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  priceLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },
  ok: {
    marginTop: "16px",
    background: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "10px",
  },
  err: {
    marginTop: "16px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "10px",
  },
  btn: {
    marginTop: "18px",
    width: "100%",
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
};