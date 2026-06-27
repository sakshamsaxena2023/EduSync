const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');

// @desc    Get current user's study group
// @route   GET /api/groups/my-group
// @access  Private
exports.getMyGroup = async (req, res) => {
  try {
    // Find a group where the user is a member
    const group = await StudyGroup.findOne({ members: req.user.id })
      .populate('members', 'name email skillLevel techStack availability preferredSchedule learningGoals leetcodeUsername codeforcesUsername');
    
    if (!group) {
      return res.status(200).json(null); // Return null instead of error so frontend can show onboarding/joining options
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all study groups
// @route   GET /api/groups
// @access  Private
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate('members', 'name email')
      .select('-messages'); // Exclude messages for list view
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create study group manually
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  const { name, description, topic } = req.body;

  try {
    if (!name || !topic) {
      return res.status(400).json({ message: 'Name and topic are required' });
    }

    // Check if user is already in a group
    const existingGroup = await StudyGroup.findOne({ members: req.user.id });
    if (existingGroup) {
      return res.status(400).json({ message: 'You are already in a study group. Leave it first.' });
    }

    const group = new StudyGroup({
      name,
      description,
      topic,
      members: [req.user.id],
      clusterId: -1, // manual group
      tasks: [],
      messages: []
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join study group
// @route   POST /api/groups/:id/join
// @access  Private
exports.joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    // Check if user is already in a group
    const existingGroup = await StudyGroup.findOne({ members: req.user.id });
    if (existingGroup) {
      return res.status(400).json({ message: 'You are already in a study group.' });
    }

    group.members.push(req.user.id);
    await group.save();

    res.json({ message: 'Joined study group successfully', group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task on the group board
// @route   POST /api/groups/tasks
// @access  Private
exports.createTask = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const group = await StudyGroup.findOne({ members: req.user.id });
    if (!group) {
      return res.status(404).json({ message: 'No study group found for this user' });
    }

    const newTask = {
      title,
      description: description || '',
      status: 'todo',
      assignee: req.user.id
    };

    group.tasks.push(newTask);
    await group.save();

    res.status(201).json({ message: 'Task added successfully', tasks: group.tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/groups/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body; // 'todo', 'in-progress', 'done'
  const { taskId } = req.params;

  try {
    const group = await StudyGroup.findOne({ members: req.user.id });
    if (!group) {
      return res.status(404).json({ message: 'No study group found' });
    }

    const task = group.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;

    // Gamify: award points if completed
    if (status === 'done' && oldStatus !== 'done') {
      group.points += 15; // 15 points per task completed
    } else if (oldStatus === 'done' && status !== 'done') {
      group.points = Math.max(0, group.points - 15);
    }

    await group.save();
    res.json({ message: 'Task updated successfully', tasks: group.tasks, points: group.points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a chat message
// @route   POST /api/groups/messages
// @access  Private
exports.sendChatMessage = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    const user = await User.findById(req.user.id);
    const group = await StudyGroup.findOne({ members: req.user.id });
    if (!group) {
      return res.status(404).json({ message: 'No study group found' });
    }

    const message = {
      sender: req.user.id,
      senderName: user.name,
      text
    };

    group.messages.push(message);
    await group.save();

    res.status(201).json({ message: 'Message sent', chat: group.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
