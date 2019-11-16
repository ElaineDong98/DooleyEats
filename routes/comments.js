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
var increaseUpvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  {
    if(err){	console.log(err);	res.redirect("/posts");	}
    else
    {
  		if(searchId(com.upvotes,req.user._id)==-1)
  		{ // add user to that comment's upvotes list
  			com.upvotes.push(req.user);
        // remove user from downvotes list, if they already downvoted the comment
        var index = searchId(com.downvotes,req.user._id);
        if(index!=-1)
          com.downvotes.splice(index,1);
        com.save();
  		}
    }    
  });
};

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
        com.save();
      } 
    }   
  });
};

var increaseDownvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  {
    if(err){	console.log(err);	res.redirect("/posts");	}
    else
    {
      if(searchId(com.downvotes,req.user._id)==-1)
  		{ // add user to that comment's downvotes list
  			com.downvotes.push(req.user);
        // remove user from upvotes list, if they already upvoted the comment
        var index = searchId(com.upvotes,req.user._id);
        if(index!=-1)
          com.upvotes.splice(index,1);
        com.save();
  		}
    }
  });
};
var decreaseDownvotes = function(req,res)
{
  Comment.findById(req.params.comment_id).exec(function(err,com)
  {
    if(err){	req.flash("error_msg",err.message);	res.redirect("/posts");	}
    else
    { // remove user from that comment's downvotes list
      var index = searchId(com.downvotes,req.user._id);
      if(index!=-1)
      {
        com.downvotes.splice(index,1);
        com.save();
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

// // comments Create
// router.post("/", isAuthenticated, (req, res) => {
//     //lookup campground using id
//     // Post.findById(req.params.id, (err, post) => {
//     //   if (err) { 
//     //     console.log(err);
//     //     res.redirect("/posts");
//     //   }
//     //   else {
//     //     //create new comment
//     //     Comment.create(req.body.comment, (err, comment) => {
//     //       if (err) {
//     //         req.flash("error", "Something went wrong.");
//     //         console.log(err);
//     //       } else {
//     //         //add username and id to comments
//     //         comment.author.id = req.user._id;
//     //         comment.author.username = req.user.username;
//     //         comment.text = "hello world";
//     //         //save comment
//     //         comment.save();
//     //         //console.log(comment);
//     //         console.log("user id is " + comment.author.id);
//     //         console.log("user is " + comment.author.username);
//     //         console.log("text is " + comment.text);
//     //         //connect new comment to campground
//     //         post.comments.push(comment);
//     //         post.save();
//     //         //redirect to campground show page
//     //         //console.log(comment);
//     //         req.flash("success", "Successfully added comment");
//     //         res.redirect("/posts/" + post._id);
//     //       }
//     //     });
//     //   }
//     // });
//     Post.findById(req.params.id, (err, post) => {
//       if (err) { 
//         console.log(err);
//         res.redirect("/posts");
//       }
//       const {title, text} = req.body;

//       var author = {
//         id: req.user._id,
//         username: req.user.username, 
//       };
//       const newComment = new Comment({
//         title,
//         text,
//         author
//       });

//       post.comments.push(newComment);
//       newComment.save(function(err, resp) {
//         if (err) {
//           console.log(err);
//           res.send({
//             message: 'something went wrong'
//           });
//         } else {
//           console.log("a user with id " + newComment.author.id);
//           console.log("and name " + newComment.author.username);
//           console.log("posted this title: " + newComment.title);
//           console.log("and this comment: " + newComment.text);
//           req.flash("success_msg", "Comment Added!");
//           res.redirect("/posts/" + post._id);
//         }
//       });
//     });
//   });


// //Comments Create
// router.post("/", isAuthenticated ,function(req,res)
// {
//     // find campgrounds by id and we have to populate with comments in order to calculate avg rating from all comments
//     Post.findById(req.params.id).populate("comments").exec( function(err,post)
//     {
//         if(err) {	
//           console.log(err);	
//           res.redirect("/posts");	
//         }
//         else
//         {
//             const {title, text} = req.body;
//             Comment.create(req.body,function(err,com)
//             {
//               if(err){ 
//                 console.log("comment is " + req.body);
//                 console.log(err);	
//                 res.redirect("/posts");	
//               }
//               else {
//                 //add username ,id  and date to comment
//                 com.author.id = req.user._id;
//                 com.author.username = req.user.username;
//                 com.date = getDate();

//                 //const {title, text} = req.body;
//                 var author = {
//                   id: com.author.id,
//                   username: com.author.username, 
//                 };

//                 const newComment = new Comment({
//                   title: title,
//                   text: text,
//                   author: author
//                 });

//                 post.comments.push(newComment); // add comment to array of comments in current campground

//                 // average rating calculation
//                 var avg = calculateAverageRating(post.comments);
//                 console.log(com);
//                 post.rating_avg = avg;

//                 newComment.save(function(err, resp) {
//                   if (err) {
//                     console.log(err);
//                     res.send({
//                       message: 'something went wrong'
//                     });
//                   } else {
//                     console.log("a user with id " + newComment.author.id);
//                     console.log("and name " + newComment.author.username);
//                     console.log("posted this comment: " + newComment.title);
//                     console.log("with content : " + newComment.text);                    
//                     req.flash("success_msg", "Comment Added!");
//                     res.redirect("/posts/" + post._id);
//                   }
//                 });
               
//                 }
//             });
//         }
//     });
// });

//Comments Create
router.post("/", isAuthenticated ,function(req,res)
{
    // find campgrounds by id and we have to populate with comments in order to calculate avg rating from all comments
    Post.findById( req.params.id ).populate("comments").exec( function(err,post)  
    {
        if(err){	console.log(err);	res.redirect("/posts");	}
        else
        {
            const {title, text} = req.body;
            Comment.create(req.body,function(err,com)
            {
              if(err){	console.log(err);	res.redirect("/posts");	}
              else{
                    //add username ,id  and date to comment
                    com.author.id = req.user._id;
                    com.author.username = req.user.username;
                    com.date = getDate();

                    var author = {
                      id: com.author.id,
                      username: com.author.username, 
                    };

                    const newComment = new Comment({
                      title,
                      text,
                      author
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


  

  module.exports = router;