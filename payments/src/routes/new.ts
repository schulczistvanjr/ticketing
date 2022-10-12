import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from "@schtickets/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedEventPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").not().isEmpty().withMessage("Token must be provided"),
    body("orderId").not().isEmpty().withMessage("OrderId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for an expired/cancelled order");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100, // stripe using the smallest, so in usd it is cents
      source: token,
      description: "Ticketing Payments Service",
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });
    await payment.save();

    await new PaymentCreatedEventPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send(payment);
  }
);

export { router as createChargeRouter };
