const express = require("express");
const router = express.Router();
const Post = require("../models/Posts");
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

//User Model
const User = require("../models/User");

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

router
  .route("/register")
  .get(isNotAuthenticated, (req, res) => {
    res.render("register");
  })
  .post(async (req, res, next) => {
    console.log("username is", req.body.username);
    const { username, email, password, password2 } = req.body; //array of errors
    let errors = []; //Check required fields

    if (!username || !email || !password || !password2) {
      errors.push({ msg: "Please fill in all fields" });
    } //Check if passwords match

    if (password !== password2) {
      errors.push({ msg: "Passwords do not match" });
    } // Require password length to be between 5 and 20

    if (password.length < 5 || password.length > 20) {
      errors.push({ msg: "Password should be between 5 and 20 characters" });
    }

    if (errors.length > 0) {
      res.render("register", {
        errors,
        username,
        email,
        password,
        password2
      });
    } else {
      // Validation passed
      User.findOne({ email: email }).then(async user => {
        if (user) {
          errors.push({ msg: "Email already exists" });
          res.render("register", {
            errors,
            username,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            username,
            email,
            password
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash; 

              // Flag account as inactive
              User.active = false;

              newUser
                .save()
                .then(async user => {
                    // Compose email
                    const html = `Hi <b>${newUser.username}</b>, 
                    <br/><br/>
                    Thank you for registering!
                    <br/><br/>
                    Please verify your email by typing the following token:
                    <br/>
                    Token: <b>${newUser.temporarytoken}</b>
                    <br/>
                    On the following page:
                    <a href="http://localhost:5000/users/activate">http://localhost:5000/users/activate</a>
                    <br/><br/>
                    Have a great day!
                    <br/><br/>
                    Sincerely,
                    <br/>
                    Team 0100.0`; 
                    // Send the email
                    await mailer.sendEmail(
                    "Team0100.0@DooleyEats",
                    newUser.email,
                    "Dooley Eats: Please verify your Email",
                    html
                  );
                  req.flash(
                    "success_msg",
                    "You are now registered! Please check your email for an activation link."
                  );
                  res.redirect("/users/login");
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router
  .route("/activate")
  .get(isNotAuthenticated, (req, res) => {
    res.render("activate");
  })
  .post(async (req, res, next) => {
    try {
      const { secretToken } = req.body; // Find account with matching secret token

      const user = await User.findOne({ temporarytoken: secretToken });
      if (!user) {
        req.flash("error", "Error: user does not exist!");
        res.redirect("/users/activate");
        return;
      }

      user.active = true;
      user.temporarytoken = "";
      await user.save();
      req.flash("success_msg", "Thank you! You may proceed to log in.");
      res.redirect("/users/login");
    } catch (error) {
      next(error);
    }
  });

// forgot password
router.get("/forgot", function(req, res) {
  res.render("forgot");
});

router.post("/forgot", function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Mailgun', 
        auth: {
          user: config.MAILGUN_USER,
          pass: config.MAILGUN_PASS
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'Team0100.0@DooleyEats',
        subject: 'Dooley Eats Password Reset',
        text: 'Hello ' + user.username +',\n\n' + 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' + 
          'Sincerely,\n' + 'Team 0100.0'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});

// users go to this unique link to reset their password
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        //update password in database then hash it again
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            if(req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function(err) {
              //update 
              user.password = req.body.password;
              //hash user password
              user.password = hash;       
              //clear token and expire fields      
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
              //save user
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
              })
            } else {
              req.flash('error', "Passwords do not match.");
              return res.redirect('back');
          }
        });
      });
    });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Mailgun', 
        auth: {
          user: config.MAILGUN_USER,
          pass: config.MAILGUN_PASS
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'Team0100.0@DooleyEats',
        subject: 'Your Dooley Eats password has been changed',
        text: 'Hello ' + user.username + ',\n\n' +
          'This is a confirmation that the password for your Dooley Eats account ' + user.email + ' has just been changed.\n\n' + 
          'Sincerely,\n' + 'Team 0100.0'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/users/login');
  });
});
var count = 0; 
// USER PROFILE
router.get("/:id", ensureAuthenticated, (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err || !foundUser) {
      req.flash("error", "Something went wrong...");
      res.redirect("/dashboard");
    } else {


      Post.find()
        .where("author.id")
        .equals(foundUser._id)
        .exec((err, posts) => {
          if (err) {
            req.flash("error", "Something went wrong...");
            res.redirect("/dashboard");
          } else {
            var likes = 0;
            for (each in posts){
              if (posts[each].likes){
                likes += posts[each].likes.length;
              }
            }
            res.render("Users/show_profile", {
              count: Object.keys(posts).length,
              likes: likes,
              user: foundUser,
              posts: posts
            });
          }
        });


        
    }
  });
});

router.get("/edit/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("error", "Error finding user");
      res.redirect("back");
    } else {
      res.render("Users/edit_profile", {
        user: foundUser
      });
    }
  });
});

router.put("/:id", ensureAuthenticated, (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, (err, updatedUser) => {
    if (err) {
        req.flash("error", "Something went wrong...");
        res.redirect("back");
      }
      if (updatedUser._id.equals(req.user._id)) {
        req.flash("success", "Successfully updated your profile!");
        res.redirect("/users/" + req.params.id);
      } else {
        req.flash("error", "You don't have permission to do that");
        res.redirect("/dashboard");
      }
    }
  );
});
module.exports = router;
