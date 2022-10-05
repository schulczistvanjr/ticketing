import request from "supertest";
import { app } from "../../app";
import { createTicket } from "./helper";

it("can fetch a list of tickets", async () => {
  await createTicket("First ticket title", 10);
  await createTicket("Second ticket title", 20);
  await createTicket("Third ticket title", 30);

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
