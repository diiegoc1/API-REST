import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: "secreto-solo-para-pruebas",
      ADMIN_EMAIL: "admin@pelu.ar",
    },
  },
});