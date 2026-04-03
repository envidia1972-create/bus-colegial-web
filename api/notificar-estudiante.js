import { Resend } from "resend";

const estadoTexto = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  activado: "Activado",
  rechazado: "Rechazado",
};

const colorEstado = {
  pendiente: "#f59e0b",
  confirmado: "#2563eb",
  activado: "#16a34a",
  rechazado: "#dc2626",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      numero_cupo,
      estudiante_nombre,
      correo_estudiante,
      estado,
      ruta,
      bus_asignado,
      tipo_servicio,
      precio_anual,
      cuota_mensual,
    } = req.body;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: "Falta RESEND_API_KEY en Vercel" });
    }

    if (!correo_estudiante) {
      return res.status(400).json({ error: "Falta correo_estudiante" });
    }

    const resend = new Resend(RESEND_API_KEY);

    const estadoBonito = estadoTexto[estado] || estado;
    const color = colorEstado[estado] || "#111827";

    const data = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: correo_estudiante,
      subject: `Actualización de su cupo - ${numero_cupo}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">
          <h2>Actualización de solicitud de transporte escolar</h2>
          <p>Hola <strong>${estudiante_nombre}</strong>,</p>
          <p>El estado de su solicitud ha sido actualizado.</p>

          <div style="padding: 14px; border-radius: 10px; background: #f9fafb; border: 1px solid #e5e7eb;">
            <p><strong>Número de cupo:</strong> ${numero_cupo}</p>
            <p><strong>Estado actual:</strong> 
              <span style="color:${color}; font-weight:bold;">${estadoBonito}</span>
            </p>
            <p><strong>Ruta:</strong> ${ruta || "No definida"}</p>
            <p><strong>Bus:</strong> ${bus_asignado || "No definido"}</p>
            <p><strong>Tipo de servicio:</strong> ${tipo_servicio || "No definido"}</p>
            <p><strong>Precio anual:</strong> $${Number(precio_anual || 0).toFixed(2)}</p>
            <p><strong>10 cuotas:</strong> $${Number(cuota_mensual || 0).toFixed(2)}</p>
          </div>

          <p style="margin-top: 16px;">Gracias por utilizar nuestro sistema de transporte escolar.</p>
        </div>
      `,
    });

    return res.status(200).json({
      ok: true,
      message: "Correo estudiante enviado",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Error enviando correo al estudiante",
      details: error?.name || "Error desconocido",
    });
  }
}