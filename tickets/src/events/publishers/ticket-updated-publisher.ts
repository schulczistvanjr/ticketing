import { Publisher, Subjects, TicketUpdatedEvent } from "@schtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
