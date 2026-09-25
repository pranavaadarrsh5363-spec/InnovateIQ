import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../data/seed';
import { authenticateToken, generateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

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
    const { name, email, password, role = 'student', university, domain, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const id = `student-${Date.now()}`;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id,
      name,
      email,
      password: hashed,
      role: role as 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    db.studentProfiles[id] = {
      domain: domain || 'General',
      skills: [],
      university: university || '',
      year: year || 1,
      bio: '',
    };

    const token = generateToken({ id, email, role });
    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({ token, user: { ...safeUser, ...db.studentProfiles[id] } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password: _pw, ...safeUser } = user;
  let profile: any = {};
  if (user.role === 'student') profile = db.studentProfiles[user.id] || {};
  else if (user.role === 'mentor') profile = db.mentorProfiles[user.id] || {};

  return res.json({ ...safeUser, ...profile });
});

export default router;
