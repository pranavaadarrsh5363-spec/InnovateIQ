import { persistentStore, query } from '../db/connection';
import { SystemNotification } from '../types';

export class NotificationRepository {
  /**
   * Find notifications for a specific user or organization
   */
  async findByUserId(userId: string, organizationId?: string): Promise<SystemNotification[]> {
    const list = persistentStore.get('notifications') || [];
    return list.filter((n: SystemNotification) => {
      const matchUser = n.userId === userId || n.userId === 'all';
      const matchOrg = organizationId ? !n.organizationId || n.organizationId === organizationId : true;
      return matchUser && matchOrg;
    });
  }

  /**
   * Create a new notification
   */
  async create(notification: SystemNotification): Promise<SystemNotification> {
    const list = persistentStore.get('notifications') || [];
    list.unshift(notification);

    // Limit to 500 recent notifications in store
    if (list.length > 500) {
      list.pop();
    }
    persistentStore.set('notifications', list);

    try {
      await query(
        `INSERT INTO notifications (id, user_id, organization_id, title, message, type, link, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          notification.id,
          notification.userId,
          notification.organizationId || null,
          notification.title,
          notification.message,
          notification.type || 'SYSTEM',
          notification.link || null,
          notification.read || false,
          notification.createdAt || new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return notification;
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    const list = persistentStore.get('notifications') || [];
    const item = list.find((n: SystemNotification) => n.id === id);
    if (!item) return false;
    item.read = true;
    persistentStore.set('notifications', list);

    try {
      await query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
    } catch (e) {}

    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const list = persistentStore.get('notifications') || [];
    let count = 0;
    list.forEach((n: SystemNotification) => {
      if (n.userId === userId || n.userId === 'all') {
        if (!n.read) count++;
        n.read = true;
      }
    });
    persistentStore.set('notifications', list);

    try {
      await query('UPDATE notifications SET read = TRUE WHERE user_id = $1 OR user_id = $2', [userId, 'all']);
    } catch (e) {}

    return count;
  }
}

export const notificationRepository = new NotificationRepository();
