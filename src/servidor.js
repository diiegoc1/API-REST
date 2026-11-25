import { app } from "./app.js";

const PUERTO = process.env.PORT ?? 3000;
app.listen(PUERTO, () =>
  console.log(`API lista en http://localhost:${PUERTO}`),
);
