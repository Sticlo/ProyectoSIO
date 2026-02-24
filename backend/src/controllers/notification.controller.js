const NotificationModel = require('../models/notification.model');

class NotificationController {
  /**
   * Obtener todas las notificaciones
   * GET /api/notifications?unread=true&limit=50
   */
  static async getAll(req, res) {
    try {
      const onlyUnread = req.query.unread === 'true';
      const limit = parseInt(req.query.limit) || 50;

      const notifications = await NotificationModel.getAll({ onlyUnread, limit });
      const unreadCount = await NotificationModel.countUnread();

      res.json({ count: notifications.length, unreadCount, notifications });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
  }

  /**
   * Contar no leídas
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req, res) {
    try {
      const count = await NotificationModel.countUnread();
      res.json({ count });
    } catch (error) {
      console.error('Error al contar notificaciones:', error);
      res.status(500).json({ error: 'Error al contar notificaciones' });
    }
  }

  /**
   * Marcar una notificación como leída
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.markAsRead(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      res.json({ notification });
    } catch (error) {
      console.error('Error al marcar notificación:', error);
      res.status(500).json({ error: 'Error al marcar notificación' });
    }
  }

  /**
   * Marcar todas como leídas
   * POST /api/notifications/mark-all-read
   */
  static async markAllAsRead(req, res) {
    try {
      const affected = await NotificationModel.markAllAsRead();
      res.json({ message: `${affected} notificaciones marcadas como leídas` });
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
      res.status(500).json({ error: 'Error al marcar notificaciones' });
    }
  }

  /**
   * Eliminar notificación
   * DELETE /api/notifications/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await NotificationModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }
      res.json({ message: 'Notificación eliminada' });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({ error: 'Error al eliminar notificación' });
    }
  }
}

module.exports = NotificationController;
