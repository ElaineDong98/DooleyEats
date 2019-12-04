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
var multer = require('multer');
const ejs = require('ejs');
const path = require('path');

const fs = require('fs');

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
  return text.replace(/[-[\]{}()*+?.,\\^$|\s]/g, "\\$&");
};


// Set The Storage Engine
var storage = multer.diskStorage({
  //destination: './public/uploads/',
  filename: function(req, file, callback){
    //callback(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dztyzociy',
  api_key: '988245515754467',
  api_secret: 'j14W9UEwC9u9v4tHGAQSgjvKIdE'
});

router.get("/", (req, res) => {
  let noPost = "";
  if(req.query.search){
    let searched = true;
    let numPost;
    const searchQuery = req.query.search,
          regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Post.find({"$or": [{tags: regex},{title:regex},{postType:regex}]},(err, allPosts) => {
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

// trendingsort
router.get("/trending", (req, res) => {
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
        res.render("Posts/trending", {
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
        res.render("Posts/trending", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});

// oldest
router.get("/oldest", (req, res) => {
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
        res.render("Posts/oldest", {
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
        res.render("Posts/oldest", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});

//likeasc
router.get("/likeasc", (req, res) => {
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
        res.render("Posts/likeasc", {
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
        res.render("Posts/likeasc", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});


//likedes
router.get("/likedes", (req, res) => {
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
        res.render("Posts/likedes", {
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
        res.render("Posts/likedes", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});

router.get("/viewasc", (req, res) => {
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
        res.render("Posts/viewasc", {
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
        res.render("Posts/viewasc", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});

router.get("/viewdes", (req, res) => {
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
        res.render("Posts/viewdes", {
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
        res.render("Posts/viewdes", {
          posts: allPosts, 
          noPost: noPost, 
          searched: searched
        });
      }
    });
  }
});


// router.get('/new_post', ensureAuthenticated, (req, res) =>
//   res.render('Posts/new_post', {
//     username: req.user.username
//   }));


//   router.route('/img_data')
// .post(upload.single('file'), function(req, res) {
//     var new_img = new Img;
//     new_img.img.data = fs.readFileSync(req.file.path)
//     new_img.img.contentType = 'image/jpeg';
//     new_img.save();    res.json({ message: 'New image added to the db!' });
// })

  // router
  // .route("/")
  // .get(isNotAuthenticated, (req, res) => {
  //   res.render("/");
  // })
  // .post(async (req, res, next) => {
  //   const { title, postType, image, description, tags, location, meetLocation, meetTime} = req.body;

  //   var author = {
  //     id: req.user._id,
  //     username: req.user.username, 
  //     image: req.user.image
  //   };
  //   const newPost = new Post({
  //     title,
  //     postType,
  //     image,
  //     description,
  //     tags,
  //     location,
  //     meetTime, 
  //     meetLocation,
  //     author
  //   });
    

  //   newPost.save(function(err, resp) {
  //     if (err) {
  //       console.log(err);
  //       res.send({
  //         message: 'something went wrong'
  //       });
  //     } else {
  //       console.log('new post contains:  ' + newPost);
  //       res.redirect("/posts");
  //     }
  //   });
  // });

//CREATE - add new campground to DB
router.post("/", isAuthenticated, upload.single('image'), function(req, res) {
  cloudinary.v2. uploader.upload(req.file.path, function(err, result) {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    const { title, postType, image, description, tags, location, meetLocation, meetTime} = req.body;
    // add cloudinary url for the image to the campground object under image property
    req.body.image = result.secure_url;
    // add image's public_id to campground object
    req.body.imageId = result.public_id;

    req.body.author = {
      id: req.user._id,
      username: req.user.username, 
      image: req.user.image
    };

    // const newPost = new Post({
    //   title,
    //   postType,
    //   image,
    //   description,
    //   tags,
    //   location,
    //   meetTime, 
    //   meetLocation,
    //   //author
    // });

    Post.create(req.body, function(err, post) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/posts/' + post.id);
    });
  });
});

//NEW - show form to create new campground
router.get("/new_post", isAuthenticated, function(req, res){
  res.render("Posts/new_post"); 
});


// // Edit Posts Page
// router.get("/edit/:id", function (req, res) {
//   Post.findById(req.params.id, function (err, foundPosts) {
//     if (err) {
//       req.flash("error", "Error finding post");
//       res.redirect("back");
//     } else {
//       res.render("Posts/edit_post", {
//         posts: foundPosts
//       });
//     }
//   });
// });


// router.put("/:id", ensureAuthenticated, (req, res) => {
//   Post.findByIdAndUpdate(req.params.id, req.body, (err, updatedPosts) => {
//     if (err) {
//       req.flash("error", "Something went wrong...");
//       res.redirect("back");
//     }
//     if (updatedPosts.author.id.equals(req.user._id)) {
//       req.flash("success", "Successfully updated your profile!");
//       res.redirect("/posts/" + req.params.id);
//     } else {
//       req.flash("error", "You don't have permission to do that");
//       res.redirect("/posts/" + req.params.id);
//     }
//   }
//   );
// });
// Edit Posts Page
// SHOW - shows more info about one Post

// function breakline(text) {
//   return text.replace(/(?:\r\n|\r|\n)/g, "<br/>");
// };

router.get("/edit/:id", function(req, res){
  console.log("IN EDIT!");
  //find the campground with provided ID
  Post.findById(req.params.id, function(err, foundPosts){
      if(err){
          console.log(err);
      } else {
          //render show template with that campground
          res.render("Posts/edit_post", {post: foundPosts});
      }
  });
});

//Put method for editing post
router.put("/:id", upload.single('image'), function(req, res){
  Post.findById(req.params.id, async function(err, post){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          if (req.file) {
            try {
                await cloudinary.v2.uploader.destroy(post.imageId);
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                post.imageId = result.public_id;
                post.image = result.secure_url;
            } catch (err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
          }   
          post.title = req.body.title;
          post.description = req.body.description;
          post.tags = req.body.tags;
          post.location = req.body.location;
          post.meetLocation = req.body.meetLocation;
          post.save();
          req.flash("success","Successfully Updated!");
          res.redirect("/posts/" + post.id);
      }
  });
});


router.get("/:id", ensureAuthenticated,function (req, res) {
  Post.findOneAndUpdate({_id :req.params.id}, {$inc : {'view' : 1}}).exec();

  Post.findById(req.params.id).populate({
    path: 'comments',
    populate : {
                    path : 'upvotes',
                    model : 'User'
              }
  }).exec(function(err, foundPosts) {
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
      Post.find()
        .where("author.id")
        .equals(foundPosts.author.id)
        .exec((err, author_posts) => {
          if (err) {
            req.flash("error", "Something went wrong...");
            res.redirect("/dashboard");
          } else {
            var likes = 0;
            for (each in author_posts) {
              if (author_posts[each].likes) {
                likes += author_posts[each].likes.length;
              }
            }
            res.render("Posts/show_post", {
              post: new_post, author: user,
              count: Object.keys(author_posts).length,
              likes: likes
            });
          }
        });
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
      req.user.likedPost.pull(foundPost._id);
    } else {
      // adding the new user like
      foundPost.likes.push(req.user);
      req.user.likedPost.push(foundPost._id);
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


// // destroy campground route
// router.delete("/:id", (req, res) => {
//   Post.findByIdAndRemove(req.params.id, err => {
//     if (err) { res.redirect("/dashboard"); }
//     else {
//       req.flash("success", "Post removed!");
//       res.redirect("/dashboard");
//     }
//   });
// });

router.delete('/:id', function(req, res) {
  Post.findById(req.params.id, async function(err, post) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(post.imageId);
        post.remove();
        req.flash('success', 'Post deleted successfully!');
        res.redirect('/posts');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

module.exports = router;