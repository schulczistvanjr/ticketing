import request from "supertest";
import { app } from "../../app";
import { createId, createTicket } from "./helper";
import { natsWrapper } from "../../nats-wrapper";

jest.mock("../../nats-wrapper");

const title = "Ticket title";
const price = 10;

it("returns 404 if the provided id does not exist", async () => {
  await request(app)
    .put(`/api/tickets/${createId}`)
    .set("Cookie", signin())
    .send({
      title: title,
      price: price,
    })
    .expect(404);
});

it("returns 401 if the user is not authenticated", async () => {
  await request(app)
    .put(`/api/tickets/${createId}`)
    .send({
      title: title,
      price: price,
    })
    .expect(401);
});

it("returns 401 if the user does not own the ticket", async () => {
  const ticketResponse = await createTicket(title, price);

  await request(app)
    .put(`/api/tickets/${ticketResponse.body.id}`)
    .set("Cookie", signin())
    .send({
      title: "Cannot happen",
      price: 1000,
    })
    .expect(401);

  const responseAfterUpdate = await request(app)
    .get(`/api/tickets/${ticketResponse.body.id}`)
    .send()
    .expect(200);

  expect(responseAfterUpdate.body.title).toEqual(title);
  expect(responseAfterUpdate.body.price).toEqual(price);
});

it("returns 400 if the user provides an invalid title or price", async () => {
  const cookie = signin();
  const response = await createTicket(title, price, cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Valid title",
      price: -20,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = signin();
  const response = await createTicket(title, price, cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Edited title",
      price: 20,
    })
    .expect(200);

  const ticketUpdateResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketUpdateResponse.body.title).toEqual("Edited title");
  expect(ticketUpdateResponse.body.price).toEqual(20);
});

it("publishes an event", async () => {
  const cookie = signin();
  const response = await createTicket(title, price, cookie);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Edited title",
      price: 20,
    })
    .expect(200);

  const ticketUpdateResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketUpdateResponse.body.title).toEqual("Edited title");
  expect(ticketUpdateResponse.body.price).toEqual(20);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
