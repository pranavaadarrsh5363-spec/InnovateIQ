import { Router, Request, Response } from 'express';
import { db } from '../data/seed';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const userNotifs = db.notifications.filter(n => n.userId === (req.user?.id || 'student-1'));
  return res.json(userNotifs);
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ message: 'Notification not found' });
  notif.read = true;
  return res.json(notif);
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (req: Request, res: Response) => {
  db.notifications.forEach(n => {
    if (n.userId === (req.user?.id || 'student-1')) n.read = true;
  });
  return res.json({ message: 'All notifications marked as read' });
});

export default router;
