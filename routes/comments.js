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

// average calculation function
var calculateAverageRating = function (comm)
{
  if(comm.length==0)
    return 0.0;
  var sum=0.0 , avg = 0.0;
  for(var i=0;i<comm.length;i++)
  {    sum += parseFloat( comm[i].rating_value , 10 );	}// convert string to base 10 float
  avg  = sum / comm.length;
  avg = Math.round(avg*10)/10;
  return avg;
};

// save calculated average rating:
var saveAverageRating = function(req,res)
{
  Post.findById(req.params.id).populate("comments").exec(function(err,post)
  {
    if(err){	console.log(err);	res.redirect("/posts");	}
    else
    {
      var avg = calculateAverageRating(post.comments);
      post.rating_avg = avg;
      post.save(); // save all changes in current campground
    }    
  });
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

// function addOne(num){
//   return num + 1;
// }

// function subOne(num){
//   return num - 1;
// }

var increaseUpvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  {
    if(err){	
      console.log(err);	
      res.redirect("/posts");	
    } else {
  		if(searchId(com.upvotes,req.user._id)==-1) { 
        
        // add user to that comment's upvotes list
        com.upvotes.push(req.user);
        // console.log("upvotes: " + com.upvotes);
        console.log(req.user.username + " just upvoted this comment!");
        console.log("upvotes array contains " + com.upvotes);
        //increase upvoteCount by 1
        // console.log("number of upvotes before is " + com.upvoteCount);
        // com.upvoteCount = addOne(com.upvoteCount);
        // console.log("number of upvotes after is " + com.upvoteCount);

        // remove user from downvotes list, if they already downvoted the comment
        var index = searchId(com.downvotes,req.user._id);
        if(index!=-1) {
          com.downvotes.splice(index,1);
          //decrease downvoteCount by 1
          // com.downvoteCount = subOne(com.downvoteCount);
          // console.log("number of downvotes after is " + com.downvoteCount);
        }
        com.save();
        console.log("downvote array contains " + com.downvotes);
  		}
    }
  });
};

//** "undo upvote" button for commments **
var decreaseUpvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  {
    if(err){	console.log(err);	res.redirect("/posts");	}
    else
    { // remove user from that comment's upvotes list
      var index = searchId(com.upvotes,req.user._id);
      if(index!=-1)
      {
        com.upvotes.splice(index,1);
        console.log(req.user.username + " just undid a upvote!");
        //decrease upvoteCount by 1
        //com.upvoteCount = subOne(com.upvoteCount);
        //console.log("number of upvotes after is " + com.upvoteCount);
        com.save();
        console.log("upvotes array contains " + com.upvotes);
      } 
    }   
  });
};

var increaseDownvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  { 
    if(err){	
      console.log(err);	
      res.redirect("/posts");	
    }
    else {
      if(searchId(com.downvotes, req.user._id)==-1) { 
        // add user to that comment's downvotes list
        com.downvotes.push(req.user);
        // com.downvoteCount += 1;
        console.log(req.user.username + " just downvoted this comment!")
        console.log("downvotes array contains " + com.downvotes);
        //increase downvoteCount by 1
        // console.log("number of downvotes before is " + com.downvoteCount);
        // com.downvoteCount = addOne(com.downvoteCount);
        // console.log("number of downvotes after is " + com.downvoteCount);

        // remove user from upvotes list, if they already upvoted the comment
        var index = searchId(com.upvotes, req.user._id);
        if(index!=-1) {
          com.upvotes.splice(index,1);
          //decrease upvoteCount by 1
          //com.upvoteCount = subOne(com.upvoteCount);
          //console.log("number of upvotes after is " + com.upvoteCount);
        }
        com.save();
        console.log("upvotes array contains " + com.upvotes);
  		}
    }
  });
};

