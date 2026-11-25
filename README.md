# Turnos — reservas online para una peluquería

## La página

**https://api-rest-vzuj.onrender.com**

Ahí hay dos cosas juntas: la página para que los clientes reserven y el panel para que el dueño del local maneje sus turnos. La documentación técnica de la API está en `/docs`.

## ¿Qué hace?

Una peluquería necesita tomar turnos sin que se le superpongan. Esta web resuelve eso:

1. El cliente entra a la página, elige el servicio (corte, barba o color) y una fecha.
2. Al elegir la fecha, **la página le muestra solamente las horas que están libres** de ese día, en franjas de media hora de 9:00 a 18:30.
3. Completa su nombre y teléfono, y reserva. Recibe la confirmación al instante.
4. El dueño entra con su email y su clave, ve la lista de turnos y los puede **confirmar o cancelar** con un botón.

## Lo que lo hace confiable

- **No se puede reservar dos veces el mismo horario.** No es solo un control de la página: la base de datos misma lo impide, así que aunque dos personas intenten reservar la misma hora en el mismo segundo, solo una lo logra.
- **La página no deja elegir un horario ya ocupado**, porque solo muestra las horas que quedan libres.
- **El panel del dueño está protegido**: sin usuario y contraseña no se puede ver ni modificar nada.
- **Está preparada para el uso real**: limita cuántas reservas puede hacer una misma persona por minuto y cuántos intentos de login se permiten, para que nadie pueda saturarla.

## Tecnologías

- **Node.js + Express**: el "motor" que atiende los pedidos de la página.
- **Supabase (Postgres)**: la base de datos en la nube donde quedan guardados los turnos.
- **JWT + bcrypt**: el sistema de login del dueño. La contraseña no se guarda, se guarda su huella cifrada.
- **HTML, CSS y JavaScript**: la página, sin frameworks, para que sea liviana y rápida.
- **Vitest + Supertest**: pruebas automáticas que verifican que reservar funciona, que no se puede pisar un turno y que el panel rechaza a quien no tiene permiso.
- **Render**: el servicio en la nube donde está publicada.

## En una frase

Es una API con una página web que permite a los clientes de una peluquería reservar su turno solos, sin llamar por teléfono, con la garantía de que nunca se van a superponer dos reservas, y con un panel simple para que el dueño organice su día.
