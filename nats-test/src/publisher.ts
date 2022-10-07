import nats from "node-nats-streaming";
import crypto from "crypto";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();
const clientId = crypto.randomUUID();
const stan = nats.connect("ticketing", clientId, {
  url: "http:localhost:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");
  console.log("ClientId: ", clientId);

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "1234567",
      title: "BS 2023",
      price: 120,
    });
  } catch (err) {
    console.error(err);
  }

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
