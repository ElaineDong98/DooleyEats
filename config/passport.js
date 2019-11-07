const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({usernameField: 'email'},(email, password, done)=> {
      // Match User
      User.findOne({ email : email})
        .then(user => {

          // User is not in database
          if (!user) {
            return done(null, false, {message: 'Email is not registered'});
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            // Password is incorrect
            if (!isMatch) {
              return done(null, false, {message: 'Password is incorrect'});
            }

            // Prevent login if account is not verified
            if (!user.active) {
              return done(null, false, {message: 'You need to verify your email before logging in'});
            }

            // Successful login
            return done(null, user);
            
            // // If password match
            // if (isMatch) {
            //   return done(null, user);
            // } 
            // // If password doesn't match
            // else {
            //   return done(null, false, {message: 'Password is incorrect'});
            // }
          });
        })
        .catch(err => console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}
