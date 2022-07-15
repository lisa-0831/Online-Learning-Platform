window.onload = async function () {
  let params = new URL(document.location).searchParams;
  let userId = params.get("id");

  const userRes = await fetch(`/api/1.0/user/profile/details?id=${userId}`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
  });
  const userObj = await userRes.json();

  const user = userObj.user.user;
  document.getElementsByClassName("name")[0].innerText = user.name;
  document.getElementsByClassName("email")[0].innerText = user.email;
  document.getElementsByClassName("self-intro")[0].innerText = user.selfIntro;
  document.getElementsByClassName("value")[0].innerText = user.bought.length;
  document.getElementsByClassName("value")[1].innerText = user.teach.length;
  const imgNode = document.createElement("img");
  imgNode.setAttribute(
    "src",
    `https://d1wan10jjr4v2x.cloudfront.net/profile/${user.picture}`
  );
  imgNode.setAttribute("width", "170");
  imgNode.setAttribute("height", "170");
  document.getElementsByClassName("image")[0].appendChild(imgNode);

  if (user.auth == 1) {
    document.getElementsByClassName(
      "actions"
    )[0].innerHTML = `<button class="btn">Edit</button><button class="btn" onclick="signOut()">Sign Out</button>`;
  } else {
    document.getElementsByClassName(
      "actions"
    )[0].innerHTML = `<button class="btn" onclick="sendMessage()">Message</button>`;
  }

  // Timestamp To Date
  const timestamp2Date = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Bought
  if (user.auth == 1 || user.bought.length > 0) {
    document.getElementById(
      "content-title-bought"
    ).innerHTML = `<h1 class="content-title">選修的課程</h1>`;
  }
  if (user.auth == 1 && user.bought.length == 0) {
    document.getElementsByClassName(
      "courses"
    )[0].innerHTML = `<a href="./courses.html" class="course-redirect"> 目前無購買任何課程，前往選購 >> </a>`;
  }

  for (let i = 0; i < user.bought.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${user.bought[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.bought[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.bought[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Price
    let coursePrice = document.createElement("p");
    coursePrice.innerText = `NT$ ${user.bought[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[0].appendChild(course);
  }

  // Favorites
  if (user.auth == 1 || user.favorites.length > 0) {
    document.getElementById(
      "content-title-favorites"
    ).innerHTML = `<h1 class="content-title">收藏的課程</h1>`;
  }
  if (user.auth == 1 && user.favorites.length == 0) {
    document.getElementsByClassName(
      "courses"
    )[1].innerHTML = `<a href="./courses.html" class="course-redirect"> 目前無收藏任何課程，前往逛逛 >> </a>`;
  }

  for (let i = 0; i < user.favorites.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${user.favorites[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.favorites[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.favorites[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Price
    let coursePrice = document.createElement("p");
    coursePrice.innerText = `NT$ ${user.favorites[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[1].appendChild(course);
  }

  // Reserve
  if (user.auth == 1 || user.reserve.length > 0) {
    document.getElementById(
      "content-title-reserve"
    ).innerHTML = `<h1 class="content-title">預約的直播</h1>`;
  }
  if (user.auth == 1 && user.reserve.length == 0) {
    document.getElementsByClassName(
      "courses"
    )[2].innerHTML = `<a href="./livestreams.html" class="course-redirect"> 目前無預約任何直播，前往逛逛 >> </a>`;
  }

  for (let i = 0; i < user.reserve.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/livestream.html?id=${user.reserve[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.reserve[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.reserve[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Time
    let courseTime = document.createElement("p");
    courseTime.innerText = `直播時間 ${timestamp2Date(
      user.reserve[i]["start_time"]
    )}`;
    figcaption.appendChild(courseTime);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[2].appendChild(course);
  }

  // Teach
  if ((user.auth == 1 && user.role == "teacher") || user.teach.length > 0) {
    document.getElementById(
      "content-title-teach"
    ).innerHTML = `<h1 class="content-title">開設的課程</h1>`;
  }
  if (user.auth == 1 && user.role == "teacher" && user.teach.length == 0) {
    document.getElementById(
      "content-teach-link"
    ).innerHTML = `<a href="./admin/course.html" class="course-redirect"> 目前無開設任何課程，前往新增 >> </a>`;
  } else if (user.auth == 1 && user.role == "teacher") {
    document.getElementById(
      "content-teach-link"
    ).innerHTML = `<a href="./admin/course.html" class="course-redirect"> 前往新增 >> </a>`;
  }

  for (let i = 0; i < user.teach.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${user.teach[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.teach[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.teach[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Students Num
    // let courseStudent = document.createElement("h4");
    // // courseStudent.setAttribute("class", "course-student");
    // courseStudent.innerText = `學生 ${coursesObj[i]["students_num"]} 人`;
    // figcaption.appendChild(courseStudent);

    // Course Price
    let coursePrice = document.createElement("p");
    // coursePrice.setAttribute("class", "course-price");
    coursePrice.innerText = `NT$ ${user.teach[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[3].appendChild(course);
  }

  // Streamer
  if ((user.auth == 1 && user.role == "teacher") || user.streamer.length > 0) {
    document.getElementById(
      "content-title-streamer"
    ).innerHTML = `<h1 class="content-title">開設的直播</h1>`;
  }
  if (user.auth == 1 && user.role == "teacher" && user.streamer.length == 0) {
    document.getElementById(
      "content-streamer-link"
    ).innerHTML = `<a href="./admin/livestream.html" class="course-redirect"> 目前無舉辦任何直播，前往新增 >> </a>`;
  } else if (user.auth == 1 && user.role == "teacher") {
    document.getElementById(
      "content-streamer-link"
    ).innerHTML = `<a href="./admin/livestream.html" class="course-redirect"> 前往新增 >> </a>`;
  }

  for (let i = 0; i < user.streamer.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute(
      "href",
      `/livestream.html?id=${user.streamer[i].id}`
    );

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.streamer[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.streamer[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Time
    let courseTime = document.createElement("p");
    courseTime.innerText = `直播時間 ${timestamp2Date(
      user.streamer[i]["start_time"]
    )}`;
    figcaption.appendChild(courseTime);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[4].appendChild(course);
  }
};

const signOut = (event) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_id");
  window.location.href = "./";
};

const sendMessage = async (event) => {
  const access_token = localStorage.getItem("access_token");

  if (access_token !== null) {
    const searchParams = new URLSearchParams(window.location.search);
    const receiver_id = parseInt(searchParams.get("id"));
    localStorage.setItem("receiver_id", receiver_id);

    const checkId = await fetch(`/api/1.0/messages/newroom`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
      body: JSON.stringify({ receiverId: receiver_id }),
    });

    window.location.href = "./messenger.html";
  } else {
    window.location.href = "/signin.html";
  }
};
