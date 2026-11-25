import { Router } from "express";
import { leerTurnos, guardarTurnos } from "../db.js";
import { soloAdmin } from "../middleware/auth.js";

export const admin = Router();
admin.use(soloAdmin); // Protege todas las rutas de este archivo

admin.get("/turnos", async (req, res) => {
  const { fecha, estado } = req.query;
  
  // Convertimos a número, si falla usamos 1 (página) y 10 (límite por defecto)
  const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
  const limite = Math.min(50, Math.max(1, parseInt(req.query.limite) || 10));

  let lista = await leerTurnos();
  
  // Filtros opcionales
  if (fecha) lista = lista.filter((t) => t.fecha === fecha);
  if (estado) lista = lista.filter((t) => t.estado === estado);
  
  // Ordenamos por fecha y hora
  lista.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  // Paginado: cortamos el array según la página y el límite
  res.json({ 
    total: lista.length, 
    pagina, 
    limite, 
    datos: lista.slice((pagina - 1) * limite, pagina * limite) 
  });
});

const ESTADOS = ["pendiente", "confirmado", "atendido", "cancelado"];

// PATCH: Cambiar el estado (confirmar, cancelar, etc.)
admin.patch("/turnos/:id", async (req, res) => {
  const { estado } = req.body ?? {};
  
  if (!ESTADOS.includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const lista = await leerTurnos();
  const turno = lista.find((t) => t.id === req.params.id);
  
  if (!turno) {
    return res.status(404).json({ error: "No existe ese turno" });
  }

  turno.estado = estado;
  await guardarTurnos(lista);
  
  res.json(turno);
});

// DELETE: Borrar un turno
admin.delete("/turnos/:id", async (req, res) => {
  const lista = await leerTurnos();
  
  // Filtramos para dejar todos MENOS el que queremos borrar
  const resto = lista.filter((t) => t.id !== req.params.id);
  
  // Si la longitud no cambió, significa que el ID no existía
  if (resto.length === lista.length) {
    return res.status(404).json({ error: "No existe ese turno" });
  }

  await guardarTurnos(resto);
  res.status(204).end(); // 204 significa "Sin contenido", fue exitoso
});