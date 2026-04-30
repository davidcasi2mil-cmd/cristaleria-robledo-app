import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validate.middleware';
import { ordenSchema, actualizarOrdenSchema } from '../schemas/ordenes.schema';
import {
  crearOrdenHandler,
  obtenerOrdenesHandler,
  obtenerOrdenPorIdHandler,
  obtenerOrdenPorNumeroHandler,
  obtenerMaximoNumeroHandler,
  actualizarOrdenHandler,
  calcularHandler,
} from '../controllers/ordenes.controller';

const router = Router();

router.use(autenticar);

router.get('/', obtenerOrdenesHandler);
router.post('/', validar(ordenSchema), crearOrdenHandler);
router.post('/calcular', calcularHandler);
router.get('/maximo', obtenerMaximoNumeroHandler);
router.get('/numero/:numero', obtenerOrdenPorNumeroHandler);
router.get('/:id', obtenerOrdenPorIdHandler);
router.put('/:id', validar(actualizarOrdenSchema), actualizarOrdenHandler);

export default router;
