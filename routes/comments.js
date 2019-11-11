const express = require("express");
const router = express.Router();
const Post = require("../models/Posts");
const Comment  = require("../models/comment"),
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");
const randomstring = require("randomstring");
const mailer = require("../models/mailer");
var bodyParser = require("body-parser");
var async = require("async");
var nodemailer = require("nodemailer");
const config = require('../config/mailer');
var crypto = require("crypto");
router.use(bodyParser.urlencoded({ extended: true }));

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

router.post("/", isAuthenticated, (req, res) => {
  res.render("/");
});  

// comments Create
router.post("/", isAuthenticated, (req, res) => {
    //lookup campground using id
    post.findById(req.params.id, (err, post) => {
      if (err) { 
        console.log(err);
        res.redirect("/posts");
      }
      else {
        //create new comment
        Comment.create(req.body.comment, (err, comment) => {
          if (err) {
            req.flash("error", "Something went wrong.");
            console.log(err);
          } else {
            //add username and id to comments
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            //save comment
            comment.save();
            //connect new comment to campground
            post.comments.push(comment);
            post.save();
            //redirect to campground show page
            req.flash("success", "Successfully added comment");
            res.redirect("/posts/" + post._id);
          }
        });
      }
    });
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
    const {text,createTime,author} = req.body;

    var author = {
      id: req.user._id,
      username: req.user.username
    };
    const newComment = new Comment({
      text,
      createTime,
      author
    });

    newComment.save(function(err, resp) {
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

  module.exports = router;