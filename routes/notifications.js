const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();


// Unread Notifications route
router.get('/unreadNotificationsCount', (req, res) => {
    // const { username } = req.query;
    const email = req.session.email;
    pool.query(
        'SELECT COUNT(*) AS unreadCount FROM notifications WHERE recipient_username = ? AND is_read = 0',
        [email],
        (error, results) => {
            if (error) {
                console.error('Error fetching unread notifications count:', error);
                return res.status(500).json({ success: false, message: 'Error fetching unread notifications count' });
            }
            res.json({ success: true, unreadCount: results[0].unreadCount });
        }
    );
  });
  
  // Geting Notifications route
  router.get('/getNotifications', (req, res) => {
    // const { username } = req.query;
    const email = req.session.email;
  
    pool.query(
        'SELECT id, message, is_read, timestamp FROM notifications WHERE recipient_username = ? ORDER BY timestamp DESC',
        [email],
        (error, results) => {
            if (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ success: false, message: 'Error fetching notifications' });
            }
            res.json({ success: true, notifications: results });
        }
    );
  });
  
  //getting general notifications
  router.get('/getGeneralNotifications', (req, res) => {
    pool.query(
        'SELECT id, message, is_read, timestamp FROM general_notifications ORDER BY timestamp DESC',
        (error, results) => {
            if (error) {
                console.error('Error fetching general notifications:', error);
                return res.status(500).json({ success: false, message: 'Error fetching general notifications' });
            }
            res.json({ success: true, notifications: results });
        }
    );
  });
  
  //marking notifications as read route
  router.post('/markAsRead', (req, res) => {
    const { notificationId, isGeneral } = req.body;
    const table = isGeneral ? 'general_notifications' : 'notifications';
    
    pool.query(
        `UPDATE ${table} SET is_read = 1 WHERE id = ?`,
        [notificationId],
        (error, results) => {
            if (error) {
                console.error('Error marking notification as read:', error);
                return res.status(500).json({ success: false, message: 'Error marking notification as read' });
            }
            res.json({ success: true, message: 'Notification marked as read' });
        }
    );
  });

module.exports = router;
