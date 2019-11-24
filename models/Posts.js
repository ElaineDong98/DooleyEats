var mongoose = require("mongoose");
const randomstring = require('randomstring');
const passportLocalMongoose = require("passport-local-mongoose");

var PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  postType: {
    type: String
  },
  rating: {
    type: Number
  },

  hours:{
    type:String
  },

  image: {
    data: Buffer, 
    contentType: String,
  },
  image_approved : Boolean,
  info : [Object],

  description: {
    type: String,
    required: true,
  },
  //average rating
  rating_avg : String,
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

  //this is for hangout
  meetTime: Date,
  meetLocation: String,
  signup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      username: String
    },
  ],
  ///
  tags: {
    type: String
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String, 
    image: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      text: String
    }
  ]

}
);
PostSchema.plugin(passportLocalMongoose)

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;