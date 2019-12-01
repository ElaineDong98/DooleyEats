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
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));
//Edit profile
router.get('/edit_profile', (req, res) => res.render('edit_profile', {
    username: req.user.username,
    email:req.user.email,
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

//Blog Posts
router.get('/blog_posts', (req, res) => res.render('blog_posts', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

//trending
router.get('/trending', (req, res) => res.render('trending', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

//oldest
router.get('/oldest', (req, res) => res.render('oldest', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

//likeasc
router.get('/likeasc', (req, res) => res.render('likeasc', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

//likedes
router.get('/likedes', (req, res) => res.render('likedes', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

//New_post
router.get('/forum', (req, res) => res.render('forum', {
    username: req.user.username,
    email:req.user.email, 
    hometown: req.user.hometown,
    gender: req.user.gender,
    major: req.user.major,
    year: req.user.year
}));

module.exports = router;
