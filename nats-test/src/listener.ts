import nats from "node-nats-streaming";
import crypto from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();
const clientId = crypto.randomUUID();
const stan = nats.connect("ticketing", clientId, {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");
  console.log("ClientId:", clientId);

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
