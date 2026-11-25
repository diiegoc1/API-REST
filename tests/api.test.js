import { describe, test, expect, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../src/app.js";

// Fecha unica por corrida: los tests escriben en la base real.
const fecha = new Date(Date.now() + 200 * 864e5 + Math.random() * 100 * 864e5)
  .toLocaleDateString("sv-SE");

const turno = {
  nombre: "Test Supertest",
  telefono: "1122334455",
  servicio: "corte",
  fecha,
  hora: "10:00",
};

let id;

describe("POST /api/v1/turnos", () => {
  test("reserva un turno", async () => {
    const res = await request(app).post("/api/v1/turnos").send(turno).expect(201);
    id = res.body.id;
    expect(id).toBeTruthy();
  });

  test("el mismo horario devuelve 409", async () => {
    await request(app).post("/api/v1/turnos").send(turno).expect(409);
  });
});

describe("rutas de admin", () => {
  test("sin token devuelve 401", async () => {
    await request(app).delete(`/api/v1/admin/turnos/${id}`).expect(401);
  });
});

afterAll(async () => {
  if (!id) return;
  const token = jwt.sign({ rol: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  await request(app)
    .delete(`/api/v1/admin/turnos/${id}`)
    .set("Authorization", `Bearer ${token}`);
});
