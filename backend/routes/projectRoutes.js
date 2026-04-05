const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// 1. GET ALL PROJECTS
// Fetches all pipelines and "populates" the manager's name and email
router.get('/all', async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('projectManager', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// 2. CREATE NEW PROJECT
// This is the missing part that handles your "Deploy Project" button
router.post('/create', async (req, res) => {
  try {
    const { title, description, projectManager, timeline } = req.body;

    // Basic validation to ensure no empty fields reach MongoDB
    if (!title || !description || !projectManager || !timeline?.startDate || !timeline?.deadline) {
      return res.status(400).json({ message: "All fields are required to initiate pipeline operations." });
    }

    const newProject = new Project({
      title,
      description,
      projectManager,
      timeline
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Project Creation Error:", error);
    res.status(500).json({ message: 'Internal Server Error: Could not deploy project.' });
  }
});

// 3. UPDATE PROJECT PROGRESS (For Managers)
router.put('/update/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;