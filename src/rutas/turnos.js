import { Router } from "express";
import { randomUUID } from "node:crypto";
import { leerTurnos, guardarTurnos } from "../db.js";
import { validarTurno, SERVICIOS, HORAS, esFecha } from "../validar.js";

export const turnos = Router();

turnos.get("/servicios", (req, res) => {
  res.json(SERVICIOS);
});

turnos.get("/turnos/libres", async (req, res) => {
  const { fecha } = req.query;
  if (!esFecha(fecha))
    return res.status(400).json({ error: "falta ?fecha=AAA-MM-DD" });
  const ocupadas = (await leerTurnos())
    .filter((t) => t.fecha === fecha && t.estado != "cancelado")
    .map((t) => t.hora);
  res.json({ fecha, libres: HORAS.filter((h) => !ocupadas.includes(h)) });
});

turnos.post("/turnos", async (req, res) => {
  const { errores, turno } = validarTurno(req.body ?? {});
  if (errores.length)
    return res
      .status(400)
      .json({ error: "Datos invalidos", detalles: errores });

  const lista = await leerTurnos();
  const tomado = lista.some(
    (t) =>
      t.fecha === turno.fecha &&
      t.hora === turno.hora &&
      t.estado != "cancelado",
  );
  if (tomado)
    return res.status(409).json({ error: "Ese horario ya esta tomado" });

  const nuevo = {
    id: randomUUID(),
    ...turno,
    estado: "pendiente",
    creado: new Date().toISOString(),
  };
  lista.push(nuevo);
  await guardarTurnos(lista);
  res
    .status(201)
    .json({
      id: nuevo.id,
      fecha: nuevo.fecha,
      hora: nuevo.hora,
      estado: nuevo.estado,
    });
});
