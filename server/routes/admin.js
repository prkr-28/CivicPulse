const express = require('express');
const router = express.Router();
const {
  getAllIssuesForAdmin,
  updateIssueStatus,
  getStats,
  calculatePriorities
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/issues', authMiddleware, adminMiddleware, getAllIssuesForAdmin);

router.patch('/issues/:id/status', authMiddleware, adminMiddleware, updateIssueStatus);

router.get('/stats', authMiddleware, adminMiddleware, getStats);

router.post('/calculate-priorities', authMiddleware, adminMiddleware, calculatePriorities);

module.exports = router;
