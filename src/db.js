import { readFile, writeFile } from "node:fs/promises";

const ARCHIVO = new URL("../datos/turnos.json", import.meta.url);

export async function leerTurnos() {
  try {
    return JSON.parse(await readFile(ARCHIVO, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export async function guardarTurnos(turnos) {
  await writeFile(ARCHIVO, JSON.stringify(turnos, null, 2));
}
