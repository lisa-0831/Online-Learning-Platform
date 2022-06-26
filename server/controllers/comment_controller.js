const Comment = require("../models/comment_model");

const createComment = async (req, res) => {
  const authorization = req.headers.authorization;
  const body = req.body;

  if (!authorization) {
    return res.status(403).json("Please Sign In first.");
  } else if (!body) {
    return res.status(400).json("Please Enter Some Words.");
  }

  const token = authorization.split(" ")[1];
  const comment = {
    commentedId: body.commentedId,
    content: body.content,
  };

  const commentId = await Comment.createComment(comment, token);
  if (commentId == -1) {
    console.log(21, "here");
    return res.status(500);
  } else {
    return res.status(200).json({ "Comment created": commentId });
  }
};

module.exports = {
  createComment,
};
