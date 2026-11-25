import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const auth = Router();

auth.post("/auth/login", async (req, res) => {
  const { email, clave } = req.body ?? {};
  const ok =
    email === process.env.ADMIN_EMAIL &&
    typeof clave === "string" &&
    (await bcrypt.compare(clave, process.env.ADMIN_HASH));
  if (!ok) return res.status(401).json({ error: "Email o clave incorrectos" });

  const token = jwt.sign({ sub: email, rol: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ token, expire: "8h" });
});
