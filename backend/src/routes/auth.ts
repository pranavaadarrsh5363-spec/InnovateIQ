import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../data/seed';
import { persistentStore } from '../db/connection';
import { organizationRepository } from '../repositories/organizationRepository';
import { auditRepository } from '../repositories/auditRepository';
import { authenticateToken, generateToken } from '../middleware/auth';

const router = Router();

// Helper to find user across persistent store & memory
const findUserByEmail = (email: string) => {
  const persistentUsers = persistentStore.get('users') || [];
  const found = persistentUsers.find((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());
  if (found) return found;
  return db.users.find((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase()) || null;
};

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    const { password: _pw, ...safeUser } = user;
    let profile: any = {};
    if (user.role === 'student') {
      profile = db.studentProfiles[user.id] || {};
    } else if (user.role === 'mentor') {
      profile = db.mentorProfiles[user.id] || {};
    }

    return res.json({ token, user: { ...safeUser, ...profile } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'student', university, domain, year, organizationId, organizationName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = findUserByEmail(email);
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    let resolvedOrgId = organizationId;

    // Create organization on the fly if organizationName was passed
    if (!resolvedOrgId && organizationName && organizationName.trim().length > 0) {
      const newOrg = await organizationRepository.create({
        id: `org-${organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25)}-${Date.now().toString().slice(-4)}`,
        name: organizationName.trim(),
        type: role === 'admin' ? 'Enterprise' : 'University',
        domain: domain || 'Innovation & Engineering',
        location: 'India',
        subscriptionTier: 'COMMUNITY',
        contactEmail: email.trim(),
        description: `Workspace created for ${name.trim()}`,
        createdAt: new Date().toISOString(),
      });
      resolvedOrgId = newOrg.id;
    }

    const id = `${role}-${Date.now()}`;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id,
      name: name.trim(),
      email: email.trim(),
      password: hashed,
      role: role as 'student' | 'mentor' | 'admin',
      organizationId: resolvedOrgId || undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    // Save in persistent store
    const persistentUsers = persistentStore.get('users') || [];
    persistentUsers.push(newUser);
    persistentStore.set('users', persistentUsers);

    db.users.push(newUser as any);
    if (role === 'student') {
      db.studentProfiles[id] = {
        domain: domain || 'General',
        skills: [],
        university: university || organizationName || '',
        year: year || 1,
        bio: '',
      };
    } else if (role === 'mentor') {
      db.mentorProfiles[id] = {
        title: 'Domain Mentor',
        organization: organizationName || 'Institutional Partner',
        domains: [domain || 'Engineering'],
        expertise: ['Field Trials', 'Engineering Design'],
        experienceYears: 5,
        bio: '',
        availability: 'Available',
        rating: 5,
        totalMentees: 0,
      };
    }

    // Record audit log
    await auditRepository.create({
      id: `audit-user-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      timestamp: new Date().toISOString(),
      entityType: 'User',
      entityId: newUser.id,
      organizationId: resolvedOrgId,
      details: `New ${newUser.role} user registered: ${newUser.name} (${newUser.email})`,
    });

    const token = generateToken({ id, email, role, organizationId: resolvedOrgId });
    const { password: _pw, ...safeUser } = newUser;
    const profile = (role === 'student' ? db.studentProfiles[id] : db.mentorProfiles[id]) || {};

    return res.status(201).json({ token, user: { ...safeUser, ...profile } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  const user = findUserByEmail(req.user!.email);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password: _pw, ...safeUser } = user;
  let profile: any = {};
  if (user.role === 'student') profile = db.studentProfiles[user.id] || {};
  else if (user.role === 'mentor') profile = db.mentorProfiles[user.id] || {};

  return res.json({ ...safeUser, ...profile });
});

export default router;
