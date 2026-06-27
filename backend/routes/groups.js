const express = require('express');
const router = express.Router();
const {
  getMyGroup,
  getAllGroups,
  createGroup,
  joinGroup,
  createTask,
  updateTaskStatus,
  sendChatMessage
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-group', getMyGroup);
router.get('/', getAllGroups);
router.post('/', createGroup);
router.post('/:id/join', joinGroup);

// Tasks & Chat inside a group
router.post('/tasks', createTask);
router.put('/tasks/:taskId', updateTaskStatus);
router.post('/messages', sendChatMessage);

module.exports = router;
