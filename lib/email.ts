import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendAlert(to: string, courts: any[]) {
    const courtListHtml = courts.map(c =>
        `<li>
       <strong>${c.AREANM}</strong>: <a href="${c.SVCURL}">${c.SVCNM}</a> (${c.SVCSTATNM})
     </li>`
    ).join('');

    const html = `
    <div style="font-family: sans-serif; color: #333;">
      <h1 style="color: #00d68f;">🎾 Court Alert!</h1>
      <p>We found ${courts.length} new available tennis courts matching your preferences:</p>
      <ul>
        ${courtListHtml}
      </ul>
      <p>Go book them now before they are gone!</p>
      <hr />
      <p style="font-size: 12px; color: #888;">You are receiving this because you subscribed to Seoul Tennis Alerts.</p>
    </div>
  `;

    try {
        await transporter.sendMail({
            from: '"Seoul Tennis" <alerts@seoultennis.com>',
            to,
            subject: `🎾 ${courts.length} Courts Available in Seoul!`,
            html,
        });
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
