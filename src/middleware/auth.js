import jwt from "jsonwebtoken";

export function soloAdmin(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? "").split(" ");
  if (tipo != "Bearer" || !token)
    return res.status(401).json({ error: "Falta el token" });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalido o vencido" });
  }
}
