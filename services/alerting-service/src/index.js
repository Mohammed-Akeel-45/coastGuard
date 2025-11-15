import amqplib from "amqplib";
import { config } from "./config.js";
import { findOfficialsNearby } from "./db.js";
import {
  sendEmail,
  sendSms,
  emailSubjectFor,
  emailBodyFor,
  smsBodyFor,
} from "./notifier.js";

// --------------------------------------------
// Main consumer start
// --------------------------------------------

(async () => {
  console.log(
    "Starting alert consumer, connecting to RabbitMQ at",
    config.rabbit.url,
  );

  const conn = await amqplib.connect(config.rabbit.url);

  const ch = await conn.createChannel();

  await ch.assertQueue(config.rabbit.queue, { durable: true });
  ch.prefetch(5);

  console.log(`Waiting for messages on queue ${config.rabbit.queue}...`);

  ch.consume(
    config.rabbit.queue,
    async (msg) => {
      if (!msg) return;

      try {
        const raw = msg.content.toString();
        const alert = JSON.parse(raw);

        if (
          !alert ||
          !alert.location ||
          typeof alert.location.lat !== "number" ||
          typeof alert.location.long !== "number" ||
          !alert.priority
        ) {
          console.warn("Invalid alert message, dropping:", raw);
          ch.nack(msg, false, false);
          return;
        }

        console.log(
          "Processing alert",
          alert.id,
          alert.priority,
          alert.location.name || `${alert.location.lat},${alert.location.long}`,
        );

        const officials = await findOfficialsNearby(
          alert.location.lat,
          alert.location.long,
          config.radiusKm,
        );

        console.log(
          `Found ${officials.length} officials within ${config.radiusKm} km`,
        );

        const emailSubject = emailSubjectFor(alert);
        const emailBody = emailBodyFor(alert);
        const smsBody = smsBodyFor(alert);

        const shouldSendSMS = alert.priority !== "low";

        for (const o of officials) {
          try {
            if (o.email) {
              await sendEmail(o.email, emailSubject, emailBody);
            }
            if (shouldSendSMS && o.phone) {
              await sendSms(o.phone, smsBody);
            }
          } catch (err) {
            console.error(`Failed to notify user ${o.user_id}:`, err);
          }
        }

        ch.ack(msg);
        console.log("Alert processed and acked:", alert.id);
      } catch (err) {
        console.error("Error while processing alert:", err);
        ch.nack(msg, false, true);
      }
    },
    { noAck: false },
  );
})();
