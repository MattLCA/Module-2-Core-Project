import crypto from "node:crypto";

// Copy your exact secret string from your .env file
const secret = "your_super_secret_hmac_key_string_here";

const header = { alg: "HS256", typ: "JWT" };
const payload = {
  id: 1,
  name: "Test Admin",
  roles: ["HR"], // Matches the required route role check parameter
};

const base64UrlEncode = (obj) =>
  Buffer.from(JSON.stringify(obj)).toString("base64url");

const encodedHeader = base64UrlEncode(header);
const encodedPayload = base64UrlEncode(payload);

const signature = crypto
  .createHmac("sha256", secret)
  .update(`${encodedHeader}.${encodedPayload}`)
  .digest("base64url");

const mockToken = `${encodedHeader}.${encodedPayload}.${signature}`;
console.log("\n📋 COPY YOUR MOCK TESTING TOKEN BELOW:\n");
console.log(`Bearer ${mockToken}\n`);