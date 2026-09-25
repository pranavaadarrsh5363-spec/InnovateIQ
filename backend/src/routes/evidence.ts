import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { aiService } from '../services/aiService';
import { EvidenceItem } from '../types';

const router = Router();

// Evidence search handler
const getEvidenceHandler = (req: Request, res: Response) => {
  const { problemId, sourceType, query, rating, domain, connectorId } = req.query;
  let items: EvidenceItem[] = (db as any).evidence || [];

  if (problemId) {
    items = items.filter(e => e.problemId === problemId || !e.problemId || e.problemId === 'prob-water-01');
  }
  if (domain && domain !== 'all') {
    const d = (domain as string).toLowerCase();
    items = items.filter(e => {
      const eDomain = ((e as any).domain || '').toLowerCase();
      if (eDomain && (eDomain.includes(d) || d.includes(eDomain))) return true;
      const linkedProb = (db as any).problems?.find((p: any) => p.id === e.problemId);
      const pDomain = (linkedProb?.domain || '').toLowerCase();
      return pDomain && (pDomain.includes(d) || d.includes(pDomain));
    });
  }
  if (connectorId && connectorId !== 'all') {
    items = items.filter(e => (e as any).connectorId === connectorId || (e as any).sourceConnectorId === connectorId);
  }
  if (sourceType && sourceType !== 'All') {
    items = items.filter(e => e.sourceType.toLowerCase() === (sourceType as string).toLowerCase());
  }
  if (rating && rating !== 'All') {
    items = items.filter(e => e.sourceQuality?.rating.toLowerCase() === (rating as string).toLowerCase());
  }
  if (query) {
    const q = (query as string).toLowerCase();
    items = items.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.insight.toLowerCase().includes(q) ||
      e.sourceName.toLowerCase().includes(q)
    );
  }

  return res.json(items);
};

// GET /api/evidence
router.get('/', getEvidenceHandler);

// GET /api/evidence/search
router.get('/search', getEvidenceHandler);

// GET /api/evidence/connectors
router.get('/connectors', (_req: Request, res: Response) => {
  const connectors = (db as any).sourceConnectors || [];
  return res.json(connectors);
});

// POST /api/evidence/evaluate
router.post('/evaluate', (req: Request, res: Response) => {
  const evaluation = aiService.evaluateSourceQuality(req.body);
  return res.json(evaluation);
});

export default router;
