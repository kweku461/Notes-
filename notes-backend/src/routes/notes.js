const express = require('express');
const db = require('../models');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
const Note = db.Note;


// Create note
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log("👉 Authenticated user:", req.user);

    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      UserId: req.user.id  // associate note with logged-in user
    });

    res.json(note);
  } catch (err) {
    console.error("❌ Error creating note:", err);  // log full error
    res.status(500).json({ message: "Error creating note", error: err.message });
  }
});


// Get all notes for logged-in user 
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.findAll({ where: { UserId: req.user.id } });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// Update a note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, UserId: req.user.id } });
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    note.completed = req.body.completed ?? note.completed;

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Error updating note" });
  }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.id, UserId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
});

// Get single note by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    console.error("❌ Error fetching note:", err);
    res.status(500).json({ message: "Error fetching note" });
  }
});



module.exports = router;
