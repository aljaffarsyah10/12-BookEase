import { Resend } from "resend";
import { generateCancellationSignature } from "@/lib/cancellation-token";
import type { Booking } from "@/types";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "BookEase <notifications@bookease.id>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface BookingEmailPayload {
  booking: Booking;
  businessName: string;
  businessPhone?: string | null;
  businessAddress?: string | null;
}

export async function sendBookingConfirmationEmail(
  payload: BookingEmailPayload
): Promise<boolean> {
  const { booking, businessName, businessPhone, businessAddress } = payload;
  const token = generateCancellationSignature(booking.reference, booking.id);
  const cancellationUrl = `${appUrl}/book/cancel?ref=${encodeURIComponent(
    booking.reference
  )}&token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Konfirmasi Reservasi - ${booking.reference}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #4f46e5; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
          .content { padding: 24px; }
          .ref-box { background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; border: 1px dashed #cbd5e1; }
          .ref-code { font-family: monospace; font-size: 20px; font-weight: bold; color: #4f46e5; letter-spacing: 1px; margin-top: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .detail-label { color: #64748b; }
          .detail-value { font-weight: 600; color: #0f172a; text-align: right; }
          .cancel-section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center; }
          .cancel-btn { display: inline-block; margin-top: 10px; color: #dc2626; text-decoration: underline; font-size: 12px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reservasi Anda Berhasil Terkonfirmasi</h1>
            <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">${businessName}</p>
          </div>
          <div class="content">
            <p>Halo <strong>${booking.customerName}</strong>,</p>
            <p>Terima kasih telah memesan layanan kami. Reservasi Anda telah terdaftar dalam sistem.</p>
            
            <div class="ref-box">
              <div style="font-size: 12px; color: #64748b;">KODE REFERENSI RESERVASI</div>
              <div class="ref-code">${booking.reference}</div>
            </div>

            <div class="detail-row">
              <span class="detail-label">Layanan</span>
              <span class="detail-value">${booking.serviceNameSnapshot}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Staf Penyedia</span>
              <span class="detail-value">${booking.staffName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tanggal & Jam</span>
              <span class="detail-value">${booking.date} pukul ${booking.time}</span>
            </div>
            ${
              businessAddress
                ? `
            <div class="detail-row">
              <span class="detail-label">Lokasi</span>
              <span class="detail-value">${businessAddress}</span>
            </div>`
                : ""
            }
            ${
              businessPhone
                ? `
            <div class="detail-row">
              <span class="detail-label">Kontak Bisnis</span>
              <span class="detail-value">${businessPhone}</span>
            </div>`
                : ""
            }

            <div class="cancel-section">
              <p>Perlu mengubah rencana atau membatalkan reservasi?</p>
              <a href="${cancellationUrl}" class="cancel-btn">Batalkan Reservasi Mandiri</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} BookEase • Platform Reservasi Online
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (!resend) {
      console.log(
        `[EMAIL_DEV_STUB] Email confirmation sent to: ${booking.customerEmail} for ref: ${booking.reference} (Cancellation URL: ${cancellationUrl})`
      );
      return true;
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: [booking.customerEmail],
      subject: `Konfirmasi Reservasi #${booking.reference} - ${businessName}`,
      html: htmlContent,
    });

    if (result.error) {
      console.error("[RESEND_DELIVERY_ERROR]", result.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[EMAIL_UNCAUGHT_DELIVERY_ERROR]", err);
    return false;
  }
}

