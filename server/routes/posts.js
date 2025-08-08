const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  getUserPosts,
  toggleLike,
  addComment,
  deletePost
} = require('../controllers/postController');

// Create a new post (requires authentication)
router.post('/', authenticateToken, createPost);

// Get all posts (feed) - can be accessed without authentication for public posts
router.get('/', getPosts);

// Get posts by a specific user
router.get('/user/:username', getUserPosts);

// Like/unlike a post (requires authentication)
router.post('/:postId/like', authenticateToken, toggleLike);

// Add comment to a post (requires authentication)
router.post('/:postId/comments', authenticateToken, addComment);

// Delete a post (requires authentication)
router.delete('/:postId', authenticateToken, deletePost);

module.exports = router;
