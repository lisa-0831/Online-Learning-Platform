const { uploadToS3 } = require("../../util/s3");
const Livestream = require("../models/livestream_model");
pageSize = 12;

const createLivestream = async (req, res) => {
  const body = req.body;

  // upload Image
  const coverUrl = await uploadToS3(req.files, "cover");
  const videoUrl = await uploadToS3(req.files, "video");

  console.log("coverUrl", coverUrl);
  console.log("videoUrl", videoUrl);
  const categoryObj = {
    humanities: 1,
    investment: 2,
    language: 3,
    marketing: 4,
    music: 5,
    programming: 6,
    others: 7,
  };

  const livestream = {
    title: body.title,
    introduction: body.learn,
    description: body.description,
    preparation: body.preparation,
    user_id: 1, // Didn't get user id
    category_id: categoryObj[body.category],
    cover: coverUrl,
    teaser: videoUrl,
    start_time: new Date(body.startTime).getTime(),
    upload_time: Date.now(),
  };

  const livestreamId = await Livestream.createLivestream(livestream);
  if (livestreamId == -1) {
    res.status(500);
  } else {
    res.status(200).send({ livestreamId });
  }
};

const getLivestreams = async (req, res) => {
  const authorization = req.headers.authorization;
  let token = "";
  if (authorization !== undefined) {
    token = authorization.split(" ")[1];
  }

  const category = req.params.category || "all";
  const order = req.query.order || "trending";
  const paging = parseInt(req.query.paging) || 0;

  async function findLivestream(category) {
    switch (category) {
      case "all":
      case "humanities":
      case "investment":
      case "language":
      case "marketing":
      case "music":
      case "programming":
        return await Livestream.getLivestreams(pageSize, paging, {
          category,
          order,
          paging,
        });
      case "search": {
        const keyword = req.query.keyword;
        if (keyword) {
          return await Livestream.getLivestreams(pageSize, paging, {
            keyword,
          });
        }
        break;
      }
      case "details": {
        const livestreamId = parseInt(req.query.id);
        if (Number.isInteger(livestreamId)) {
          return await Livestream.getLivestream(livestreamId);
        }
      }
    }
  }

  const livestreams = await findLivestream(category);
  if (!livestreams) {
    res.status(400).send({ error: "Wrong Request" });
    return;
  }

  if (livestreams.length == 0) {
    if (category === "details") {
      res.status(200).json({ data: null });
    } else {
      res.status(200).json({ data: [] });
    }
    return;
  }

  res.status(200).json(livestreams);
};

const bookLivestream = async (req, res) => {
  const body = req.body;
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(403).json("Please Sign In first.");
  }

  const token = authorization.split(" ")[1];

  const bookingId = await Livestream.bookLivestream(body, token);
  if (bookingId == -1) {
    return res.status(500).json({ Error: "Server Error" });
  } else if (bookingId == -2) {
    return res.status(403).json({ Error: "Added Before" });
  } else {
    return res.status(200).json({ Success: bookingId });
  }
};

module.exports = {
  getLivestreams,
  createLivestream,
  bookLivestream,
};
