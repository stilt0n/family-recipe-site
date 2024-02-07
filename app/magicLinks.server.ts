import { json } from "@remix-run/node";
import Cryptr from "cryptr";

if (typeof process.env.MAGIC_LINK_SECRET != "string") {
  throw new Error("Environment is missing magic link secret");
}

const cryptr = new Cryptr(process.env.MAGIC_LINK_SECRET);

interface MagicLinkPayload {
  email: string;
  nonce: string;
  createdAt: string;
}

export const generateMagicLink = (email: string, nonce: string) => {
  const payload: MagicLinkPayload = {
    email,
    nonce,
    createdAt: new Date().toISOString(),
  };
  const encryptedPayload = cryptr.encrypt(JSON.stringify(payload));

  if (typeof process.env.ORIGIN != "string") {
    throw new Error("Origin must be a string");
  }
  const url = new URL(process.env.ORIGIN);
  url.pathname = "/validate-magic-link";
  url.searchParams.set("magic", encryptedPayload);
  return url.toString();
};

export const getMagicLinkPayload = (request: Request) => {
  const url = new URL(request.url);
  const magic = url.searchParams.get("magic");

  if (typeof magic !== "string") {
    throw json(
      { message: "'magic' search param does not exist" },
      { status: 400 }
    );
  }

  const magicLinkPayload = JSON.parse(cryptr.decrypt(magic));
  if (!isMagicLinkPayload(magicLinkPayload)) {
    throw json(
      {
        message: "invalid magic link payload",
      },
      { status: 400 }
    );
  }
  return magicLinkPayload;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMagicLinkPayload = (value: any): value is MagicLinkPayload => {
  return (
    typeof value === "object" &&
    typeof value.email === "string" &&
    typeof value.nonce === "string" &&
    typeof value.createdAt === "string"
  );
};