//** "undo downvote" button for commments **
var decreaseDownvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  {
    if(err){	console.log(err);;	res.redirect("/posts");	}
    else
    { // remove user from that comment's downvotes list
      var index = searchId(com.downvotes,req.user._id);
      if(index!=-1)
      {
        com.downvotes.splice(index,1);
        console.log(req.user.username + " just undid a downvote!");
        //decrease downvoteCount by 1
        // com.downvoteCount = subOne(com.downvoteCount);
        // console.log("number of downvotes after is " + com.downvoteCount);
        com.save();
        console.log("downvotes array contains " + com.downvotes);
      } 
    }    
  });
};

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
    // find campgrounds by id and we have to populate with comments in order to calculate avg rating from all comments
    Post.findById( req.params.id ).populate("comments").exec( function(err,post)  
    {
        if(err){	console.log(err);	res.redirect("/posts");	}
        else
        {
            const {title, anony,text} = req.body;
            Comment.create(req.body,function(err,com)
            {
              if(err){	console.log(err);	res.redirect("/posts");	}
              else{
                    //add username ,id  and date to comment
                    com.author.id = req.user._id;
                    com.author.username = req.user.username;
                    com.date = getDate();
                    com.upvoteCount = 0;
                    com.downvoteCount = 0;

                    var author = {
                      id: com.author.id,
                      username: com.author.username, 
                    };

                    var upvoteCount = com.upvoteCount;
                    var downvoteCount = com.downvoteCount;

                    const newComment = new Comment({
                      title,
                      anony,
                      text,
                      author,
                      upvoteCount,
                      downvoteCount
                    });

                    //save comment
                    newComment.save();

                    post.comments.push(newComment); // add comment to array of comments in current campground
                    // average rating calculation
                    var avg = calculateAverageRating(post.comments);
                    console.log(newComment);
                    post.rating_avg = avg;
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
        console.log("updated title is: " + req.body.title);
        console.log("updated comment is: " + req.body.text);
        saveAverageRating(req,res);
        res.redirect("/posts/" + req.params.id );
      }
    });
});

/*--------------------------------------------------------------------------*/
//  comment upvote and downvote
router.post("/:comment_id/upvote",ensureAuthenticated,function(req,res)
{
  increaseUpvotes(req,res);
  // Comment.findById(req.params.comment_id).exec(function(err,com)
  // { 
  //   console.log("number of upvotes before is " + com.upvoteCount);
  //   com.upvoteCount = addOne(com.upvoteCount);
  //   console.log("number of upvotes after is " + com.upvoteCount);
  // });
  res.redirect("/posts/"+req.params.id);
});
router.post("/:comment_id/downvote",ensureAuthenticated,function(req,res)
{
  increaseDownvotes(req,res);
  // Comment.findById(req.params.comment_id).exec(function(err,com)
  // { 
  //   console.log("number of downvotes before is " + com.downvoteCount);
  //   com.downvoteCount = addOne(com.downvoteCount);
  //   console.log("number of downvotes after is " + com.downvoteCount);
  // });
  res.redirect("/posts/"+req.params.id);
});
router.post("/:comment_id/undoupvote",ensureAuthenticated,function(req,res)
{
  decreaseUpvotes(req,res);
  // Comment.findById(req.params.comment_id).exec(function(err,com)
  // { 
  //   console.log("number of upvotes before is " + com.upvoteCount);
  //   com.upvoteCount = subOne(com.upvoteCount);
  //   console.log("number of upvotes after is " + com.upvoteCount);
  // });
  res.redirect("/posts/"+req.params.id);
});
router.post("/:comment_id/undodownvote",ensureAuthenticated,function(req,res)
{
  decreaseDownvotes(req,res);
  // Comment.findById(req.params.comment_id).exec(function(err,com)
  // { 
  //   console.log("number of downvotes before is " + com.downvoteCount);
  //   com.downvoteCount = subOne(com.downvoteCount);
  //   console.log("number of downvotes after is " + com.downvoteCount);
  // });
  res.redirect("/posts/"+req.params.id);
});

//*************************************************************************
//    DESTROY route
//*************************************************************************
router.delete("/:comment_id",ensureAuthenticated,function(req,res)
{
  Comment.findByIdAndRemove(req.params.comment_id,function(err)
  {
    req.flash("success_msg", "Comment Deleted!");
    saveAverageRating(req,res);
    res.redirect("/posts/"+req.params.id);
  });
});
  

module.exports = router;