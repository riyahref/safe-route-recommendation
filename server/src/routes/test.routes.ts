import { Router } from 'express';

const router = Router();

// Simple connectivity test endpoint
router.get('/ping', (req, res) => {
  console.log('🔍 [Backend] /api/test/ping endpoint HIT');
  res.json({ 
    success: true, 
    message: 'Backend is reachable!',
    timestamp: new Date().toISOString()
  });
});

export default router;

