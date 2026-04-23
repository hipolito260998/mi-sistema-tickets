"use server";

import nodemailer from 'nodemailer';

// 1. Configuramos el "motor" de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function notificarTicketEnProgreso(ticketId: string, titulo: string, emailUsuario: string) {
  try {
    const info = await transporter.sendMail({
      from: `"IT HelpDesk" <${process.env.SMTP_EMAIL}>`,
      to: emailUsuario,
      subject: `🚀 Tu solicitud está en proceso: ${titulo}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">¡Hola!</h2>
          <p>Queríamos informarte que nuestro equipo ya ha comenzado a trabajar en tu solicitud:</p>
          <blockquote style="border-left: 4px solid #2563eb; padding-left: 10px; background: #f3f4f6; padding: 10px;">
            <strong>ID:</strong> ${ticketId.substring(0, 8)}<br/>
            <strong>Asunto:</strong> ${titulo}
          </blockquote>
          <p>Te notificaremos en cuanto el problema haya sido resuelto.</p>
          <br/>
          <p style="font-size: 12px; color: #666;">Equipo de Soporte TI</p>
        </div>
      `
    });

    return { success: true, data: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo IN_PROGRESS:', error);
    return { success: false, error };
  }
}

export async function notificarTicketCerrado(ticketId: string, titulo: string, emailUsuario: string) {
  try {
    const info = await transporter.sendMail({
      from: `"IT HelpDesk" <${process.env.SMTP_EMAIL}>`,
      to: emailUsuario,
      subject: `✅ Ticket Resuelto: ${titulo}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">¡Problema Solucionado!</h2>
          <p>Te informamos que tu solicitud ha sido marcada como resuelta por nuestro equipo:</p>
          <blockquote style="border-left: 4px solid #16a34a; padding-left: 10px; background: #f0fdf4; padding: 10px;">
            <strong>ID:</strong> ${ticketId.substring(0, 8)}<br/>
            <strong>Asunto:</strong> ${titulo}
          </blockquote>
          <p>Si el problema persiste o necesitas más ayuda, por favor abre un nuevo ticket desde tu portal.</p>
          <br/>
          <p style="font-size: 12px; color: #666;">¡Gracias por tu paciencia!<br/>Equipo de Soporte TI</p>
        </div>
      `
    });

    return { success: true, data: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo CLOSED:', error);
    return { success: false, error };
  }
}