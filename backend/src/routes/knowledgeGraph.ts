import { Router, Request, Response } from 'express';
import { db } from '../data/seed';

const router = Router();

// GET /api/knowledge-graph
router.get('/', (req: Request, res: Response) => {
  return res.json({
    nodes: db.knowledgeGraphNodes,
    edges: db.knowledgeGraphEdges,
  });
});

export default router;
