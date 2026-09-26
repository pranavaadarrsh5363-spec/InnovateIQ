import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { persistentStore } from '../db/connection';
import { auditRepository } from '../repositories/auditRepository';
import { authenticateToken } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { EvidenceItem } from '../types';

const router = Router();

// Evidence search / list handler
const getEvidenceHandler = (req: Request, res: Response) => {
  const { problemId, sourceType, query, rating, domain, connectorId, page, pageSize } = req.query;
  const storeItems = persistentStore.get('evidence') || [];
  let items: EvidenceItem[] = storeItems.length > 0 ? storeItems : ((db as any).evidence || []);

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
    items = items.filter(e => e.sourceType?.toLowerCase() === (sourceType as string).toLowerCase());
  }
  if (rating && rating !== 'All') {
    items = items.filter(e => e.sourceQuality?.rating?.toLowerCase() === (rating as string).toLowerCase());
  }
  if (query) {
    const q = (query as string).toLowerCase();
    items = items.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.insight?.toLowerCase().includes(q) ||
      e.evidenceSummary?.toLowerCase().includes(q) ||
      e.sourceName?.toLowerCase().includes(q) ||
      ((e as any).summary || '').toLowerCase().includes(q)
    );
  }

  // Pagination
  if (page !== undefined) {
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const pageSizeNum = Math.max(1, parseInt(pageSize as string) || 25);
    const total = items.length;
    const totalPages = Math.ceil(total / pageSizeNum);
    const paginatedItems = items.slice((pageNum - 1) * pageSizeNum, pageNum * pageSizeNum);
    return res.json({ items: paginatedItems, total, page: pageNum, pageSize: pageSizeNum, totalPages });
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

// POST /api/evidence (Add Evidence Item with Provenance)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { problemId, title, insight, evidenceSummary, sourceName, sourceType, publicationDate, sourceUrl, confidenceLevel } = req.body;

    if (!title || !sourceName) {
      return res.status(400).json({ success: false, error: { message: 'Title and Source Name are required' } });
    }

    const newEvidence: EvidenceItem = {
      id: `ev-${Date.now()}`,
      problemId: problemId || 'prob-water-01',
      title: title.trim(),
      insight: insight || '',
      evidenceSummary: evidenceSummary || insight || '',
      sourceName: sourceName.trim(),
      sourceType: sourceType || 'Academic Source',
      publicationDate: publicationDate || new Date().toISOString().split('T')[0],
      sourceUrl: sourceUrl || 'https://openalex.org',
      confidenceLevel: confidenceLevel || 'High',
      sourceQuality: {
        authority: 'High',
        recency: 'High',
        relevance: 'High',
        completeness: 'High',
        rating: 'High',
        rationale: 'Peer-reviewed academic or direct governmental empirical open data.',
      },
      verified: true,
      isMockData: false,
    };

    const storeItems = persistentStore.get('evidence') || [];
    storeItems.unshift(newEvidence);
    persistentStore.set('evidence', storeItems);

    (db as any).evidence = (db as any).evidence || [];
    (db as any).evidence.unshift(newEvidence);

    // Audit log
    await auditRepository.create({
      id: `audit-ev-${Date.now()}`,
      userId: req.user?.id || 'u1',
      userName: req.user?.email || 'Researcher',
      userRole: req.user?.role || 'student',
      action: 'EVIDENCE_RECORDED',
      timestamp: new Date().toISOString(),
      entityType: 'Evidence',
      entityId: newEvidence.id,
      details: `Recorded citation "${newEvidence.title}" from source ${newEvidence.sourceName}`,
    });

    return res.status(201).json({ success: true, evidence: newEvidence });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to record evidence' } });
  }
});

// POST /api/evidence/evaluate
router.post('/evaluate', (req: Request, res: Response) => {
  const evaluation = aiService.evaluateSourceQuality(req.body);
  return res.json(evaluation);
});

export default router;
