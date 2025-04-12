// app/api/logs/route.js
import nodemailer from "nodemailer";

let logs = []; // In-memory storage

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const timestamp = body.timestamp || new Date().toISOString();
    const alertMessage = body.alert?.signature || "No alert message";
    const summary = `Alert at ${timestamp}: ${alertMessage}`;
    logs.push(summary);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "New Alert Notification",
      text: summary,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to process logs" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ logs }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
