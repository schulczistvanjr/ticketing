import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";

export const createId = new mongoose.Types.ObjectId().toHexString();

export const createTicket = (
  ticketTitle: string,
  ticketPrice: number,
  cookie?: string[]
) => {
  if (!cookie) {
    return request(app).post("/api/tickets").set("Cookie", signin()).send({
      title: ticketTitle,
      price: ticketPrice,
    });
  } else {
    return request(app).post("/api/tickets").set("Cookie", cookie).send({
      title: ticketTitle,
      price: ticketPrice,
    });
  }
};
