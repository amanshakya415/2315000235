import express from 'express';
import {
  createNotification,
  getNotifications,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/create', createNotification);
router.get('/all', getNotifications);
router.delete('/:id', deleteNotification);

export default router;
