import { useState } from "react";
import { supabase } from "../lib/supabase";

const rutasConfig = {
  "Ruta 1": {
    buses: [
      { nombre: "Bus 01", precioCompleto: 850, precioMedio: 500 },
      { nombre: "Bus 02", precioCompleto: 900, precioMedio: 550 },
    ],
  },
  "Ruta 2": {
    buses: [
      { nombre: "Bus 03", precioCompleto: 800, precioMedio: 480 },
      { nombre: "Bus 04", precioCompleto: 870, precioMedio: 520 },
    ],
  },
  "Ruta 3": {
    buses: [
      { nombre: "Bus 05", precioCompleto: 950, precioMedio: 600 },
    ],
  },
};

export default function ClienteForm() {
  const [form, setForm] = useState({
    estudiante_nombre: "",
    grado: "",
    seccion: "",
    acudiente_nombre: "",
    telefono: "",
    correo_estudiante: "",
    direccion: "",
    ruta: "",
    bus_asignado: "",
    tipo_servicio: "completo",
    nota_adicional: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const busesDisponibles = form.ruta ? rutasConfig[form.ruta]?.buses || [] : [];
  const busSeleccionado = busesDisponibles.find((b) => b.nombre === form.bus_asignado);

  const precio_anual = busSeleccionado
    ? form.tipo_servicio === "completo"
      ? busSeleccionado.precioCompleto
      : busSeleccionado.precioMedio
    : 0;

  const cuota_mensual = precio_anual / 10;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ruta") {
      setForm((prev) => ({
        ...prev,
        ruta: value,
        bus_asignado: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generarNumeroCupo = () => `CUP-${Date.now()}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const numero_cupo = generarNumeroCupo();

      const payload = {
        numero_cupo,
        estudiante_nombre: form.estudiante_nombre,
        grado: form.grado,
        seccion: form.seccion,
        acudiente_nombre: form.acudiente_nombre,
        telefono: form.telefono,
        correo_estudiante: form.correo_estudiante,
        direccion: form.direccion,
        ruta: form.ruta,
        bus_asignado: form.bus_asignado,
        tipo_servicio: form.tipo_servicio,
        precio_anual,
        cuota_mensual,
        estado: "pendiente",
        nota_adicional: form.nota_adicional,
      };

      const { error } = await supabase
        .from("solicitudes_transporte")
        .insert([payload]);

      if (error) throw error;

      try {
        const resp = await fetch("/api/notificar-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const mailResult = await resp.json();
        if (!resp.ok) console.warn("Falló correo admin:", mailResult);
      } catch (mailError) {
        console.warn("No se pudo notificar al admin:", mailError);
      }

      setMensaje(`✅ Solicitud enviada correctamente. Su número de cupo es: ${numero_cupo}`);

      setForm({
        estudiante_nombre: "",
        grado: "",
        seccion: "",
        acudiente_nombre: "",
        telefono: "",
        correo_estudiante: "",
        direccion: "",
        ruta: "",
        bus_asignado: "",
        tipo_servicio: "completo",
        nota_adicional: "",
      });
    } catch (error) {
      console.error(error);
      setMensaje(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2>Formulario de Contratación de Transporte Escolar</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="estudiante_nombre"
          placeholder="Nombre del estudiante"
          value={form.estudiante_nombre}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="grado"
          placeholder="Grado"
          value={form.grado}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="seccion"
          placeholder="Sección"
          value={form.seccion}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="acudiente_nombre"
          placeholder="Nombre del acudiente"
          value={form.acudiente_nombre}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="email"
          name="correo_estudiante"
          placeholder="Correo del estudiante"
          value={form.correo_estudiante}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <select
          name="ruta"
          value={form.ruta}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Seleccione una ruta</option>
          {Object.keys(rutasConfig).map((ruta) => (
            <option key={ruta} value={ruta}>
              {ruta}
            </option>
          ))}
        </select>

        <select
          name="bus_asignado"
          value={form.bus_asignado}
          onChange={handleChange}
          required
          disabled={!form.ruta}
          style={styles.input}
        >
          <option value="">
            {form.ruta ? "Seleccione un bus" : "Primero seleccione una ruta"}
          </option>
          {busesDisponibles.map((bus) => (
            <option key={bus.nombre} value={bus.nombre}>
              {bus.nombre}
            </option>
          ))}
        </select>

        <select
          name="tipo_servicio"
          value={form.tipo_servicio}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="completo">Servicio Completo</option>
          <option value="medio">Medio Servicio</option>
        </select>

        <textarea
          name="nota_adicional"
          placeholder="Nota adicional (opcional)"
          value={form.nota_adicional}
          onChange={handleChange}
          rows="4"
          style={styles.textarea}
        />

        <div style={styles.resumen}>
          <p><strong>Precio anual:</strong> ${precio_anual.toFixed(2)}</p>
          <p><strong>10 cuotas:</strong> ${cuota_mensual.toFixed(2)}</p>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </form>

      {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
    </div>
  );
}

const styles = {
  card: {
    maxWidth: "720px",
    margin: "30px auto",
    padding: "24px",
    borderRadius: "14px",
    background: "#fff",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  resumen: {
    background: "#f7f7f7",
    padding: "12px",
    borderRadius: "10px",
  },
  button: {
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#1e40af",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  mensaje: {
    marginTop: "16px",
    fontWeight: "bold",
  },
};