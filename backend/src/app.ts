import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import clientesRoutes from './routes/clientes.routes';
import ordenesRoutes from './routes/ordenes.routes';
import articulosRoutes from './routes/articulos.routes';
import { manejarErrores } from './middleware/error.middleware';

const app = express();

// Seguridad y utilidades
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas solicitudes, intente más tarde' },
});
app.use('/api', limiter);

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/articulos', articulosRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ estado: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use(manejarErrores);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

export default app;
