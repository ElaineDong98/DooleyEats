const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const Post = require("../models/Posts");

 // Welcome Page
 router.get('/', (req, res) => res.render('welcome'));
 // Dashboard
 router.get('/dashboard',ensureAuthenticated, (req, res) => 
    Post.find({},  (err, foundPosts) => {
        res.render('dashboard', {
            posts: foundPosts,
            username: req.user.username
          })
        }
      ).sort({ createdAt: 'desc' }));
      
    
//Search
router.get('/search', (req, res) => res.render('search'));


//Show profile
router.get('/show_profile', (req, res) => res.render('show_profile', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender
}));
//Edit profile
router.get('/edit_profile', (req, res) => res.render('edit_profile', {
    username: req.user.username,
    email:req.user.email,
    hometown: req.user.hometown,
    gender: req.user.gender
}));

//Blog Posts
router.get('/blog_posts', (req, res) => res.render('blog_posts', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender
}));

//New_post
router.get('/forum', (req, res) => res.render('forum', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender
}));

module.exports = router;
