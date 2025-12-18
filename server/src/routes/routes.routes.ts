
import { Router } from 'express';
import { getRoutes } from '../controllers/routes.controller';

const router = Router();

// Test GET
router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Routes API is working' });
});

// POST /api/routes - actual routing logic
router.post('/', (req, res, next) => {
  console.log('🔍 [Backend] POST /api/routes endpoint HIT');
  console.log('🔍 [Backend] Request body:', req.body);
  console.log('🔍 [Backend] Request headers:', req.headers);
  next();
}, getRoutes);

export default router;
