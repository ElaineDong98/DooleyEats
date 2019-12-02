const express = require("express");
const router = express.Router({mergeParams: true});
const Post = require("../models/Posts");
const Comment  = require("../models/comment");
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

var searchId = function(arr,val)
{
  for(var i=0;i<arr.length;i++)
  {    if(arr[i].equals(val))
      {
        return i;
      }
  }
  return -1;
}

var getDate = function(){
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  date = new Date,  day = date.getDate(), month = monthNames[ date.getMonth() ], year = date.getFullYear();
  return day+"-"+month+"-"+year;
  
};

//Comments New
router.get("/new", isAuthenticated, function(req, res){
      // find post by id
      console.log("for post with id " + req.params.id);
      Post.findById(req.params.id, function(err, post){
          if(err){
              console.log(err);
          } else {
              res.render("comments/new", {post: post});
          }
      })
});

//Comments Create
router.post("/", isAuthenticated ,function(req,res)
{
    Post.findById( req.params.id ).populate("comments").exec( function(err,post)  
    {
        if(err){	console.log(err);	res.redirect("/posts");	}
        else
        {
            const {anony,text} = req.body;
            Comment.create(req.body,function(err,com)
            {
              if(err){	console.log(err);	res.redirect("/posts");	}
              else{
                    //add username ,id  and date to comment
                    com.author.id = req.user._id;
                    com.author.username = req.user.username;

                    var author = {
                      id: com.author.id,
                      username: com.author.username, 
                    };

                    const newComment = new Comment({
                      anony,
                      text,
                      author,
                    });

                    //save comment
                    newComment.save();

                    post.comments.push(newComment); // add comment to array of comments in current campground
                    console.log(newComment);
                    post.save(); // save all changes in current campground
                    req.flash("successArr","Comment Added!");
                    res.redirect('/posts/' + post._id);  // redirect after saving
                }
            });
        }
    });
});

//*************************************************************************
//    EDIT route
//*************************************************************************
router.get("/:comment_id/edit", ensureAuthenticated, function(req,res)
{
  Comment.findById(req.params.comment_id, function(err, foundComment){
    if(err) {	
      console.log(err);	
      res.redirect("back");	
    }
    else {
      res.render("comments/edit", {post_id:req.params.id, comment: foundComment});}
  });
});

//UPDATE
router.post("/:comment_id", ensureAuthenticated, function(req,res)
{   // find and update the correct campground
    Comment.findByIdAndUpdate(req.params.comment_id, req.body,function(err,updatedComment)
    {
      if(err){	
        console.log(err);	
        res.redirect("back");	
      }
      else { 
        req.flash("success_msg","Comment Updated!");
        console.log("updated comment is: " + req.body.text);
        res.redirect("/posts/" + req.params.id );
      }
    });
});

//*************************************************************************
//    DESTROY route
//*************************************************************************
router.delete("/:comment_id",ensureAuthenticated,function(req,res)
{
  Comment.findByIdAndRemove(req.params.comment_id,function(err)
  {
    req.flash("success_msg", "Comment Deleted!");
    res.redirect("/posts/"+req.params.id);
  });
});
  

module.exports = router;