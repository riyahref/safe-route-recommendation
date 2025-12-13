import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';

/**
 * GET /api/crowd
 * Returns crowd density for specified segments
 */
export async function getCrowd(req: Request, res: Response) {
  try {
    const segmentIdsParam = req.query.segmentIds as string;

    if (!segmentIdsParam) {
      return res.status(400).json({ error: 'Missing segmentIds parameter' });
    }

    const segmentIds = segmentIdsParam.split(',');
    const crowdDensities = mockDataService.getCrowdDensities(segmentIds);

    // Return array of crowd density objects
    res.json(
      crowdDensities.map((cd) => ({
        segmentId: cd.segmentId,
        density: cd.density,
        value: cd.value,
      }))
    );
  } catch (error) {
    console.error('Error fetching crowd data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

