import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/users — admin only
router.get('/', authenticateToken, requireRole('admin'), (_req: Request, res: Response) => {
  const users = db.users.map(({ password: _p, ...u }) => ({
    ...u,
    profile: u.role === 'student' ? db.studentProfiles[u.id] : u.role === 'mentor' ? db.mentorProfiles[u.id] : undefined,
  }));
  return res.json(users);
});

// GET /api/users/students
router.get('/students', authenticateToken, requireRole('admin', 'mentor'), (_req: Request, res: Response) => {
  const students = db.users
    .filter(u => u.role === 'student')
    .map(({ password: _p, ...u }) => ({ ...u, profile: db.studentProfiles[u.id] }));
  return res.json(students);
});

// GET /api/users/mentors
router.get('/mentors', authenticateToken, requireRole('admin'), (_req: Request, res: Response) => {
  const mentors = db.users
    .filter(u => u.role === 'mentor')
    .map(({ password: _p, ...u }) => ({ ...u, profile: db.mentorProfiles[u.id] }));
  return res.json(mentors);
});

// GET /api/users/profile
router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const { password: _p, ...safeUser } = user;
  let profile: any = {};
  if (user.role === 'student') profile = db.studentProfiles[user.id] || {};
  else if (user.role === 'mentor') profile = db.mentorProfiles[user.id] || {};
  return res.json({ ...safeUser, ...profile });
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, (req: Request, res: Response) => {
  const idx = db.users.findIndex(u => u.id === req.user!.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });

  const { name, bio, domain, skills, university, year } = req.body;
  if (name) db.users[idx].name = name;

  const user = db.users[idx];
  if (user.role === 'student') {
    if (!db.studentProfiles[user.id]) db.studentProfiles[user.id] = { domain: '', skills: [], university: '', year: 1, bio: '' };
    const sp = db.studentProfiles[user.id];
    if (bio !== undefined) sp.bio = bio;
    if (domain !== undefined) sp.domain = domain;
    if (skills !== undefined) sp.skills = skills;
    if (university !== undefined) sp.university = university;
    if (year !== undefined) sp.year = year;
  }

  const { password: _p, ...safeUser } = db.users[idx];
  return res.json({ ...safeUser, ...(user.role === 'student' ? db.studentProfiles[user.id] : {}) });
});

export default router;
