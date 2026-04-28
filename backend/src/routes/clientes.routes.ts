import { Router } from 'express';
import { autenticar } from '../middleware/auth.middleware';
import { validar } from '../middleware/validate.middleware';
import { clienteSchema, actualizarClienteSchema } from '../schemas/clientes.schema';
import {
  crearClienteHandler,
  obtenerClientesHandler,
  obtenerClientePorIdHandler,
  actualizarClienteHandler,
  eliminarClienteHandler,
} from '../controllers/clientes.controller';

const router = Router();

router.use(autenticar);

router.get('/', obtenerClientesHandler);
router.post('/', validar(clienteSchema), crearClienteHandler);
router.get('/:id', obtenerClientePorIdHandler);
router.put('/:id', validar(actualizarClienteSchema), actualizarClienteHandler);
router.delete('/:id', eliminarClienteHandler);

export default router;
