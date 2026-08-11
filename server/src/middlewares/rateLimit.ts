import rateLimit from "express-rate-limit";

// Render sits in front of this app as a reverse proxy, so req.ip is
// meaningless (and every request looks like it comes from the same host)
// unless the app trusts the proxy's X-Forwarded-For header -- that trust is
// set once in app.ts (`app.set("trust proxy", 1)`), not here. These limiters
// key on req.ip, so without that setting they'd either rate-limit every
// visitor as one shared bucket or (if trust proxy were set too broadly) be
// trivially bypassed by a spoofed header.

// Login/signup are the highest-value target for credential stuffing and
// brute-force password guessing -- passwords are hashed properly
// (scrypt + per-user salt + timing-safe compare, see utils/password.ts), but
// that only protects a stolen database, not an attacker who gets to try
// passwords online as fast as they want. Deliberately tight.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});

// A much looser limit across the rest of the API, mainly to blunt scripted
// abuse and resource-exhaustion (every game session/answer is a real DB
// write) rather than to constrain normal play -- a real kid bouncing
// through quiz answers should never come close to this.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down and try again shortly." },
});
