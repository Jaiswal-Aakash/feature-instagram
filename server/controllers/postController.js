const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Create a new post
const createPost = async (req, res) => {
  try {
    console.log('=== POST CREATION START ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    console.log('User object:', req.user);

    const { caption, mediaUrl, mediaType, location, tags } = req.body;
    const userId = req.user._id;

    console.log('Extracted data:', {
      caption,
      mediaUrl,
      mediaType,
      location,
      tags,
      userId
    });

    const postData = {
      user: userId,
      caption,
      mediaUrl,
      mediaType,
      location,
      tags: tags || []
    };

    console.log('Post data to save:', postData);

    const post = new Post(postData);
    console.log('Post instance created:', post);

    console.log('Attempting to save post...');
    await post.save();
    console.log('Post saved successfully');

    console.log('Attempting to populate user info...');
    await post.populate('user', 'username fullName avatar');
    console.log('User info populated successfully');

    console.log('Final post object:', post.toJSON());

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

    console.log('=== POST CREATION SUCCESS ===');

  } catch (error) {
    console.error('=== POST CREATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: errors.join(', ')
      });
    }

    res.status(500).json({
      error: 'Post creation failed',
      message: 'An error occurred while creating the post',
      details: error.message
    });
  }
};

// Get all posts (feed)
const getPosts = async (req, res) => {
  try {
    console.log('Attempting to fetch posts...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('Post model:', Post);
    console.log('Post model name:', Post.modelName);

    const posts = await Post.find({ isPrivate: false })
      .populate('user', 'username fullName avatar')
      .populate('likes', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Posts found:', posts.length);

    const totalPosts = await Post.countDocuments({ isPrivate: false });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      hasNextPage: page * limit < totalPosts,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get posts error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: 'An error occurred while fetching posts',
      details: error.message
    });
  }
};

// Get posts by a specific user
const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    const posts = await Post.find({ 
      user: user._id,
      isPrivate: false 
    })
      .populate('user', 'username fullName avatar')
      .populate('likes', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      user: user._id,
      isPrivate: false 
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      hasNextPage: page * limit < totalPosts,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      error: 'Failed to fetch user posts',
      message: 'An error occurred while fetching user posts'
    });
  }
};

// Like/unlike a post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post does not exist'
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('user', 'username fullName avatar');
    await post.populate('likes', 'username fullName avatar');

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      post,
      isLiked: !isLiked
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      error: 'Failed to toggle like',
      message: 'An error occurred while toggling like'
    });
  }
};

// Add comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Comment text required',
        message: 'Please provide a comment text'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post does not exist'
      });
    }

    post.comments.push({
      user: userId,
      text: text.trim()
    });

    await post.save();
    await post.populate('user', 'username fullName avatar');
    await post.populate('comments.user', 'username fullName avatar');

    // Create notification for post owner if commenter is not the post owner
    if (post.user.toString() !== userId.toString()) {
      const newComment = post.comments[post.comments.length - 1];
      await createNotification(
        post.user, // recipient (post owner)
        userId,    // sender (commenter)
        'comment',
        postId,    // post ID
        newComment._id, // comment ID
        null       // message (will be auto-generated)
      );
    }

    res.json({
      message: 'Comment added successfully',
      post
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      message: 'An error occurred while adding comment'
    });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post does not exist'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only delete your own posts'
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: 'Failed to delete post',
      message: 'An error occurred while deleting the post'
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getUserPosts,
  toggleLike,
  addComment,
  deletePost
};
