import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { OrganizationProfile } from '../types';

const router = Router();

// GET /api/organizations
router.get('/', (_req: Request, res: Response) => {
  const orgs: OrganizationProfile[] = (db as any).organizations || [];
  return res.json(orgs);
});

// GET /api/organizations/:id
router.get('/:id', (req: Request, res: Response) => {
  const org = (db as any).organizations?.find((o: OrganizationProfile) => o.id === req.params.id);
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const problems = (db as any).problems?.filter((p: any) => p.organization.toLowerCase().includes(org.name.toLowerCase().split(' ')[0]));
  const pilots = (db as any).pilotPrograms?.filter((p: any) => p.organization.toLowerCase().includes(org.name.toLowerCase().split(' ')[0]));

  return res.json({
    organization: org,
    problems: problems || [],
    pilots: pilots || [],
  });
});

export default router;
