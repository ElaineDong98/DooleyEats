const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  text: String,
  createTime: { type: Date, default: Date.now },
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
