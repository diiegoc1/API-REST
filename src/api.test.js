import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";

const bd = vi.hoisted(() => ({ turnos: [] }));

vi.mock("./db.js", () => ({
  leerTurnos: async () => structuredClone(bd.turnos),
  guardarTurnos: async (turnos) => {
    bd.turnos = structuredClone(turnos);
  },
}));

import { app } from "./app.js";

const fecha = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("sv-SE");
const turno = { nombre: "Ana Gómez", telefono: "3462555123", servicio: "corte", fecha, hora: "10:00" };

beforeAll(async () => {
  process.env.ADMIN_HASH = await bcrypt.hash("clave-de-prueba", 4);
});

beforeEach(() => {
  bd.turnos = [];
});

describe("API de turnos", () => {
  it("reservar un turno da 201", async () => {
    await request(app).post("/api/v1/turnos").send(turno).expect(201);
  });

  it("el mismo horario da 409", async () => {
    await request(app).post("/api/v1/turnos").send(turno).expect(201);
    await request(app).post("/api/v1/turnos").send(turno).expect(409);
  });

  it("sin token el admin da 401", async () => {
    await request(app).get("/api/v1/admin/turnos").expect(401);
  });

  it("con token lista los turnos", async () => {
    await request(app).post("/api/v1/turnos").send(turno).expect(201);
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@pelu.ar", clave: "clave-de-prueba" })
      .expect(200);
    const r = await request(app)
      .get("/api/v1/admin/turnos")
      .set("Authorization", "Bearer " + login.body.token)
      .expect(200);
    expect(r.body.total).toBe(1);
  });
});