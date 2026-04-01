import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      email,
      ruta,
      bus_asignado,
      tipo_servicio,
      precio_anual,
      cuota_mensual,
    } = req.body;

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;

    if (!adminEmail) {
      return res.status(500).json({ error: "ADMIN_NOTIFY_EMAIL no configurado" });
    }

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: adminEmail,
      subject: `Nueva solicitud de transporte - ${numero_cupo}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Nueva solicitud de transporte escolar</h2>
          <p><strong>Número de cupo:</strong> ${numero_cupo}</p>
          <p><strong>Estudiante:</strong> ${estudiante_nombre}</p>
          <p><strong>Acudiente:</strong> ${acudiente_nombre}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Ruta:</strong> ${ruta}</p>
          <p><strong>Bus asignado:</strong> ${bus_asignado}</p>
          <p><strong>Tipo de servicio:</strong> ${tipo_servicio}</p>
          <p><strong>Precio anual:</strong> $${Number(precio_anual).toFixed(2)}</p>
          <p><strong>10 cuotas:</strong> $${Number(cuota_mensual).toFixed(2)}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("Error notificar-admin:", error);
    return res.status(500).json({ error: error.message || "Error enviando correo" });
  }
}