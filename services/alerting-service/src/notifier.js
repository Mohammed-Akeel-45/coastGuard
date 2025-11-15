import nodemailer from "nodemailer";
import Twilio from "twilio";
import { config } from "./config.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.APP_PASSWORD,
  },
});

const twilioClient =
  config.twilio.accountSid && config.twilio.authToken
    ? Twilio(config.twilio.accountSid, config.twilio.authToken)
    : null;

export async function sendEmail(to, subject, text) {
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
  });
  console.log("Email sent", info.messageId, "to", to);
}

export async function sendSms(to, body) {
  if (!twilioClient) {
    console.warn("Twilio not configured; skipping SMS to", to);
    return;
  }
  if (!config.twilio.fromNumber) {
    throw new Error("Twilio from number not configured");
  }
  const msg = await twilioClient.messages.create({
    body,
    from: config.twilio.fromNumber,
    to,
  });
  console.log("SMS sent", msg.sid, "to", to);
}

export function emailSubjectFor(alert) {
  return `[${alert.priority.toUpperCase()}] Alert: ${alert.location?.name || "Unknown location"}`;
}

export function emailBodyFor(alert) {
  return `${alert.text}\n\nPlatform: ${alert.platform || "n/a"}\nType: ${alert.type || "n/a"}\nReported at: ${alert.reported_at || "n/a"}\nLocation: ${alert.location?.name || ""} (${alert.location?.lat}, ${alert.location?.long})\nMedia: ${alert.mediaUrl || "n/a"}`;
}

export function smsBodyFor(alert) {
  // keep SMS short
  return `${alert.priority.toUpperCase()} alert at ${alert.location?.name || `${alert.location?.lat},${alert.location?.long}`}: ${alert.text.slice(0, 200)}`;
}
