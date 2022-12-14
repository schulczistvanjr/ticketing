import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// An interface that describes the properties
// that are required to create a new ticket for an order
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties
// that a TicketDocument has for an order
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties
// that a TicketModel has for an order
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// without updateIfCurrentPlugin
// ticketSchema.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1, // if the version is incremented by 1
//   };

//   done();
// });

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.statics.findByEvent = (eventData: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: eventData.id,
    version: eventData.version - 1,
  });
};

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called "isReserved" on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
