const Comment = require("../models/comment_model");

const createComment = async (req, res) => {
  const authorization = req.headers.authorization;
  const body = req.body;
  console.log(6, body);

  if (!authorization) {
    return res.status(403).json("Please Sign In first.");
  } else if (!body) {
    return res.status(400).json("Please Enter Some Words.");
  }

  const token = authorization.split(" ")[1];
  const comment = {
    commentedId: body.commentedId,
    content: body.content,
    commentTypeId: body.commentTypeId,
  };

  if (body.commentTypeId == 1) {
    comment["star"] = body.star;
  }

  const commentId = await Comment.createComment(comment, token);
  if (commentId == -1) {
    return res.status(500).json({ Error: "Server Error" });
  } else {
    return res.status(200).json({ "Comment created": commentId });
  }
};

module.exports = {
  createComment,
};
