import { Router } from 'express';
import { loginHandler, registrarHandler, perfilHandler } from '../controllers/auth.controller';
import { validar } from '../middleware/validate.middleware';
import { autenticar, requerirRol } from '../middleware/auth.middleware';
import { loginSchema, registroSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', validar(loginSchema), loginHandler);
router.post('/registro', autenticar, requerirRol('ADMIN'), validar(registroSchema), registrarHandler);
router.get('/perfil', autenticar, perfilHandler);

export default router;
