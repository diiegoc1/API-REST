import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { turnos } from "./rutas/turnos.js";

import {auth} from "./rutas/auth.js";
import {admin} from "./rutas/admin.js";

import swaggerUi from "swagger-ui-express";
import {documento} from "./docs.js";

const app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(documento));
app.use(helmet());
app.use(cors({ origin: process.env.ORIGEN ?? "*" }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

app.use("/api/v1", turnos);
app.use("/api/v1", auth);
app.use("/api/v1/admin", admin);

app.use("/api", (req, res) =>
  res.status(404).json({ error: "Esa ruta no existe" }),
);
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status ?? 500)
    .json({ error: err.status ? err.message : "Error interno" });
});

const PUERTO = process.env.PORT ?? 3000;
app.listen(PUERTO, () =>
  console.log(`API lista en http://localhost:${PUERTO}`),
);
