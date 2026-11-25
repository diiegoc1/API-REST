import { rateLimit } from "express-rate-limit";

export const limitarTurnos = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiadas reservas seguidas, proba en un minuto" },
});

export const limitarLogin = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos de login, proba en un minuto" },
});
