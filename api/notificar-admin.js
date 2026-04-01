import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const {
      numero_cupo,
      estudiante_nombre,
      acudiente_nombre,
      telefono,
      correo_estudiante,
      ruta,
      bus_asignado,
      tipo_servicio,
      precio_anual,
      cuota_mensual,
      nota_adicional,
    } = req.body;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: "Falta RESEND_API_KEY en Vercel" });
    }

    if (!ADMIN_NOTIFY_EMAIL) {
      return res.status(500).json({ error: "Falta ADMIN_NOTIFY_EMAIL en Vercel" });
    }

    const resend = new Resend(RESEND_API_KEY);

    const data = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Nueva solicitud de transporte - ${numero_cupo}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Nueva solicitud de transporte escolar</h2>
          <p><strong>Número de cupo:</strong> ${numero_cupo}</p>
          <p><strong>Estudiante:</strong> ${estudiante_nombre}</p>
          <p><strong>Acudiente:</strong> ${acudiente_nombre}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Correo estudiante:</strong> ${correo_estudiante}</p>
          <p><strong>Ruta:</strong> ${ruta}</p>
          <p><strong>Bus asignado:</strong> ${bus_asignado}</p>
          <p><strong>Tipo de servicio:</strong> ${tipo_servicio}</p>
          <p><strong>Precio anual:</strong> $${Number(precio_anual || 0).toFixed(2)}</p>
          <p><strong>10 cuotas:</strong> $${Number(cuota_mensual || 0).toFixed(2)}</p>
          <p><strong>Nota adicional:</strong> ${nota_adicional || "Sin nota"}</p>
        </div>
      `,
    });

    return res.status(200).json({
      ok: true,
      message: "Correo enviado correctamente",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Error enviando correo",
      details: error?.name || "Error desconocido",
    });
  }
}