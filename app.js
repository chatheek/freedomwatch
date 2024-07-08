const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const aws = require('aws-sdk');
const mongoose = require('mongoose');
const multerS3 = require('multer-s3');
const multer = require('multer');
const BlogPost = require('./models/BlogPost'); 


const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');
const homeRoutes = require('./routes/home');

const app = express();
const port = 3000;


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-admin-sdk.json'))
});

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));




// AWS S3 Configuration
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      },
    }),
  });


// Use Routes
app.use('/admin', adminRoutes);
app.use('/blog', blogRoutes);
app.use('/', homeRoutes);

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



app.get('/blog/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const posts = await BlogPost.find({ category: category });
    res.render('blog-category', {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Blog`,
      posts: posts,
      category: category.charAt(0).toUpperCase() + category.slice(1)
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).send('Server Error');
  }
});


app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/admin', checkAuth, (req, res) => {
  res.render('admin', { title: 'Admin' });
});

app.get('/blog', (req, res) => {
  res.render('blog', { title: 'Blog' });
});

app.get('/blog/general', async (req, res) => {
    const posts = await BlogPost.find({ category: 'general' });
    res.render('blog-category', { title: 'General Blog', posts, category: 'General' });
  });
  
  app.get('/blog/women', async (req, res) => {
    const posts = await BlogPost.find({ category: 'women' });
    res.render('blog-category', { title: 'Women\'s Blog', posts, category: 'Women' });
  });
  
  app.get('/blog/children', async (req, res) => {
    const posts = await BlogPost.find({ category: 'children' });
    res.render('blog-category', { title: 'Children\'s Blog', posts, category: 'Children' });
  });
  
  app.get('/blog/lgbtqia', async (req, res) => {
    const posts = await BlogPost.find({ category: 'lgbtqia' });
    res.render('blog-category', { title: 'LGBTQIA+ Blog', posts, category: 'LGBTQIA+' });
  });

app.get('/engage', (req, res) => {
  res.render('engage', { title: 'Engage' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});


// Dynamic sitemap generation route
app.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await BlogPost.find();
    const urls = posts.map(post => {
      const lastmod = post.updatedAt ? post.updatedAt.toISOString() : new Date().toISOString();
      return `<url>
        <loc>${req.protocol}://${req.get('host')}/blog/post/${post._id}</loc>
        <lastmod>${lastmod}</lastmod>
      </url>`;
    }).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${req.protocol}://${req.get('host')}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>
        ${urls}
      </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Server Error: Could not generate sitemap');
  }
});





app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});