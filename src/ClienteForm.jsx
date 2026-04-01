import { useState } from "react";
import { supabase } from "./lib/supabase";

const RUTAS = [
  { codigo: "RUTA-1", nombre: "Ruta 1", bus: "BUS-1", precio: 1200 },
  { codigo: "RUTA-2", nombre: "Ruta 2", bus: "BUS-2", precio: 1300 },
  { codigo: "RUTA-3", nombre: "Ruta 3", bus: "BUS-3", precio: 1400 },
  { codigo: "RUTA-4", nombre: "Ruta 4", bus: "BUS-4", precio: 1500 },
];

export default function ClienteForm() {
  const [form, setForm] = useState({
    acudiente_nombre: "",
    acudiente_cedula: "",
    telefono: "",
    email: "",
    estudiante_nombre: "",
    grado: "",
    colegio: "",
    ruta: "",
    tipo_servicio: "Completo (ida y vuelta)",
  });

  const [resultado, setResultado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function calcularDatos() {
    const rutaObj = RUTAS.find((r) => r.codigo === form.ruta);
    if (!rutaObj) return null;

    let precioAnual = rutaObj.precio;

    if (
      form.tipo_servicio === "Solo recoger en casa" ||
      form.tipo_servicio === "Solo llevar a casa"
    ) {
      precioAnual = precioAnual - 100;
    }

    const cuotaMensual = precioAnual / 10;

    return {
      rutaObj,
      bus_asignado: rutaObj.bus,
      precio_anual: precioAnual,
      cuota_mensual: cuotaMensual,
    };
  }

  async function generarNumeroCupo() {
    const year = new Date().getFullYear();

    const { count, error } = await supabase
      .from("solicitudes_bus")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error contando solicitudes:", error);
      throw new Error("No se pudo generar el número de cupo");
    }

    const siguiente = (count || 0) + 1;
    return `CUP-${year}-${String(siguiente).padStart(4, "0")}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const datosCalc = calcularDatos();

    if (!datosCalc) {
      alert("Seleccione una ruta válida");
      return;
    }

    setGuardando(true);

    try {
      const numero_cupo = await generarNumeroCupo();

      const payload = {
        acudiente_nombre: form.acudiente_nombre,
        acudiente_cedula: form.acudiente_cedula,
        telefono: form.telefono,
        email: form.email,
        estudiante_nombre: form.estudiante_nombre,
        grado: form.grado,
        colegio: form.colegio,
        ruta: form.ruta,
        bus_asignado: datosCalc.bus_asignado,
        precio_anual: datosCalc.precio_anual,
        cuota_mensual: datosCalc.cuota_mensual,
        estado: "pendiente",
        numero_cupo,
        tipo_servicio: form.tipo_servicio,
      };

      const { error } = await supabase.from("solicitudes_bus").insert([payload]);

      if (error) {
        console.error(error);
        alert("Error al guardar: " + error.message);
        setGuardando(false);
        return;
      }

      // Notificar admin por correo (sin romper el flujo si falla)
      try {
        await fetch("/api/notificar-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            numero_cupo,
            estudiante_nombre: form.estudiante_nombre,
            acudiente_nombre: form.acudiente_nombre,
            telefono: form.telefono,
            email: form.email,
            ruta: form.ruta,
            bus_asignado: datosCalc.bus_asignado,
            tipo_servicio: form.tipo_servicio,
            precio_anual: datosCalc.precio_anual,
            cuota_mensual: datosCalc.cuota_mensual,
          }),
        });
      } catch (mailError) {
        console.warn("No se pudo notificar al admin:", mailError);
      }

      setResultado({
        numero_cupo,
        bus_asignado: datosCalc.bus_asignado,
        precio_anual: datosCalc.precio_anual,
        cuota_mensual: datosCalc.cuota_mensual,
      });

      setForm({
        acudiente_nombre: "",
        acudiente_cedula: "",
        telefono: "",
        email: "",
        estudiante_nombre: "",
        grado: "",
        colegio: "",
        ruta: "",
        tipo_servicio: "Completo (ida y vuelta)",
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Error inesperado");
    }

    setGuardando(false);
  }

  const preview = calcularDatos();

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Solicitud de Transporte Escolar</h1>
        <p style={styles.subtitle}>
          Complete sus datos para asignar ruta, bus y tarifa.
        </p>

        <form onSubmit={handleSubmit}>
          <h3>Datos del acudiente</h3>
          <input name="acudiente_nombre" placeholder="Nombre del acudiente" value={form.acudiente_nombre} onChange={handleChange} required style={styles.input} />
          <input name="acudiente_cedula" placeholder="Cédula del acudiente" value={form.acudiente_cedula} onChange={handleChange} required style={styles.input} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required style={styles.input} />
          <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required style={styles.input} />

          <h3>Datos del estudiante</h3>
          <input name="estudiante_nombre" placeholder="Nombre del estudiante" value={form.estudiante_nombre} onChange={handleChange} required style={styles.input} />
          <input name="grado" placeholder="Grado" value={form.grado} onChange={handleChange} required style={styles.input} />
          <input name="colegio" placeholder="Colegio" value={form.colegio} onChange={handleChange} required style={styles.input} />

          <h3>Servicio</h3>
          <select name="ruta" value={form.ruta} onChange={handleChange} required style={styles.input}>
            <option value="">Seleccione una ruta</option>
            {RUTAS.map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.codigo} - {r.nombre}
              </option>
            ))}
          </select>

          <select name="tipo_servicio" value={form.tipo_servicio} onChange={handleChange} required style={styles.input}>
            <option>Completo (ida y vuelta)</option>
            <option>Solo recoger en casa</option>
            <option>Solo llevar a casa</option>
          </select>

          {preview && (
            <div style={styles.preview}>
              <h3 style={{ marginTop: 0 }}>Resumen de asignación</h3>
              <p><b>Bus asignado:</b> {preview.bus_asignado}</p>
              <p><b>Precio anual:</b> ${preview.precio_anual.toFixed(2)}</p>
              <p><b>10 cuotas:</b> ${preview.cuota_mensual.toFixed(2)}</p>
            </div>
          )}

          <button type="submit" disabled={guardando} style={styles.button}>
            {guardando ? "Enviando solicitud..." : "Enviar solicitud"}
          </button>
        </form>

        {resultado && (
          <div style={styles.success}>
            <h3>✅ Solicitud enviada con éxito</h3>
            <p><b>Número de seguimiento:</b> {resultado.numero_cupo}</p>
            <p><b>Bus asignado:</b> {resultado.bus_asignado}</p>
            <p><b>Precio anual:</b> ${resultado.precio_anual.toFixed(2)}</p>
            <p><b>10 cuotas:</b> ${resultado.cuota_mensual.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc, #eef2ff)",
    padding: 20,
  },
  card: {
    maxWidth: 700,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    marginTop: 0,
    marginBottom: 6,
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10,
  },
  preview: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  success: {
    marginTop: 20,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: 14,
    padding: 16,
  },
};