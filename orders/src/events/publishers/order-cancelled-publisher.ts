import { Publisher, OrderCancelledEvent, Subjects } from "@schtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
