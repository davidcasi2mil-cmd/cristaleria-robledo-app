import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validate.middleware';
import { articuloSchema, actualizarArticuloSchema } from '../schemas/articulos.schema';
import {
  crearArticuloHandler,
  obtenerArticulosHandler,
  obtenerArticuloPorIdHandler,
  actualizarArticuloHandler,
} from '../controllers/articulos.controller';

const router = Router();

router.use(autenticar);

router.get('/', obtenerArticulosHandler);
router.post('/', validar(articuloSchema), crearArticuloHandler);
router.get('/:id', obtenerArticuloPorIdHandler);
router.put('/:id', validar(actualizarArticuloSchema), actualizarArticuloHandler);

export default router;
