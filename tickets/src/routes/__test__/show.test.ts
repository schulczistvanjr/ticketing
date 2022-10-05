import request from "supertest";
import { app } from "../../app";
import { createId } from "./helper";

it("returns 404 if ticket is not found", async () => {
  await request(app).get(`/api/tickets/${createId}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "Valid title";
  const price = 10;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: title,
      price: price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
