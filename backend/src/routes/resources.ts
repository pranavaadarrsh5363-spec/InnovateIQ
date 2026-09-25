import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/resources
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const { q, category, domain, page = '1', limit = '10' } = req.query as Record<string, string>;
  let results = [...db.resources];

  if (q) {
    const query = q.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some(t => t.toLowerCase().includes(query)) ||
      r.category.toLowerCase().includes(query)
    );
  }
  if (category && category !== 'All') {
    const cleanCat = category.toLowerCase().trim();
    results = results.filter(r => {
      const rCat = r.category.toLowerCase().trim();
      return rCat === cleanCat ||
        rCat.replace(/s$/, '') === cleanCat.replace(/s$/, '') ||
        rCat.includes(cleanCat) || cleanCat.includes(rCat);
    });
  }
  if (domain && domain !== 'All') {
    const cleanDomain = domain.toLowerCase().trim();
    results = results.filter(r => r.domain.toLowerCase().includes(cleanDomain) || cleanDomain.includes(r.domain.toLowerCase()));
  }

  results = results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = results.length;
  const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({ data: paginated, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
});

// GET /api/resources/saved
router.get('/saved', authenticateToken, (req: Request, res: Response) => {
  const saved = db.savedResources.filter(s => s.studentId === req.user!.id);
  const resources = saved.map(s => {
    const resource = db.resources.find(r => r.id === s.resourceId);
    return { ...s, resource };
  }).filter(s => s.resource);
  return res.json(resources);
});

// POST /api/resources/save/:resourceId
router.post('/save/:resourceId', authenticateToken, (req: Request, res: Response) => {
  const existing = db.savedResources.find(s => s.studentId === req.user!.id && s.resourceId === req.params.resourceId);
  if (existing) return res.status(409).json({ message: 'Already saved' });

  const resource = db.resources.find(r => r.id === req.params.resourceId);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  const saved = {
    id: `sv-${uuidv4().slice(0, 8)}`,
    studentId: req.user!.id,
    resourceId: req.params.resourceId,
    savedAt: new Date().toISOString(),
    notes: req.body.notes || '',
  };
  db.savedResources.push(saved);
  return res.status(201).json(saved);
});

// DELETE /api/resources/save/:resourceId
router.delete('/save/:resourceId', authenticateToken, (req: Request, res: Response) => {
  const idx = db.savedResources.findIndex(s => s.studentId === req.user!.id && s.resourceId === req.params.resourceId);
  if (idx === -1) return res.status(404).json({ message: 'Not saved' });
  db.savedResources.splice(idx, 1);
  return res.json({ message: 'Removed' });
});

// GET /api/resources/:id
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const resource = db.resources.find(r => r.id === req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });
  return res.json(resource);
});

export default router;
