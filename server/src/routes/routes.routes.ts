import { Router } from 'express';
import { getRoutes } from '../controllers/routes.controller';

const router = Router();

router.get('/', getRoutes);

export default router;

