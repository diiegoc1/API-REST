const modulo = process.env.DATABASE_URL
  ? await import("./db-postgres.js")
  : await import("./db-supabase.js");

export const leerTurnos = modulo.leerTurnos;
export const guardarTurnos = modulo.guardarTurnos;