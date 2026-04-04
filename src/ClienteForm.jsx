import { useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

/**
 * ⚠️ IMPORTANTE:
 * Ajusta estas rutas, buses y precios a tus valores reales
 * - precioAnual = precio base para servicio COMPLETO
 * - Si elige solo recoger o solo llevar => precioAnual - 100
 */
const RUTAS = [
  { codigo: "RUTA-1", nombre: "Ruta 1 - Bella Vista", bus: "BUS-01", precioAnual: 1200 },
  { codigo: "RUTA-2", nombre: "Ruta 2 - El Cangrejo", bus: "BUS-02", precioAnual: 1300 },
  { codigo: "RUTA-3", nombre: "Ruta 3 - Vía España", bus: "BUS-03", precioAnual: 1400 },
  { codigo: "RUTA-4", nombre: "Ruta 4 - Tumba Muerto", bus: "BUS-04", precioAnual: 1500 }
];

const TIPOS_SERVICIO = [
  { value: "Completo", label: "Completo (ida y vuelta)" },
  { value: "Solo recoger en casa", label: "Solo recoger en casa" },
  { value: "Solo llevar a casa", label: "Solo llevar a casa" }
];

export default function ClienteForm() {
  const [form, setForm] = useState({
    acudiente_nombre: "",
    estudiante_cedula: "",
    telefono: "",
    email: "",
    estudiante_nombre: "",
    grado: "",
    direccion: "",
    ruta_id: "",
    nota_adicional: "",
    tipo_servicio: "Completo"
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [ultimoCupo, setUltimoCupo] = useState("");

  const rutaSeleccionada = useMemo(
    () => RUTAS.find((r) => r.codigo === form.ruta_id),
    [form.ruta_id]
  );

  const precioCalculado = useMemo(() => {
    if (!rutaSeleccionada) return 0;

    let precio = Number(rutaSeleccionada.precioAnual) || 0;

    if (
      form.tipo_servicio === "Solo recoger en casa" ||
      form.tipo_servicio === "Solo llevar a casa"
    ) {
      precio = Math.max(0, precio - 100);
    }

    return precio;
  }, [rutaSeleccionada, form.tipo_servicio]);

  const cuotaMensual = useMemo(() => {
    return precioCalculado > 0 ? (precioCalculado / 10).toFixed(2) : "0.00";
  }, [precioCalculado]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const generarNumeroCupo = async () => {
    const year = new Date().getFullYear();

    const { count, error } = await supabase
      .from("solicitudes_bus")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const siguiente = (count || 0) + 1;
    return `CUP-${year}-${String(siguiente).padStart(4, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");
    setUltimoCupo("");

    try {
      if (!rutaSeleccionada) {
        throw new Error("Debe seleccionar una ruta.");
      }

      const numeroCupo = await generarNumeroCupo();

      const payload = {
        // Mantén estas columnas alineadas con tu tabla REAL
        acudiente_nombre: form.acudiente_nombre,
        estudiante_cedula: form.estudiante_cedula,
        telefono: form.telefono,
        email: form.email,
        estudiante_nombre: form.estudiante_nombre,
        nota_adicional: form.nota_adicional,
        grado: form.grado,
        direccion: form.direccion,

        // OJO: Si tu columna ruta es INTEGER, NO uses "RUTA-1"
        // Si tu tabla espera texto, deja form.ruta_id
        // Si antes te dio error con "RUTA-1", probablemente tu columna ruta es numérica.
        // En ese caso, guarda solo el número:
        ruta_id: parseInt(form.ruta_id.replace("RUTA-", ""), 10),

        bus_asignado: rutaSeleccionada.bus,
        precio_anual: precioCalculado,
        cuota_mensual: Number(cuotaMensual),
        estado: "pendiente",

        // NUEVAS COLUMNAS
        numero_cupo: numeroCupo,
        tipo_servicio: form.tipo_servicio
      };

      const { error: insertError } = await supabase
        .from("solicitudes_bus")
        .insert([payload]);

      if (insertError) throw insertError;

      setUltimoCupo(numeroCupo);
      setMensaje("Solicitud enviada correctamente.");

      setForm({
        acudiente_nombre: "",
        estudiante_cedula: "",
        telefono: "",
        email: "",
        estudiante_nombre: "",
        grado: "",
        direccion: "",
        nota_adicional: "",
        ruta_id: "",
        tipo_servicio: "Completo"
      });
    } catch (err) {
      setError(err.message || "Error al guardar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, position: "relative"}}>

<img
  src="/logo.png"
  alt="Logo Transporte"
  style={{
    position: "absolute",
    top: "18px",
    right: "18px",
    width: "65px",
    height: "65px",
    objectFit: "contain"
  }}
/>

        <div style={styles.header}>
          <h1 style={styles.title}>Contratación de Transporte Colegial del IESC</h1>
          <p style={styles.subtitle}>
            Complete el formulario para solicitar su cupo de transporte escolar
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <SectionTitle text="Datos del Acudiente" />

          <Input
            label="Nombre del acudiente"
            name="acudiente_nombre"
            value={form.acudiente_nombre}
            onChange={onChange}
            required
          />

          <Input
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={onChange}
            required
          />

          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
          />

          <SectionTitle text="Datos del Estudiante" />

          <Input
            label="Nombre del estudiante"
            name="estudiante_nombre"
            value={form.estudiante_nombre}
            onChange={onChange}
            required
          />


          <Input
            label="Cédula del estudiante"
            name="estudiante_cedula"
            value={form.estudiante_cedula}
            onChange={onChange}
          />

          <Input
            label="Grado"
            name="grado"
            value={form.grado}
            onChange={onChange}
          />

          <Input
            label="Dirección de residencia"
            name="direccion"
            value={form.direccion}
            onChange={onChange}
            required
          />

          <SectionTitle text="Ruta y Tipo de Servicio" />

          <label style={styles.label}>Ruta</label>
          <select
            name="ruta_id"
            value={form.ruta_id}
            onChange={onChange}
            style={styles.input}
            required
          >
            <option value="">Seleccione una ruta</option>
            {RUTAS.map((ruta_id) => (
              <option key={ruta_id.codigo} value={ruta_id.codigo}>
                {ruta_id.nombre} — {ruta_id.bus} — ${ruta_id.precioAnual}/año
              </option>
            ))}
          </select>

          <label style={styles.label}>Tipo de servicio</label>
          <select
            name="tipo_servicio"
            value={form.tipo_servicio}
            onChange={onChange}
            style={styles.input}
            required
          >
            {TIPOS_SERVICIO.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>

         <Input
            label="Nota adicional"
            name="nota_adicional"
            placeholder="detalles adicionales de la direccion, numero de bus si ya viaja, ect."
            value={form.nota_adicional}
            onChange={onChange}
            required
          />

          {rutaSeleccionada && (
            <div style={styles.resumen}>
              <h3 style={{ marginTop: 0, color: "#0f172a" }}>Resumen de asignación</h3>

              <div style={styles.resumenGrid}>
                <ResumenItem label="Ruta" value={rutaSeleccionada.nombre} />
                <ResumenItem label="Bus asignado" value={rutaSeleccionada.bus} />
                <ResumenItem label="Tipo de servicio" value={form.tipo_servicio} />
                <ResumenItem label="Precio anual" value={`$${precioCalculado}`} />
                <ResumenItem label="10 cuotas" value={`$${cuotaMensual}`} />
              </div>

              {(form.tipo_servicio === "Solo recoger en casa" ||
              form.tipo_servicio === "Solo llevar a casa") && (
              <p style={{ color: "#166534", marginTop: 12, fontWeight: 600 }}>
                ✅ Se aplicó descuento de $100 por servicio parcial
             </p>
             )}
            </div>
          )}

          {mensaje && (
            <div style={styles.successBox}>
              <strong>✅ {mensaje}</strong>
              {ultimoCupo && (
                <div style={{ marginTop: 8 }}>
                  <div><strong>Número de seguimiento / cupo:</strong></div>
                  <div style={styles.cupo}>{ultimoCupo}</div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <strong>❌ {error}</strong>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ text }) {
  return <h2 style={styles.sectionTitle}>{text}</h2>;
}

function Input({ label, ...props }) {
  return (
    <>
      <label style={styles.label}>{label}</label>
      <input {...props} style={styles.input} />
    </>
  );
}

function ResumenItem({ label, value }) {
  return (
    <div style={styles.resumenItem}>
      <div style={styles.resumenLabel}>{label}</div>
      <div style={styles.resumenValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 14px 80px"
  },
  card: {
    width: "100%",
    maxWidth: 860,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 12px 35px rgba(15,23,42,.08)"
  },
  header: {
    marginBottom: 16
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: 30
  },
  subtitle: {
    color: "#475569",
    marginTop: 8
  },
  form: {
    display: "grid",
    gap: 10
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 4,
    color: "#1e3a8a",
    fontSize: 20
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#334155"
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box"
  },
  resumen: {
    marginTop: 10,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 16,
    padding: 16
  },
  resumenGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12
  },
  resumenItem: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    border: "1px solid #dbeafe"
  },
  resumenLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700
  },
  resumenValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: 800,
    marginTop: 4
  },
  successBox: {
    marginTop: 10,
    background: "#ecfdf5",
    border: "1px solid #86efac",
    color: "#166534",
    padding: 14,
    borderRadius: 14
  },
  errorBox: {
    marginTop: 10,
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: 14,
    borderRadius: 14
  },
  cupo: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 1,
    color: "#065f46"
  },
  button: {
    marginTop: 8,
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer"
  }
};