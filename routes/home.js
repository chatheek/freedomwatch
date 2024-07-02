// routes/home.js
const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// Route to render the home page with the latest 10 blog posts
router.get('/', async (req, res) => {
    try {
        // Find the latest 10 blog posts, sorted by date and time in descending order
        const posts = await BlogPost.find().sort({ date: -1, time: -1 }).limit(10).exec();
        res.render('home', {
            title: 'Home',
            posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
