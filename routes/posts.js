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

//Posts Model
const Post = require("../models/Posts");

// Authorization
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "You must be registered first!");
    res.redirect("/");
  }
};
const isNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash("error_msg", "You are already logged in!");
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


  router
  .route("/")
  .get(isNotAuthenticated, (req, res) => {
    res.render("/");
  })
  .post(async (req, res, next) => {
    const { title,postType, image, description, tags, location} = req.body;

    var author = {
      id: req.user._id,
      username: req.user.username, 
      image: req.user.image
    };
    const newPost = new Post({
      title,
      postType,
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
      req.flash("error", "Error finding post");
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
      req.flash("error", "Something went wrong...");
      res.redirect("back");
    }
    if (updatedPosts.author.id.equals(req.user._id)) {
      req.flash("success", "Successfully updated your profile!");
      res.redirect("/posts/" + req.params.id);
    } else {
      req.flash("error", "You don't have permission to do that");
      res.redirect("/posts/" + req.params.id);
    }
  }
  );
});
// Edit Posts Page
// SHOW - shows more info about one Post

router.get("/:id", ensureAuthenticated,function (req, res) {
  Post.findById(req.params.id).populate({
    path: 'comments',
    populate : {
                    path : 'upvotes',
                    model : 'User'
              }
})
.exec(function(err, foundPosts) {
    if (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    } 
    else if(!foundPosts){    
            console.log("Post not found!");
            res.status(404).send("Post not found!");
    }
    else {
      User.find()
        .where("_id")
        .equals(foundPosts.author.id)
        .exec((err, user) => {
          if (err) {
            req.flash("error", "Something went wrong...");
            res.redirect("/dashboard");
          } else {
            Post.populate(foundPosts, 
              {
                  path: 'comments.downvotes',
                  model: 'User',
              }, function(err, new_post) {
                  if (err)
                  {   
                      console.log(err);
                      res.status(500).send("Sorry! an error occurred!");
                  }
                  else{
                    res.render("Posts/show_post", {post: new_post, author: user});
                  }
            });
          }
        });
      }
    });
});


// Post Like Route
router.post("/:id/like", function (req, res) {
  Post.findById(req.params.id, function (err, foundPost) {
    if (err) {
      console.log(err);
      res.redirect("back");
    }
    // check if req.user._id exists in foundPost.likes
    var foundUserLike = foundPost.likes.some(function (like) {
      return like.equals(req.user._id);
    });

    if (foundUserLike) {
      // user already liked, removing like
      foundPost.likes.pull(req.user._id);
    } else {
      // adding the new user like
      foundPost.likes.push(req.user);
    }
    foundPost.save(function (err) {
      if (err) {
        console.log(err);
        return res.redirect("back");
      }
      return res.redirect("/posts/" + foundPost._id);
    });
  });
});


// destroy campground route
router.delete("/:id", (req, res) => {
  Post.findByIdAndRemove(req.params.id, err => {
    if (err) { res.redirect("/dashboard"); }
    else {
      req.flash("success", "Post removed!");
      res.redirect("/dashboard");
    }
  });
});


module.exports = router;