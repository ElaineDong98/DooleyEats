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


// router.post('/', function(req, res) {

//   //const { title, image, description, tags, location } = req.body;
//   console.log("title is", req.body.title);

//     var newPost = new Post({
//       title: req.body.title,
//       image: req.body.image,
//       description: req.body.description,
//       tags: req.body.tags,
//       location: req.body.location
//       // var author = {
//       //       id: req.user._id,
//       //       username: req.user.username
//       //     };
//     });
//     console.log(newPost);
  
//     newPost.save(function(err, resp) {
//       if (err) {
//         console.log(err);
//         res.send({
//           message: 'something went wrong'
//         });
//       } else {
//         res.send({
//           message: 'the post has been saved'
//         });
//       }
  
//     });
//   });  

  router
  .route("/")
  .get(isNotAuthenticated, (req, res) => {
    res.render("/");
  })
  .post(async (req, res, next) => {
    console.log("title is", req.body.title);
    console.log("image is", req.body.image);
    console.log("description is", req.body.description);
    console.log("tags is", req.body.tags);
    console.log("location is", req.body.location);
    const { title, image, description, tags, location} = req.body;

    // let errors = []; //Check required fields

    // if (!username || !email || !password || !password2) {
    //   errors.push({ msg: "Please fill in all fields" });
    // } //Check if passwords match

    // if (password !== password2) {
    //   errors.push({ msg: "Passwords do not match" });
    // } // Require password length to be between 5 and 20

    // if (password.length < 5 || password.length > 20) {
    //   errors.push({ msg: "Password should be between 5 and 20 characters" });
    // }
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
        // res.send({
        //   message: 'the post has been saved'
        //   // redirect to the campgrounds route

        // });
        res.redirect("/posts");
      }
    });

    // if (errors.length > 0) {
    //   res.render("register", {
    //     errors,
    //     username,
    //     email,
    //     password,
    //     password2
    //   });
    // } else {
    //   // Validation passed
    //   User.findOne({ email: email }).then(async user => {
    //     if (user) {
    //       errors.push({ msg: "Email already exists" });
    //       res.render("register", {
    //         errors,
    //         username,
    //         email,
    //         password,
    //         password2
    //       });
    //     } else {
    //       const newUser = new User({
    //         username,
    //         email,
    //         password
    //       });

    //       bcrypt.genSalt(10, (err, salt) => {
    //         bcrypt.hash(newUser.password, salt, (err, hash) => {
    //           if (err) throw err;
    //           newUser.password = hash; 

    //           // Flag account as inactive
    //           User.active = false;

    //           newUser
    //             .save()
    //             .then(async user => {
    //                 // Compose email
    //                 const html = `Hi <b>${newUser.username}</b>, 
    //                 <br/><br/>
    //                 Thank you for registering!
    //                 <br/><br/>
    //                 Please verify your email by typing the following token:
    //                 <br/>
    //                 Token: <b>${newUser.temporarytoken}</b>
    //                 <br/>
    //                 On the following page:
    //                 <a href="http://localhost:5000/users/activate">http://localhost:5000/users/activate</a>
    //                 <br/><br/>
    //                 Have a great day!
    //                 <br/><br/>
    //                 Sincerely,
    //                 <br/>
    //                 Team 0100.0`; 
    //                 // Send the email
    //                 await mailer.sendEmail(
    //                 "Team0100.0@DooleyEats",
    //                 newUser.email,
    //                 "Dooley Eats: Please verify your Email",
    //                 html
    //               );
    //               req.flash(
    //                 "success_msg",
    //                 "You are now registered! Please check your email for an activation link."
    //               );
    //               res.redirect("/users/login");
    //             })
    //             .catch(err => console.log(err));
    //         });
    //       });
    //     }
    //   });
    // }
  });

// router.post("/", function(req, res)  {
//   //debug print statements
//   console.log("title is", req.body.title);
//   console.log("body is", req.body);
//   console.log("params is", req.params);
//   console.log("tags is", req.body.tags);

//   const { title, image, description, tags, location } = req.body;

//   // var title = req.body.title;
//   // var description = req.body.description;
//   // var tags = req.body.tags;
//   // var location = req.body.location;
//   var author = {
//     id: req.user._id,
//     username: req.user.username
//   };
//   //var image  = req.body.image;
//   const newPost = new Post({
//     // title: title,
//     // description: description,
//     // tags: tags,
//     // location: location,
//     // author: author, 
//     // image: image
//     title,
//     image,
//     description,
//     tags,
//     location,
//     author
//   });

//   console.log(newPost);

//    // create a new campground and save to DB
//    Post.create(newPost, function(err, newlyCreated) {
//     if (err) {
//       console.log(err);
//     } else {
//       const newPost = new Post({
//         title,
//         image,
//         description,
//         tags,
//         location,
//       });
//       newPost.save()
//       // redirect to the campgrounds route
//       res.redirect("/posts");
//     }
//   });
// });

// Edit Posts Page
router.get("/:id/edit", (req, res) =>
  res.render("Posts/edit_post", {
    id: req.posts._id,
    rating: req.posts.rating,
    image: req.posts.image,
    description: req.posts.description,
    location: req.posts.location,
    author: req.posts.author,
    comments: req.posts.comments,
    title: req.posts.title
  })
);

// Edit Posts Page
// SHOW - shows more info about one campground

router.get("/:id", (req, res) => {
  Post.findById(req.params.id, (err, foundPosts)=> {
    if (err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    } else {
      User.find()
        .where("username")
        .equals(foundPosts.author.id)
        .exec((err, user) => {
          if (err) {
            req.flash("error", "Something went wrong...");
            res.redirect("/dashboard");
          } else {
            res.render("Posts/show_post", {
              post: foundPosts
            });
          }
        });
    }
  });
});

module.exports = router;