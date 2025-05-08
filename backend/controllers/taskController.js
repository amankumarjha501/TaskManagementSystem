const Task = require('../models/Task');
const User = require('../models/User'); // adjust path as needed

exports.createTask = async (req, res) => {
    try {
      const { title, description, assignedTo, dueDate, priority, status } = req.body;
      // Get user from token middleware
      const userId = req.user.id;
      if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
        return res.status(400).json({ error: "assignedTo must be a non-empty array of emails." });
      }
  
      const users = await User.find({ email: { $in: assignedTo } });
  
      if (users.length === 0) {
        return res.status(404).json({ error: "No users found for the provided emails." });
      }
  
      const userIds = users.map(user => user.email);
  
      const task = new Task({
        title,
        description,
        assignedTo: userIds,
        dueDate,
        priority,
        status,
        createdBy: userId,
      });
  
      await task.save();
      res.status(201).json(task);
    } catch (err) {
      console.error("Error creating task:", err);
      res.status(500).json({ error: err.message }); // Temporarily expose error
    }
  };
  

exports.getTasks = async (req, res) => {
    try {
      const tasks = await Task.find({
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.email }  // Matches if email is in the assignedTo array
        ]
      }).populate('createdBy', 'name email'); // Only populate createdBy since assignedTo is not an ObjectId
  
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
};

exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
};
