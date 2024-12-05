const express = require('express');
const router = express.Router();
const { BlogPost, validateBlogPost } = require('../models/BlogPost');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const cache = require('../middleware/cache');

// Get all published blog posts (public)
router.get('/', cache(300), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await BlogPost.find({ status: 'published' })
            .select('-content') // Exclude full content for list view
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name');

        const total = await BlogPost.countDocuments({ status: 'published' });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error('Blog fetch error:', err);
        res.status(500).json({ error: 'Error fetching blog posts' });
    }
});

// Get single blog post by slug (public)
router.get('/:slug', cache(300), async (req, res) => {
    try {
        const post = await BlogPost.findOne({ 
            slug: req.params.slug,
            status: 'published'
        }).populate('author', 'name');

        if (!post) return res.status(404).json({ error: 'Post not found' });

        res.json(post);
    } catch (err) {
        console.error('Blog post fetch error:', err);
        res.status(500).json({ error: 'Error fetching blog post' });
    }
});

// Create new blog post (admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { error } = validateBlogPost(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const post = new BlogPost({
            ...req.body,
            author: req.user._id,
            publishedAt: req.body.status === 'published' ? new Date() : null
        });

        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error('Blog post creation error:', err);
        res.status(500).json({ error: 'Error creating blog post' });
    }
});

// Update blog post (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = validateBlogPost(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                publishedAt: req.body.status === 'published' ? new Date() : null
            },
            { new: true }
        );

        if (!post) return res.status(404).json({ error: 'Post not found' });

        res.json(post);
    } catch (err) {
        console.error('Blog post update error:', err);
        res.status(500).json({ error: 'Error updating blog post' });
    }
});

// Delete blog post (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Blog post deletion error:', err);
        res.status(500).json({ error: 'Error deleting blog post' });
    }
});

module.exports = router;
