export const documento = {
  openapi: "3.0.3",
  info: {
    title: "Appointments API · Tijeras",
    version: "1.0.0",
    description: "Booking API for a hair salon.",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/servicios": {
      get: {
        summary: "List services",
        responses: { 200: { description: "Services with price and duration" } },
      },
    },
    "/turnos/libres": {
      get: {
        summary: "Free time slots for a day",
        parameters: [
          {
            name: "fecha",
            in: "query",
            required: true,
            schema: { type: "string", example: "2026-11-20" },
          },
        ],
        responses: {
          200: { description: "Free slots" },
          400: { description: "Missing or invalid date" },
        },
      },
    },
    "/turnos": {
      post: {
        summary: "Book an appointment",
        requestBody: {
          content: {
            "application/json": {
              example: {
                nombre: "Ana Gómez",
                telefono: "3462555123",
                servicio: "corte",
                fecha: "2026-11-20",
                hora: "10:00",
              },
            },
          },
        },
        responses: {
          201: { description: "Created" },
          400: { description: "Invalid data" },
          409: { description: "Slot already taken" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Admin login, returns a JWT",
        requestBody: {
          content: {
            "application/json": {
              example: { email: "admin@pelu.ar", clave: "..." },
            },
          },
        },
        responses: {
          200: { description: "Token" },
          401: { description: "Wrong credentials" },
        },
      },
    },
  },
};
