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
