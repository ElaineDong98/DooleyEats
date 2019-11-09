var mongoose = require("mongoose");
const randomstring = require('randomstring');
const passportLocalMongoose = require("passport-local-mongoose");

var PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    //default: 'title'
  },
  rating: {
    type: Number
  },
  hours:{
    type:String
  },
  image: {
    type: String
  },
  description: {
    type: String,
    required: true,
    //default: 'description'
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      username: String
    },
  ],
  location: {
    type: String
  },
  lat: Number,
  lng: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: {
    type: String
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});
PostSchema.plugin(passportLocalMongoose)

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;