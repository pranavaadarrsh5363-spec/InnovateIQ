import { Router, Request, Response } from 'express';
import { notificationRepository } from '../repositories/notificationRepository';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 'u1';
    const orgId = (req.user as any)?.organizationId;
    let notifs = await notificationRepository.findByUserId(userId, orgId);

    if (notifs.length === 0) {
      // Seed an initial system notification for the user
      const initial = await notificationRepository.create({
        id: `notif-welcome-${Date.now()}`,
        userId,
        organizationId: orgId || 'org-iit-delhi',
        title: 'Welcome to InnovateIQ Enterprise',
        message: 'Your production innovation workspace is initialized and ready for problem-to-impact tracking.',
        type: 'SYSTEM',
        link: '/problems',
        read: false,
        createdAt: new Date().toISOString(),
      });
      notifs = [initial];
    }

    return res.json(notifs);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch notifications' } });
  }
});

// PATCH & PUT /api/notifications/:id/read
const markReadHandler = async (req: Request, res: Response) => {
  try {
    const success = await notificationRepository.markAsRead(req.params.id);
    if (!success) return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to update notification' } });
  }
};
router.patch('/:id/read', authenticateToken, markReadHandler);
router.put('/:id/read', authenticateToken, markReadHandler);

// POST & PUT /api/notifications/read-all
const markAllReadHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 'u1';
    const count = await notificationRepository.markAllAsRead(userId);
    return res.json({ success: true, count, message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { message: 'Failed to mark all as read' } });
  }
};
router.post('/read-all', authenticateToken, markAllReadHandler);
router.put('/read-all', authenticateToken, markAllReadHandler);

export default router;
