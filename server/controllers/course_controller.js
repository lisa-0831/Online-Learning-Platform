const uploadToS3 = require("../../util/s3");
const Course = require("../models/course_model");
pageSize = 12;
hashtagSize = 20;

const createCourse = async (req, res) => {
  const body = req.body;
  console.log(8, body);

  // // upload Image
  // const coverUrl = await uploadToS3(req.files, "cover");
  // const videoUrl = await uploadToS3(req.files, "video");

  const course = {
    title: body.title,
    introduction: body.introduction,
    description: body.description,
    user_id: 1, // Didn't get user id
    preparation: body.preparation,
    category: body.category,
    price: body.price,
    cover: req.files.cover[0].filename,
    video: req.files.video[0].filename,
    // cover: coverUrl,
    // video: videoUrl,
    upload_time: Date.now(),
  };

  let hashtags = [];
  if (typeof req.body.hashtag === "string") {
    hashtags.push(req.body.hashtag);
  } else {
    hashtags = req.body.hashtag.filter((tag) => tag);
  }

  const courseId = await Course.createCourse(course, hashtags);
  if (courseId == -1) {
    res.status(500);
  } else {
    res.status(200).send({ courseId });
  }
};

const getCourses = async (req, res) => {
  const authorization = req.headers.authorization;
  let token = "";
  if (authorization !== undefined) {
    token = authorization.split(" ")[1];
  }

  const category = req.params.category || "all";
  const hashtag = req.query.hashtag;
  const order = req.query.order || "trending";
  const paging = parseInt(req.query.paging) || 0;

  async function findCourse(category) {
    switch (category) {
      case "all":
      case "humanities":
      case "investment":
      case "language":
      case "marketing":
      case "music":
      case "programming":
        return await Course.getCourses(hashtagSize, pageSize, paging, {
          category,
          hashtag,
          order,
          paging,
        });
      case "search": {
        const keyword = req.query.keyword;
        if (keyword) {
          return await Course.searchCourses(pageSize, paging, keyword);
        }
        break;
      }
      case "details": {
        const courseId = parseInt(req.query.id);
        if (Number.isInteger(courseId)) {
          return await Course.getCourse(courseId, token);
        }
      }
    }
  }

  const courses = await findCourse(category);
  if (!courses) {
    res.status(400).send({ error: "Wrong Request" });
    return;
  }

  if (courses.length == 0) {
    if (category === "details") {
      res.status(200).json({ data: null });
    } else {
      res.status(200).json({ data: [] });
    }
    return;
  }

  res.status(200).json(courses);
};

module.exports = {
  getCourses,
  createCourse,
};
