import { Router } from 'express';
import { getCrowd } from '../controllers/crowd.controller';

const router = Router();

router.get('/', getCrowd);

export default router;

