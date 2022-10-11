import mongoose from "mongoose";
import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "Ticket title",
    price: 20,
    userId: "123",
  });
  // Save the ticket to database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket -> outdated version number expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error("Should not run this code");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "title",
    price: 20,
    userId: "123",
  });

  for (let i = 0; i <= 25; i++) {
    await ticket.save();
    expect(ticket.version).toEqual(i);
  }
});
