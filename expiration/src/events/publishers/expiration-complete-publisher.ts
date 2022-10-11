import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@schtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
