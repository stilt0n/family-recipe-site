import formData from "form-data";
import Mailgun, { MailgunMessageData } from "mailgun.js";

if (typeof process.env.MAILGUN_API_KEY != "string") {
  throw new Error("Missing env: MAILGUN_API_KEY");
}

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

export const sendEmail = (message: MailgunMessageData) => {
  if (typeof process.env.MAILGUN_DOMAIN != "string") {
    throw new Error("Missing env: MAILGUN_DOMAIN");
  }
  return client.messages.create(process.env.MAILGUN_DOMAIN, message);
};
