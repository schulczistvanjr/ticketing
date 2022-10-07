import { Publisher, Subjects, TicketCreatedEvent } from "@schtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
