import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}

process.env.STRIPE_KEY =
  "sk_test_51LrzKhLIsAtcNzajnCCeW20cwNB0L1j8kn1wnXoRetQnf2wNgnOcNJCijqSio4GOID87W4Kf5x78BEFT7sTuVBgo00qxPA0PCg";

jest.mock("../nats-wrapper");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasd";
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});

global.signin = (id?: string) => {
  // Build a JWT payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build a session Object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session to JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
