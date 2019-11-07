const mongoose = require('mongoose');
const randomstring = require('randomstring');
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  hometown:{
    type: String, 
    required: false
  },
  gender:{
    type: String, 
    required: false
  },

  /* --Two Fields for Email Verification-- */
  // whether account is activated 
  active:{
    type: Boolean, 
    required: true,
    default: false
  },

  // token for email verification
  temporarytoken:{
    type: String, 
    //required: true,
    default: randomstring.generate(6)
  },

  // token for reset password
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },

  date: {
    type: Date,
    default: Date.now
  },

  image: {
    id: String,
    url: String
  }

});

// const UserSchema = new Schema({
//   username: String,
//   email: String,
//   password: String,
//   hometown: String,
//   gender: String,
//   active: Boolean,
//   temporarytoken: String
// }, {
//   timestamps: {
//       createdAt: 'createdAt',
//       updatedAt: 'updatedAt'
//   }
// });

UserSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', UserSchema);

module.exports = User;
