const express = require('express');
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getNearbyIssues,
  getMyIssues,
  getIssueById,
  upvoteIssue,
  deleteIssue
} = require('../controllers/issueController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', authMiddleware, upload.fields([
  { name: 'photos', maxCount: 5 }
]), createIssue);

router.get('/', getAllIssues);

router.get('/nearby', getNearbyIssues);

router.get('/my', authMiddleware, getMyIssues);

router.get('/:id', getIssueById);

router.patch('/:id/upvote', authMiddleware, upvoteIssue);

router.delete('/:id', authMiddleware, deleteIssue);

module.exports = router;
