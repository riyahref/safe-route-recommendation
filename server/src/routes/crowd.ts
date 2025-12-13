import { Router } from 'express';
import { getCrowd } from '../controllers/crowdController';

const router = Router();

router.get('/', getCrowd);

export default router;
