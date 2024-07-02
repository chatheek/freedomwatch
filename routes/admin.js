// routes/admin.js
const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const { uploadImage } = require('../utils/aws');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const admin = require('firebase-admin');

// Middleware to check if user is authenticated
function checkAuth(req, res, next) {
  const token = req.cookies.token || '';

  if (token) {
    admin.auth().verifyIdToken(token)
      .then(() => {
        next();
      })
      .catch(() => {
        res.redirect('/login');
      });
  } else {
    res.redirect('/login');
  }
}

// Apply checkAuth middleware to all routes in this router
router.use(checkAuth);

router.get('/posts', async (req, res) => {
  const posts = await BlogPost.find();
  res.render('admin/posts', { posts });
});

router.get('/posts/new', (req, res) => {
  res.render('admin/newPost');
});

router.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const { Location } = await uploadImage(req.file);
    const newPost = new BlogPost({
      imageUrl: Location,
      heading: req.body.heading,
      subHeading: req.body.subHeading,
      author: req.body.author,
      date: new Date(req.body.date),
      time: req.body.time,
      content: req.body.content,
      seoMetaTitle: req.body.seoMetaTitle,
      seoMetaDescription: req.body.seoMetaDescription,
      seoMetaTags: req.body.seoMetaTags.split(','),
      category: req.body.category
    });
    await newPost.save();
    res.redirect('/admin/posts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/posts/:id/edit', async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  res.render('admin/editPost', { post });
});

router.post('/posts/:id', upload.single('image'), async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (req.file) {
      const { Location } = await uploadImage(req.file);
      post.imageUrl = Location;
    }
    post.heading = req.body.heading;
    post.subHeading = req.body.subHeading;
    post.author = req.body.author;
    post.date = new Date(req.body.date);
    post.time = req.body.time;
    post.content = req.body.content;
    post.seoMetaTitle = req.body.seoMetaTitle;
    post.seoMetaDescription = req.body.seoMetaDescription;
    post.seoMetaTags = req.body.seoMetaTags.split(',');
    post.category = req.body.category;
    await post.save();
    res.redirect('/admin/posts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.post('/posts/:id/delete', async (req, res) => {
  try {
    const postId = req.params.id;
    await BlogPost.findByIdAndDelete(postId);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).send('Server Error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(user.uid);

    // Set the token in a cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Redirect to admin posts
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).send('Login failed. Please check your credentials and try again.');
  }
});

module.exports = router;
