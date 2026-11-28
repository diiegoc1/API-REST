import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } },
);

const CAMPOS = ["nombre", "telefono", "servicio", "fecha", "hora", "estado"];

// Traduce errores de Postgres a algo que el manejador de Express entienda.
// 23505 = unique_violation (dos turnos misma fecha y hora a la vez).
function fallar(error) {
  console.error("[supabase]", error);
  const err = new Error(error.message);
  if (error.code === "23505") {
    err.status = 409;
    err.message = "Ese horario ya esta tomado";
  }
  return err;
}

export async function leerTurnos() {
  const { data, error } = await supabase
    .from("turnos")
    .select("*")
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  if (error) throw fallar(error);
  return data;
}

export async function guardarTurnos(turnos) {
  const { data: actuales, error: eLectura } = await supabase
    .from("turnos")
    .select("*");
  if (eLectura) throw fallar(eLectura);

  const enDb = new Map(actuales.map((t) => [t.id, t]));
  const enMemoria = new Map(turnos.map((t) => [t.id, t]));

  // POST  -> el nuevo no está en la base
  const nuevos = turnos.filter((t) => !enDb.has(t.id));

  // PATCH -> mismo id, algún campo distinto (normalmente "estado")
  const cambiados = turnos.filter((t) => {
    const viejo = enDb.get(t.id);
    return viejo && CAMPOS.some((c) => String(viejo[c]) !== String(t[c]));
  });

  // DELETE -> está en la base pero ya no en la lista que me pasaron
  const borrados = actuales.filter((t) => !enMemoria.has(t.id)).map((t) => t.id);

  if (nuevos.length) {
    const { error } = await supabase.from("turnos").insert(nuevos);
    if (error) throw fallar(error);
  }

  for (const t of cambiados) {
    const { id, ...datos } = t;
    const { error } = await supabase.from("turnos").update(datos).eq("id", id);
    if (error) throw fallar(error);
  }

  if (borrados.length) {
    const { error } = await supabase.from("turnos").delete().in("id", borrados);
    if (error) throw fallar(error);
  }
}