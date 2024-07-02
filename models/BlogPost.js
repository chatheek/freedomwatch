// models/BlogPost.js
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  imageUrl: String,
  heading: String,
  subHeading: String,
  author: String,
  date: Date,
  time: String,
  content: String,
  seoMetaTitle: String,
  seoMetaDescription: String,
  seoMetaTags: [String],
  category: { type: String, enum: ['general', 'women', 'children', 'lgbtqia'] }
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
