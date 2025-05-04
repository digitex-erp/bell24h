/**
 * Messaging API Routes
 * Provides functionality for the secure in-platform messaging system
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure multer for message attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads/messages directory if it doesn't exist
    const dir = 'uploads/messages';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Create a unique file name to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'msg-attachment-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for message attachments
  },
  fileFilter: function (req, file, cb) {
    // Accept common file types for messaging
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
    }
  }
});

/**
 * Create a new message thread
 */
router.post('/api/message-threads', async (req, res) => {
  try {
    const { title, rfq_id, participants } = req.body;
    const created_by = req.body.user_id; // The user creating the thread
    
    if (!title || !created_by || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Invalid request parameters. Title, user_id, and at least one participant are required.' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create the thread
      const threadResult = await client.query(
        'INSERT INTO message_threads (title, rfq_id, created_by) VALUES ($1, $2, $3) RETURNING *',
        [title, rfq_id || null, created_by]
      );
      
      const thread = threadResult.rows[0];
      
      // Add participants to the thread (including the creator)
      const participantPromises = [...new Set([...participants, created_by])].map(userId => {
        return client.query(
          'INSERT INTO thread_participants (thread_id, user_id, is_admin) VALUES ($1, $2, $3) RETURNING *',
          [thread.id, userId, userId === created_by] // Creator is an admin
        );
      });
      
      const participantResults = await Promise.all(participantPromises);
      
      // Add system message announcing the thread creation
      await client.query(
        'INSERT INTO messages (sender_id, recipient_id, thread_id, content) VALUES ($1, $2, $3, $4)',
        [created_by, created_by, thread.id, `Thread "${title}" created by User #${created_by}`]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json({
        thread,
        participants: participantResults.map(r => r.rows[0])
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating message thread:', error);
    res.status(500).json({ error: 'Failed to create message thread' });
  }
});

/**
 * Get all message threads for a user
 */
router.get('/api/users/:userId/message-threads', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get all threads where the user is a participant
    const result = await pool.query(
      `SELECT mt.*, 
              (SELECT COUNT(*) FROM messages m 
               JOIN thread_participants tp ON tp.thread_id = m.thread_id 
               WHERE m.thread_id = mt.id 
               AND tp.user_id = $1 
               AND m.created_at > tp.last_read_at) as unread_count,
              (SELECT m.created_at 
               FROM messages m 
               WHERE m.thread_id = mt.id 
               ORDER BY m.created_at DESC 
               LIMIT 1) as last_activity
       FROM message_threads mt
       JOIN thread_participants tp ON mt.id = tp.thread_id
       WHERE tp.user_id = $1
       ORDER BY last_activity DESC NULLS LAST`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching message threads:', error);
    res.status(500).json({ error: 'Failed to fetch message threads' });
  }
});

/**
 * Get details of a specific message thread
 */
router.get('/api/message-threads/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    
    // Get thread details
    const threadResult = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1',
      [threadId]
    );
    
    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Get participants
    const participantsResult = await pool.query(
      `SELECT tp.*, u.username, u.email, u.first_name, u.last_name, u.profile_picture 
       FROM thread_participants tp
       JOIN users u ON tp.user_id = u.id
       WHERE tp.thread_id = $1`,
      [threadId]
    );
    
    res.json({
      thread: threadResult.rows[0],
      participants: participantsResult.rows
    });
  } catch (error) {
    console.error('Error fetching thread details:', error);
    res.status(500).json({ error: 'Failed to fetch thread details' });
  }
});

/**
 * Add a participant to a thread
 */
router.post('/api/message-threads/:threadId/participants', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const { userId, isAdmin = false } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if the thread exists
    const threadResult = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1',
      [threadId]
    );
    
    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Check if user is already a participant
    const existingResult = await pool.query(
      'SELECT * FROM thread_participants WHERE thread_id = $1 AND user_id = $2',
      [threadId, userId]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a participant in this thread' });
    }
    
    // Add participant
    const result = await pool.query(
      'INSERT INTO thread_participants (thread_id, user_id, is_admin) VALUES ($1, $2, $3) RETURNING *',
      [threadId, userId, isAdmin]
    );
    
    // Add system message announcing the new participant
    await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, thread_id, content) VALUES ($1, $2, $3, $4)',
      [userId, userId, threadId, `User #${userId} joined the conversation`]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});

