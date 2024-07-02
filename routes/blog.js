// routes/blog.js
const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// Route to render blog posts by category
router.get('/:category', async (req, res) => {
    const category = req.params.category.toLowerCase();
    try {
        // Find posts by category and sort by date and time in descending order
        const posts = await BlogPost.find({ category }).sort({ date: -1, time: -1 }).exec();
        res.render('blog-category', {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Blog`,
            posts,
            category: category.charAt(0).toUpperCase() + category.slice(1)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render an individual blog post by its ID
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await BlogPost.findById(postId);

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('blog-post', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
