var mongoose = require("mongoose");

var CommentSchema = mongoose.Schema({
  title : {type: String, required: true},
  text: {type: String, required: true},
  date: String,
  createTime: { 
    type: Date, 
    default: Date.now 
  },
  rating_value : String,

  upvotes : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  upvoteCount: {
    type: Number, 
    required: true,
    default: 0
  },

  downvotes : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  downvoteCount: {
    type: Number, 
    required: true,
    default: 0
  },

  author: { 
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
