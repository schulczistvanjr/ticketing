import { Publisher, Subjects, PaymentCreatedEvent } from "@schtickets/common";

export class PaymentCreatedEventPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
