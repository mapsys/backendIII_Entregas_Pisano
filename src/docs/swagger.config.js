export const info = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Mascotas",
      version: "1.0.0",
      description: "API Mascotas para adopción y cuidado de animales.",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./src/docs/*.yaml"],
};
