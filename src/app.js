import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { info } from './docs/swagger.config.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const specs = swaggerJSDoc(info);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
const PORT = process.env.PORT || 8080;
const connection = mongoose.connect(process.env.MONGO_URL)

app.use(express.json());
app.use(cookieParser());

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks',mocksRouter);

// Middleware para rutas no encontradas (debe ir después de todas las rutas)
app.use(notFoundHandler);

// Middleware para manejo de errores (debe ir al final)
app.use(errorHandler);

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}

export default app;
