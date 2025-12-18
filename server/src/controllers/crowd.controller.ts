import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';

/**
 * GET /api/crowd
 * Returns global crowd penalty (no longer segment-based)
 */
export async function getCrowd(req: Request, res: Response): Promise<void> {
  try {
    const globalPenalty = mockDataService.getGlobalCrowdPenalty();
    
    // Return global crowd penalty info
    res.json({
      global: true,
      penalty: globalPenalty,
      density: globalPenalty > 0 ? 'high' : 'normal',
    });
  } catch (error) {
    console.error('Error fetching crowd data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
