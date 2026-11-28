import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const CAMPOS = ["nombre", "telefono", "servicio", "fecha", "hora", "estado"];

const CREAR_TABLA = `
  CREATE TABLE IF NOT EXISTS turnos (
    id uuid PRIMARY KEY,
    nombre text NOT NULL,
    telefono text NOT NULL,
    servicio text NOT NULL,
    fecha text NOT NULL,
    hora text NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente',
    creado timestamptz NOT NULL DEFAULT now()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS turnos_horario_unico
    ON turnos (fecha, hora) WHERE estado <> 'cancelado';
`;

let inicio;
const iniciar = () => (inicio ??= pool.query(CREAR_TABLA));

function fallar(error) {
  console.error("[postgres]", error);
  const err = new Error(error.message);
  if (error.code === "23505") {
    err.status = 409;
    err.message = "Ese horario ya esta tomado";
  }
  return err;
}

export async function leerTurnos() {
  await iniciar();
  try {
    const { rows } = await pool.query("SELECT * FROM turnos ORDER BY fecha, hora");
    return rows;
  } catch (error) {
    throw fallar(error);
  }
}

export async function guardarTurnos(turnos) {
  await iniciar();
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const { rows: actuales } = await cliente.query("SELECT * FROM turnos");
    const enDb = new Map(actuales.map((t) => [t.id, t]));
    const enMemoria = new Set(turnos.map((t) => t.id));

    for (const t of turnos) {
      const viejo = enDb.get(t.id);
      if (!viejo) {
        await cliente.query(
          `INSERT INTO turnos (id, nombre, telefono, servicio, fecha, hora, estado, creado)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [t.id, t.nombre, t.telefono, t.servicio, t.fecha, t.hora, t.estado, t.creado ?? new Date().toISOString()],
        );
      } else if (CAMPOS.some((c) => String(viejo[c]) !== String(t[c]))) {
        await cliente.query(
          `UPDATE turnos SET nombre=$2, telefono=$3, servicio=$4, fecha=$5, hora=$6, estado=$7
           WHERE id=$1`,
          [t.id, t.nombre, t.telefono, t.servicio, t.fecha, t.hora, t.estado],
        );
      }
    }

    const borrados = actuales.filter((t) => !enMemoria.has(t.id)).map((t) => t.id);
    if (borrados.length) {
      await cliente.query("DELETE FROM turnos WHERE id = ANY($1::uuid[])", [borrados]);
    }
    await cliente.query("COMMIT");
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw fallar(error);
  } finally {
    cliente.release();
  }
}