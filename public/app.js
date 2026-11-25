const API = "/api/v1";
const $ = (id) => document.getElementById(id);

async function pedir(ruta, opciones = {}) {
  const r = await fetch(API + ruta, {
    ...opciones,
    headers: { "Content-Type": "application/json", ...opciones.headers },
  });
  const datos = r.status === 204 ? null : await r.json();
  if (!r.ok)
    throw new Error(
      datos?.detalles?.join(" · ") || datos?.error || "Error " + r.status,
    );
  return datos;
}

async function cargarServicios() {
  const servicios = await pedir("/servicios");
  $("servicio").innerHTML = servicios
    .map(
      (s) =>
        `<option value="${s.id}">${s.nombre} · $${s.precio.toLocaleString("es-AR")}</option>`,
    )
    .join("");
}

$("fecha").min = new Date().toLocaleDateString("sv-SE");
$("fecha").addEventListener("change", async () => {
  const { libres } = await pedir("/turnos/libres?fecha=" + $("fecha").value);
  $("hora").innerHTML = libres.length
    ? libres.map((h) => `<option>${h}</option>`).join("")
    : '<option value="">No quedan turnos ese día</option>';
});

$("reserva").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const t = await pedir("/turnos", {
      method: "POST",
      body: JSON.stringify({
        servicio: $("servicio").value,
        fecha: $("fecha").value,
        hora: $("hora").value,
        nombre: $("nombre").value,
        telefono: $("telefono").value,
      }),
    });
    $("msg").textContent = `✓ Turno reservado: ${t.fecha} a las ${t.hora}`;
    $("fecha").dispatchEvent(new Event("change"));
  } catch (err) {
    $("msg").textContent = "✗ " + err.message;
  }
});

cargarServicios();

const conToken = () => ({
  Authorization: "Bearer " + sessionStorage.getItem("token"),
});

async function cargarTurnos() {
  const { datos } = await pedir("/admin/turnos?limite=50", {
    headers: conToken(),
  });
  $("lista").replaceChildren(
    ...datos.map((t) => {
      const li = document.createElement("li");
      li.textContent = `${t.fecha} ${t.hora} · ${t.nombre} (${t.telefono}) · ${t.servicio} · ${t.estado} `;
      for (const estado of ["confirmado", "cancelado"]) {
        const b = document.createElement("button");
        b.textContent = estado === "confirmado" ? "Confirmar" : "Cancelar";
        b.onclick = async () => {
          await pedir("/admin/turnos/" + t.id, {
            method: "PATCH",
            headers: conToken(),
            body: JSON.stringify({ estado }),
          });
          cargarTurnos();
        };
        li.append(b);
      }
      return li;
    }),
  );
}

$("login").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const { token } = await pedir("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("email").value,
        clave: $("clave").value,
      }),
    });
    sessionStorage.setItem("token", token);
    $("login").hidden = true;
    cargarTurnos();
  } catch (err) {
    alert(err.message);
  }
});
