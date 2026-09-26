import { Router, Request, Response } from 'express';
import { organizationRepository } from '../repositories/organizationRepository';
import { problemRepository } from '../repositories/problemRepository';
import { pilotRepository } from '../repositories/pilotRepository';
import { deviceRepository } from '../repositories/deviceRepository';
import { auditRepository } from '../repositories/auditRepository';
import { authenticateToken } from '../middleware/auth';
import { Organization } from '../types';

const router = Router();

// GET /api/organizations
router.get('/', async (_req: Request, res: Response) => {
  try {
    const orgs = await organizationRepository.findAll();
    return res.json(orgs);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve organizations' } });
  }
});

// GET /api/organizations/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const org = await organizationRepository.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: { message: 'Organization not found' } });

    const problems = await problemRepository.findAll({ organizationId: org.id });
    const pilots = await pilotRepository.findAll({ organizationId: org.id });

    return res.json({
      organization: org,
      problems: problems || [],
      pilots: pilots || [],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to retrieve organization' } });
  }
});

// POST /api/organizations (Register new organization)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, type, domain, location, subscriptionTier, contactEmail, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Organization name is required' } });
    }

    const orgId = `org-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Date.now().toString().slice(-4)}`;
    const newOrg: Organization = {
      id: orgId,
      name: name.trim(),
      type: type || 'Enterprise',
      domain: domain || 'Technology & Innovation',
      location: location || 'India',
      subscriptionTier: subscriptionTier || 'COMMUNITY',
      contactEmail: contactEmail || req.user?.email || 'admin@organization.com',
      description: description || '',
      memberCount: 1,
      activeProblemsCount: 0,
      activePilotsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const saved = await organizationRepository.create(newOrg);

    // Audit log
    await auditRepository.create({
      id: `audit-org-${Date.now()}`,
      userId: req.user?.id || 'admin',
      userName: req.user?.email || 'Admin',
      userRole: req.user?.role || 'admin',
      action: 'ORGANIZATION_CREATED',
      timestamp: new Date().toISOString(),
      entityType: 'Organization',
      entityId: saved.id,
      organizationId: saved.id,
      details: `Created new organization entity: ${saved.name} (${saved.type})`,
    });

    return res.status(201).json({ success: true, organization: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: err.message || 'Failed to create organization' } });
  }
});

// GET /api/organizations/:id/stats
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const orgId = req.params.id;
    const org = await organizationRepository.findById(orgId);
    if (!org) return res.status(404).json({ success: false, error: { message: 'Organization not found' } });

    const probResult = await problemRepository.findAll({ organizationId: orgId });
    const problemsList = Array.isArray(probResult) ? probResult : ((probResult as any).items || []);
    const pilotResult = await pilotRepository.findAll({ organizationId: orgId });
    const pilotsList = Array.isArray(pilotResult) ? pilotResult : ((pilotResult as any).items || []);
    const allDevices = await deviceRepository.findAll(false);
    const orgDevices = allDevices.filter(d => pilotsList.some((p: any) => p.id === d.pilotId));

    return res.json({
      success: true,
      stats: {
        organizationId: orgId,
        name: org.name,
        totalProblems: problemsList.length,
        totalPilots: pilotsList.length,
        totalDevices: orgDevices.length,
        onlineDevicesCount: orgDevices.filter(d => d.status === 'ONLINE').length,
        criticalDevicesCount: orgDevices.filter(d => d.status === 'CRITICAL').length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch organization stats' } });
  }
});

export default router;
