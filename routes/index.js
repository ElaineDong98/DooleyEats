const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const Post = require("../models/Posts");
const async = require('async');

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

//searching friends
router.get('/search', ensureAuthenticated, function(req, res){
	var sent =[];
	var friends= [];
	var received= [];
	received= req.user.request;
	sent= req.user.sentRequest;
	friends= req.user.friendsList;
	


	User.find({username: {$ne: req.user.username}}, function(err, result){
		if (err) throw err;
		
		res.render('search',{
			result: result,
			sent: sent,
			friends: friends,
			received: received
		});
	});
});

router.post('/search', ensureAuthenticated, function(req, res) {
    var searchfriend = req.body.searchfriend;
  if(searchfriend) {
       var mssg= '';
      if (searchfriend == req.user.username) {
          searchfriend= null;
      }
       User.find({username: searchfriend}, function(err, result) {
           if (err) throw err;
               res.render('search', {
               result: result,
               mssg : mssg
           });
         });	
  }
   
   async.parallel([
      function(callback) {
          if(req.body.receiverName) {
                  User.update({
                      'username': req.body.receiverName,
                      'request.userId': {$ne: req.user._id},
                      'friendsList.friendId': {$ne: req.user._id}
                  }, 
                  {
                      $push: {request: {
                      userId: req.user._id,
                      username: req.user.username
                      }},
                      $inc: {totalRequest: 1}
                      },(err, count) =>  {
                          console.log(err);
                          callback(err, count);
                      })
          }
      },
      function(callback) {
          if(req.body.receiverName){
                  User.update({
                      'username': req.user.username,
                      'sentRequest.username': {$ne: req.body.receiverName}
                  },
                  {
                      $push: {sentRequest: {
                      username: req.body.receiverName
                      }}
                      },(err, count) => {
                      callback(err, count);
                      })
          }
      }],
  (err, results)=>{
      res.redirect('/search');
  });

          async.parallel([
              // this function is updated for the receiver of the friend request when it is accepted
              function(callback) {
                  if (req.body.senderId) {
                      User.update({
                          '_id': req.user._id,
                          'friendsList.friendId': {$ne:req.body.senderId}
                      },{
                          $push: {friendsList: {
                              friendId: req.body.senderId,
                              friendName: req.body.senderName
                          }},
                          $pull: {request: {
                              userId: req.body.senderId,
                              username: req.body.senderName
                          }},
                          $inc: {totalRequest: -1}
                      }, (err, count)=> {
                          callback(err, count);
                      });
                  }
              },
              // this function is updated for the sender of the friend request when it is accepted by the receiver	
              function(callback) {
                  if (req.body.senderId) {
                      User.update({
                          '_id': req.body.senderId,
                          'friendsList.friendId': {$ne:req.user._id}
                      },{
                          $push: {friendsList: {
                              friendId: req.user._id,
                              friendName: req.user.username
                          }},
                          $pull: {sentRequest: {
                              username: req.user.username
                          }}
                      }, (err, count)=> {
                          callback(err, count);
                      });
                  }
              },
              function(callback) {
                  if (req.body.user_Id) {
                      User.update({
                          '_id': req.user._id,
                          'request.userId': {$eq: req.body.user_Id}
                      },{
                          $pull: {request: {
                              userId: req.body.user_Id
                          }},
                          $inc: {totalRequest: -1}
                      }, (err, count)=> {
                          callback(err, count);
                      });
                  }
              },
              function(callback) {
                  if (req.body.user_Id) {
                      User.update({
                          '_id': req.body.user_Id,
                          'sentRequest.username': {$eq: req.user.username}
                      },{
                          $pull: {sentRequest: {
                              username: req.user.username
                          }}
                      }, (err, count)=> {
                          callback(err, count);
                      });
                  }
              } 		
          ],(err, results)=> {
              res.redirect('/search');
          });
});



module.exports = router;