/**
 * Remove a participant from a thread
 */
router.delete('/api/message-threads/:threadId/participants/:userId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const userId = parseInt(req.params.userId);
    
    // Check if the user is a participant
    const participantResult = await pool.query(
      'SELECT * FROM thread_participants WHERE thread_id = $1 AND user_id = $2',
      [threadId, userId]
    );
    
    if (participantResult.rows.length === 0) {
      return res.status(404).json({ error: 'User is not a participant in this thread' });
    }
    
    // Remove participant
    await pool.query(
      'DELETE FROM thread_participants WHERE thread_id = $1 AND user_id = $2',
      [threadId, userId]
    );
    
    // Add system message announcing participant removal
    await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, thread_id, content) VALUES ($1, $1, $2, $3)',
      [userId, threadId, `User #${userId} left the conversation`]
    );
    
    res.status(200).json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

/**
 * Send a message in a thread
 */
router.post('/api/message-threads/:threadId/messages', upload.single('attachment'), async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const { sender_id, content } = req.body;
    
    if (!sender_id || !content) {
      return res.status(400).json({ error: 'Sender ID and content are required' });
    }
    
    // Check if the thread exists
    const threadResult = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1',
      [threadId]
    );
    
    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Check if sender is a participant in the thread
    const participantResult = await pool.query(
      'SELECT * FROM thread_participants WHERE thread_id = $1 AND user_id = $2',
      [threadId, sender_id]
    );
    
    if (participantResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sender is not a participant in this thread' });
    }
    
    // Get recipients (all participants except sender)
    const recipientsResult = await pool.query(
      'SELECT user_id FROM thread_participants WHERE thread_id = $1 AND user_id != $2',
      [threadId, sender_id]
    );
    
    const recipients = recipientsResult.rows.map(row => row.user_id);
    
    // Process attachment if present
    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/messages/${req.file.filename}`;
    }
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert the message
      const messageResult = await client.query(
        'INSERT INTO messages (sender_id, recipient_id, thread_id, content, attachment_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [sender_id, recipients[0] || sender_id, threadId, content, attachmentUrl]
      );
      
      // Update thread's last_updated timestamp
      await client.query(
        'UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [threadId]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json(messageResult.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * Get all messages in a thread
 */
router.get('/api/message-threads/:threadId/messages', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const userId = parseInt(req.query.userId); // For updating read status
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get messages from the thread
    const messagesResult = await pool.query(
      `SELECT m.*, u.username, u.profile_picture 
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [threadId, limit, offset]
    );
    
    // Update last_read_at for the user if provided
    if (userId) {
      await pool.query(
        'UPDATE thread_participants SET last_read_at = CURRENT_TIMESTAMP WHERE thread_id = $1 AND user_id = $2',
        [threadId, userId]
      );
    }
    
    res.json(messagesResult.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * Mark all messages in a thread as read for a user
 */
router.post('/api/message-threads/:threadId/mark-read', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Update last_read_at timestamp
    await pool.query(
      'UPDATE thread_participants SET last_read_at = CURRENT_TIMESTAMP WHERE thread_id = $1 AND user_id = $2',
      [threadId, userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking thread as read:', error);
    res.status(500).json({ error: 'Failed to mark thread as read' });
  }
});

/**
 * Get unread message count for a user
 */
router.get('/api/users/:userId/unread-messages', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const result = await pool.query(
      `SELECT COUNT(*) as unread_count
       FROM messages m
       JOIN thread_participants tp ON tp.thread_id = m.thread_id
       WHERE tp.user_id = $1 AND m.created_at > tp.last_read_at AND m.sender_id != $1`,
      [userId]
    );
    
    res.json({ unread_count: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;