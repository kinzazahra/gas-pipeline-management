const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// 1. GET ALL PROJECTS
router.get('/all', async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('projectManager', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// 2. CREATE NEW PROJECT
router.post('/create', async (req, res) => {
  try {
    const { title, description, projectManager, timeline } = req.body;
    if (!title || !description || !projectManager || !timeline?.startDate || !timeline?.deadline) {
      return res.status(400).json({ message: "All fields required." });
    }
    const newProject = new Project({ title, description, projectManager, timeline });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Creation failed' });
  }
});

// 3. UPDATE PROGRESS/STATUS
router.put('/update/:id', async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// 4. TERMINATE/DELETE PROJECT
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Terminated" });
  } catch (error) {
    res.status(500).json({ message: 'Termination failed' });
  }
});

module.exports = router;