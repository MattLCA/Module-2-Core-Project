import crypto from "node:crypto";

const getToken = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  return authorization.slice(7);
};

const decodeBase64Url = (value) =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

export const authenticateToken = (req, res, next) => {
  const token = getToken(req);
  const secret = process.env.JWT_SECRET;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token is required." });
  }

  if (!secret) {
    console.error("JWT_SECRET is not configured.");
    return res
      .status(500)
      .json({ message: "Authentication is not configured." });
  }

  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new Error("Invalid token format.");
    }

    const header = decodeBase64Url(encodedHeader);
    const payload = decodeBase64Url(encodedPayload);

    if (header.alg !== "HS256") {
      throw new Error("Unsupported token algorithm.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new Error("Invalid token signature.");
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token has expired.");
    }

    // Attach verified user payload profile details to the request stream context object
    req.user = payload;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired authentication token." });
  }
};

export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : [req.user?.role];

    if (!allowedRoles.some((role) => userRoles.includes(role))) {
      return res
        .status(403)
        .json({ message: "You are not authorized for this resource." });
    }

    return next();
  };
