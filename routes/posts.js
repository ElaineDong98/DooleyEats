const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const passport = require("passport");
const {ensureAuthenticated} = require('../config/auth');
const randomstring = require('randomstring');
const mailer = require("../models/mailer");
var bodyParser = require("body-parser");
var async = require("async");
var nodemailer = require("nodemailer");
const config = require('../config/mailer');
var crypto = require("crypto");
router.use(bodyParser.urlencoded({ extended: false }));

//Posts Model
const Post = require("../models/Posts");

// Authorization
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "You must be registered first!");
    res.redirect("/");
  }
};
const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("error_msg", "You are already logged in!");
    res.redirect("/");
  } else {
    return next();
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/", (req, res) => {
  let noPost = "";
  if(req.query.search){
    let searched = true;
    let numPost;
    const searchQuery = req.query.search,
          regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Post.find({ title: regex }, (err, allPosts) => {
      if (err) {
        req.flash("error", "Error: Cannot show posts");
        console.log(err);
      } else {
        if (allPosts.length < 1) {
          noPost = "There is no post found. Create one by yourself!";
        }
        numPost = allPosts.length
        res.render("Posts/blog_posts", {
          posts: allPosts,
          noPost: noPost,
          numPost: numPost,
          searched: searched, 
          searchQuery: searchQuery
        });
      }
    });
  }else{
    searched = false;
    Post.find({}, (err, allPosts) => {
      if(err){
        req.flash("error", "Error: Cannot show posts");
        console.log(err); 
      }else{
        if (allPosts.length < 1){
          noPost = "There is no post found. Create one by yourself!";
        }
        res.render("Posts/blog_posts", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});


router.get('/new_post', ensureAuthenticated, (req, res) =>
  res.render('Posts/new_post', {
    username: req.user.username
  }));

router.get('/show_post', ensureAuthenticated, (req, res) =>
  res.render('Posts/show_post', {
    username: req.user.username
  }));



  router
  .route("/")
  .get(isNotAuthenticated, (req, res) => {
    res.render("/");
  })
  .post(async (req, res, next) => {
    const { title, image, description, tags, location} = req.body;

    var author = {
      id: req.user._id,
      username: req.user.username
    };
    const newPost = new Post({
      title,
      image,
      description,
      tags,
      location,
      author
    });

    newPost.save(function(err, resp) {
      if (err) {
        console.log(err);
        res.send({
          message: 'something went wrong'
        });
      } else {
        res.redirect("/posts");
      }
    });
  });


// Edit Posts Page
router.get("/edit/:id", function (req, res) {
  Post.findById(req.params.id, function (err, foundPosts) {
    if (err) {
      req.flash("error", "Error finding post");
      res.redirect("back");
    } else {
      res.render("Posts/edit_post", {
        posts: foundPosts
      });
    }
  });
});


router.put("/:id", ensureAuthenticated, (req, res) => {
  Post.findByIdAndUpdate(req.params.id, req.body, (err, updatedPosts) => {
    if (err) {
      req.flash("error", "Something went wrong...");
      res.redirect("back");
    }
    if (updatedPosts.author.id.equals(req.user._id)) {
      req.flash("success", "Successfully updated your profile!");
      res.redirect("/posts/" + req.params.id);
    } else {
      req.flash("error", "You don't have permission to do that");
      res.redirect("/posts/" + req.params.id);
    }
  }
  );
});
// Edit Posts Page
// SHOW - shows more info about one campground

router.get("/:id", (req, res) => {
  Post.findById(req.params.id, (err, foundPosts)=> {
    if (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    } else {
      User.find()
        .where("_id")
        .equals(foundPosts.author.id)
        .exec((err, user) => {
          if (err) {
            req.flash("error", "Something went wrong...");
            res.redirect("/dashboard");
          } else {
            res.render("Posts/show_post", {
              post: foundPosts,
              author: user
            });
          }
        });
    }
  });
});

module.exports = router;