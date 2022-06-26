const Favorites = require("../models/favorites_model");

const addFavorites = async (req, res) => {
  const authorization = req.headers.authorization;
  const id = req.body;

  if (!authorization) {
    return res.status(403).json("Please Sign In first.");
  }

  const token = authorization.split(" ")[1];

  const favoritiesId = await Favorites.addFavorites(id, token);
  if (favoritiesId == -1) {
    return res.status(500);
  } else {
    return res.status(200).json({ "Favorites added": favoritiesId });
  }
};

module.exports = {
  addFavorites,
};
