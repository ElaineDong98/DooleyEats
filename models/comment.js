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
  downvotes : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
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
