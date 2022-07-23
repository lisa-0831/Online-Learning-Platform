const checkAuth = (req, res) => {
  return res.status(200).send({ user: req.user });
};

module.exports = {
  checkAuth,
};
