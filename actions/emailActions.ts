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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #334155;">
          <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">IT <span style="color: #3b82f6;">HelpDesk</span></h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background-color: #dbeafe; color: #1d4ed8; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  En Progreso
                </span>
              </div>

              <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">¡Hola!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                Queremos informarte que uno de nuestros agentes ha tomado tu solicitud y actualmente se encuentra <strong>trabajando en ella</strong>.
              </p>

              <!-- Ticket Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">ID del Ticket</span><br/>
                  <span style="font-family: monospace; font-size: 16px; color: #0f172a;">${ticketId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Asunto</span><br/>
                  <span style="font-size: 16px; color: #0f172a; font-weight: 500;">${titulo}</span>
                </div>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                Te notificaremos de inmediato en cuanto el problema haya sido resuelto.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Este es un mensaje automático generado por <strong>IT HelpDesk</strong>.<br/>
                Por favor no respondas a este correo.
              </p>
            </div>
            
          </div>
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #334155;">
          <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background-color: #0f172a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">IT <span style="color: #3b82f6;">HelpDesk</span></h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background-color: #dcfce7; color: #16a34a; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  Completado
                </span>
              </div>

              <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">¡Problema Solucionado!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                Te informamos que el equipo de soporte ha finalizado el trabajo y tu solicitud ha sido marcada como <strong>resuelta</strong>.
              </p>

              <!-- Ticket Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">ID del Ticket</span><br/>
                  <span style="font-family: monospace; font-size: 16px; color: #0f172a;">${ticketId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div>
                  <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Asunto</span><br/>
                  <span style="font-size: 16px; color: #0f172a; font-weight: 500;">${titulo}</span>
                </div>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                Si el problema persiste o si necesitas ayuda adicional, no dudes en abrir un nuevo ticket desde tu portal de usuario.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                ¡Gracias por tu paciencia y colaboración!<br/><br/>
                Este es un mensaje automático generado por <strong>IT HelpDesk</strong>.<br/>
                Por favor no respondas a este correo.
              </p>
            </div>
            
          </div>
        </div>
      `
    });

    return { success: true, data: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo CLOSED:', error);
    return { success: false, error };
  }
}