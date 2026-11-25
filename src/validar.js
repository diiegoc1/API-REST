export const SERVICIOS = [
  { id: "corte", nombre: "Corte", minutos: 30, precio: 9000 },
  { id: "barba", nombre: "Barba", minutos: 30, precio: 6000 },
  { id: "color", nombre: "Color", minutos: 30, precio: 18000 },
];

export const HORAS = [];
for (let h = 9; h < 19; h++) {
  for (const m of ["00", "30"])
    HORAS.push(String(h).padStart(2, "0") + ":" + m);
}

export const hoy = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD
export const esFecha = (f) =>
  /^\d{4}-\d{2}-\d{2}$/.test(f ?? "") && !isNaN(Date.parse(f));

export function validarTurno(b) {
  const errores = [];
  const nombre = String(b.nombre ?? "").trim();
  const telefono = String(b.telefono ?? "").replace(/\D/g, "");
  if (nombre.length < 2 || nombre.length > 60)
    errores.push("nombre: entre 2 y 60 letras");
  if (telefono.length < 8 || telefono.length > 13)
    errores.push("telefono: entre 8 y 13 números");
  if (!SERVICIOS.some((s) => s.id === b.servicio))
    errores.push("servicio: no existe");
  if (!esFecha(b.fecha)) errores.push("fecha: tiene que ser AAAA-MM-DD");
  else if (b.fecha < hoy())
    errores.push("fecha: no puede ser un día que ya pasó");
  if (!HORAS.includes(b.hora))
    errores.push("hora: fuera del horario de atención");
  return {
    errores,
    turno: {
      nombre,
      telefono,
      servicio: b.servicio,
      fecha: b.fecha,
      hora: b.hora,
    },
  };
}
