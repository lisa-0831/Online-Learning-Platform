let detailsObj;
let questionsArr;
let ratingArr;
let discussionArr;
let userInfo;
let questionsArrLength;
let ratingArrLength;
let ratingSum;
let discussionArrLength;

window.onload = async function () {
  showCartNum();

  let params = new URL(document.location).searchParams;
  let courseId = params.get("id");

  const courseRes = await fetch(`/api/1.0/courses/details?id=${courseId}`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
  });
  const courseObj = await courseRes.json();

  detailsObj = courseObj.details;
  questionsArr = courseObj.questions;
  ratingArr = courseObj.rating;
  discussionArr = courseObj.discussion;

  const status = courseObj.status;

  userInfo = courseObj.userInfo;

  // Course Video
  let courseVideo = document.createElement("source");
  courseVideo.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${detailsObj["video"]}`;
  courseVideo.type = "video/mp4";
  document.getElementById("video-controls").appendChild(courseVideo);
  // Video List
  let nowSelect = "-1";
  const videoList = detailsObj.videoList;

  for (let i = 0; i < videoList.length; i++) {
    if (!videoList[i]["title"]) {
      break;
    }
    const videoListLi = document.createElement("li");
    videoListLi.setAttribute("class", "video-item");
    videoListLi.setAttribute("data-type", i);
    videoListLi.setAttribute("id", i);
    videoListLi.innerText = `第 ${i + 1} 堂：${videoList[i]["title"]}`;
    document.getElementById("videoParent").appendChild(videoListLi);
  }
  // Episode
  const videoParent = document.getElementById("videoParent");
  videoParent.addEventListener("click", function (e) {
    e.preventDefault();
    let videoEp = e.target.dataset.type;

    // Change the video
    const currentVideo = document.getElementsByTagName("source")[0];
    if (videoEp === "-1") {
      currentVideo.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${detailsObj["video"]}`;
    } else if (status === "course_after_pay") {
      currentVideo.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${
        videoList[parseInt(videoEp)]["video"]
      }`;
    } else if (status === "course_before_pay") {
      currentVideo.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/lock.mp4`;
    }
    const videoControls = document.getElementById("video-controls");
    videoControls.load();
    if (status === "course_before_pay") {
      videoControls.play();
    }

    // Change the selected tag
    const changeSelectedVideo = (beforeId, afterId) => {
      document.getElementById(beforeId).classList.remove("selected");
      document.getElementById(afterId).classList.add("selected");
    };
    changeSelectedVideo(nowSelect, videoEp);
    nowSelect = videoEp;
  });

  // Course Information

  // Course Price
  const priceDiv = document.createElement("div");
  priceDiv.setAttribute("class", "course-info course-price");
  priceDiv.innerHTML = `<p>課程售價</p>
  <h2 class="course-price-number">NT$${detailsObj["price"]}</h2>`;
  document.getElementsByClassName("course-all-info")[0].prepend(priceDiv);

  // Course Title
  const titleDiv = document.createElement("div");
  titleDiv.setAttribute("class", "course-info course-title");
  const courseTitle = document.createElement("h1");
  courseTitle.innerText = detailsObj["title"];
  titleDiv.appendChild(courseTitle);
  document.getElementsByClassName("course-all-info")[0].prepend(titleDiv);

  // Course Upload Time
  const date = new Date(detailsObj["upload_time"]);
  const uploadDate = `${date.getFullYear()} / ${
    date.getMonth() + 1
  } / ${date.getDate()}`;
  document.getElementById("detail-upload-time").innerText = uploadDate;

  // Course Student Num
  const studentNum = `${detailsObj["student_num"]} 位同學`;
  document.getElementById("detail-student-num").innerText = studentNum;

  // Chapter Num
  const chaptertNum = `${detailsObj["videoList"].length} 個章節`;
  document.getElementById("detail-chapter-num").innerText = chaptertNum;

  // Course Introduction
  document.getElementById("course-introduction-detail").innerText =
    detailsObj["introduction"];

  // Course Description
  document.getElementById("course-description-detail").innerText =
    detailsObj["description"];

  // Course Preparation
  document.getElementById("course-preparation-detail").innerText =
    detailsObj["preparation"];

  // Course Teacher
  teacherInfo = `<a href="./profile.html?id=${detailsObj["user_id"]}" class="detail-teacher-info-a"><img src="https://d1wan10jjr4v2x.cloudfront.net/profile/${detailsObj["picture"]}" width="130px" height="130px" class="detail-teacher-pic" /></a>
  <div class="detail-teacher-info-words">
    <p class="detail-teacher-name">${detailsObj["name"]}</p>`;
  if (detailsObj["self_intro"] !== null) {
    teacherInfo += `<p> ${detailsObj["self_intro"]}</p>`;
  }
  teacherInfo += "</div>";
  document.getElementsByClassName("detail-teacher-info")[0].innerHTML =
    teacherInfo;

  //// All people can see

  // Other's Q&A Title
  questionsArrLength = questionsArr.length;
  if (questionsArrLength == 0) {
    document.getElementById("question-title").innerText =
      "目前沒有任何課前 Q&A ";
  } else {
    document.getElementById(
      "question-title"
    ).innerText = `目前共有 ${questionsArrLength} 則 Q&A`;
  }

  if (!userInfo) {
    document.getElementById("question-status").innerText =
      "需要登入才能留 Q&A ，快去登入/註冊吧！";
  }

  // Other's Q&A Content
  for (let i = 0; i < questionsArr.length; i++) {
    const date = new Date(questionsArr[i]["create_time"]);
    const createDate = `${date.getFullYear()} / ${
      date.getMonth() + 1
    } / ${date.getDate()}`;

    const containerDiv = document.createElement("div");
    containerDiv.setAttribute("class", "container");
    containerDiv.innerHTML = `<div class="avatar"><a href="./profile.html?id=${questionsArr[i]["id"]}">
    <img src="https://d1wan10jjr4v2x.cloudfront.net/profile/${questionsArr[i]["picture"]}" style="width: 100%" /></a>
  </div>
  <div class="text">
    <h3>${questionsArr[i]["name"]} <span class="time-right">${createDate}</span></h3>
    <hr />
    <p>
      ${questionsArr[i]["content"]}
    </p>
  </div>`;

    document.getElementsByClassName("containers")[0].appendChild(containerDiv);
  }

  // Other's Rating Content
  ratingArrLength = ratingArr.length;
  ratingSum = 0;
  for (let i = 0; i < ratingArr.length; i++) {
    const date = new Date(ratingArr[i]["create_time"]);
    const createDate = `${date.getFullYear()} / ${
      date.getMonth() + 1
    } / ${date.getDate()}`;

    let star = "";
    ratingSum += ratingArr[i].star;
    for (let j = 0; j < ratingArr[i].star; j++) {
      star += `<span class="fa fa-star checked"></span>`;
    }
    for (let j = 0; j < 5 - ratingArr[i].star; j++) {
      star += `<span class="fa fa-star"></span>`;
    }

    const containerDiv = document.createElement("div");
    containerDiv.setAttribute("class", "container");
    containerDiv.innerHTML = `<div class="avatar"><a href="./profile.html?id=${ratingArr[i]["id"]}"> 
    <img src="https://d1wan10jjr4v2x.cloudfront.net/profile/${ratingArr[i]["picture"]}" style="width: 100%" /></a>
  </div>
  <div class="text">
    <h3>${ratingArr[i]["name"]} <span class="time-right">${createDate}</span></h3>
    <div class="user-rating">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
      ${star}
    </div>
    <hr />
    <p>
      ${ratingArr[i]["content"]}
    </p>
  </div>`;

    document.getElementsByClassName("containers")[1].appendChild(containerDiv);
  }

  // Other's Rating Title
  if (ratingArr.length > 0) {
    document.getElementById("rating-avg").innerText = `平均 ${(
      ratingSum / ratingArr.length
    ).toFixed(1)}`;
  }

  if (ratingArr.length == 0) {
    document.getElementById("rating-title").innerText = "目前沒有任何評論";
  } else {
    document.getElementById(
      "rating-title"
    ).innerText = `目前共有 ${ratingArr.length} 則評論`;
  }

  if (status == "course_before_pay") {
    document.getElementById("rating-status").innerText =
      "需要購買才能留評論 ，快去購買吧！";
  }

  //// Only people who Login can see

  // Q&A input area
  if (userInfo !== undefined) {
    document.getElementById(
      "question-input-area"
    ).innerHTML = `<div class="container"><div class="avatar user-avatar">
    <a href="./profile.html?id=${userInfo["userId"]}">
     <img src="./profile/${userInfo["picture"]}" style="width: 100%" />
    </a>
  </div>
  <div class="input-area">
    <div class="text">
      <h3 class="user-name">${userInfo["name"]}</h3>
      <hr />
      <textarea class="comment-area"> </textarea>
    </div>
    <button
      type="button"
      class="comment-btn"
      onclick="sendQuestion()"
    >
      Submit
    </button>
  </div></div>`;

    // Clean the textarea
    document.getElementsByClassName("comment-area")[0].value = "";
  }

  //// Only people who bought this course can see

  // Rating input area
  if (status == "course_after_pay") {
    document.getElementById(
      "rating-input-area"
    ).innerHTML = `<div class="container"><div class="avatar user-avatar">
    <a href="./profile.html?id=${userInfo["userId"]}">
     <img src="./profile/${userInfo["picture"]}" style="width: 100%" />
    </a>
  </div>
  <div class="input-area">
    <div class="text">
      <h3 class="user-name">${userInfo["name"]}</h3>
      <hr />
      <p>
        評分：
        <select name="comment-star" id="comment-star">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5" selected="selected">5</option>
        </select>
      </p>
      <textarea class="comment-area"> </textarea>
    </div>
    <button
      type="button"
      class="comment-btn"
      onclick="sendRating()"
    >
      Submit
    </button>
  </div></div>`;

    // Clean the textarea
    document.getElementsByClassName("comment-area")[1].value = "";
  }

  // Discussion
  if (status !== "course_after_pay") {
    document.getElementById("discussion-status").innerText =
      "請先購買才可以看到上課討論哦～ 感謝 :)";
  } else {
    document.getElementById("discussion-input-area").innerHTML = `
    <div class="container"><div class="avatar">
          <a href="./profile.html?id=${userInfo["userId"]}">
        <img src="./profile/${userInfo["picture"]}" style="width: 100%" />
      </a>
          </div>
          <div class="input-area">
            <div class="text">
              <h3>${userInfo["name"]}</h3>
              <hr />
              <textarea class="comment-area"> </textarea>
            </div>
            <button
              type="button"
              class="comment-btn"
              onclick="sendDiscussion()"
            >
              Submit
            </button>
          </div></div>
        `;

    // Clean the textarea
    document.getElementsByClassName("comment-area")[2].value = "";

    discussionArrLength = discussionArr.length;
    if (discussionArr.length == 0) {
      document.getElementById("discussion-title").innerText =
        "目前沒有任何討論";
    } else {
      document.getElementById(
        "discussion-title"
      ).innerText = `目前共有 ${discussionArr.length} 則討埨`;
    }

    for (let i = 0; i < discussionArr.length; i++) {
      const date = new Date(discussionArr[i]["create_time"]);
      const createDate = `${date.getFullYear()} / ${
        date.getMonth() + 1
      } / ${date.getDate()}`;

      const containerDiv = document.createElement("div");
      containerDiv.setAttribute("class", "container");
      containerDiv.innerHTML = `<div class="avatar"><a href="/profile.html?id=${discussionArr[i]["id"]}">
      <img src="https://d1wan10jjr4v2x.cloudfront.net/profile/${discussionArr[i]["picture"]}" style="width: 100%" /></a>
    </div>
    <div class="text">
      <h3>${discussionArr[i]["name"]} <span class="time-right">${createDate}</span></h3>
      <hr />
      <p>
        ${discussionArr[i]["content"]}
      </p>
    </div>`;

      document
        .getElementsByClassName("containers")[2]
        .appendChild(containerDiv);
    }
  }
};

// Change Course Information
function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("course-tab");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  if (pageName == "detail") {
    document.getElementById(pageName).style.display = "block";
  } else {
    document.getElementById(pageName).style.display = "flex";
  }
  elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// Post Question
const sendQuestion = (event) => {
  const content = document.getElementsByTagName("textarea")[0].value;
  if (!content) {
    alert("請先輸入內容，謝謝。");
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  // Render
  questionsArrLength += 1;
  document.getElementById(
    "question-title"
  ).innerText = `目前共有 ${questionsArrLength} 則 Q&A`;

  const date = new Date();
  const createDate = `${date.getFullYear()} / ${
    date.getMonth() + 1
  } / ${date.getDate()}`;

  const containerDiv = document.createElement("div");
  containerDiv.setAttribute("class", "container");
  containerDiv.innerHTML = `<div class="avatar"><a href="./profile.html?id=${userInfo["id"]}">
    <img src="https://d1wan10jjr4v2x.cloudfront.net/profile/${userInfo["picture"]}" style="width: 100%" /></a>
  </div>
  <div class="text">
    <h3>${userInfo["name"]} <span class="time-right">${createDate}</span></h3>
    <hr />
    <p>
      ${content}
    </p>
  </div>`;

  document.getElementsByClassName("containers")[0].prepend(containerDiv);

  // Clear Input
  document.getElementsByClassName("comment-area")[0].value = "";

  // Store into Database

  const comment = {
    commentedId: id,
    content: content,
    commentTypeId: 2,
  };

  fetch(`/api/1.0/comment`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
    body: JSON.stringify(comment),
  })
    .then((res) => {
      if (res.status == 200) {
        alert("已送出購買前Q&A :)");
      }
    })
    .catch((error) => console.log("Error:", error));
};

// Post Rating
const sendRating = (event) => {
  const content = document.getElementsByTagName("textarea")[1].value;
  if (!content) {
    alert("請先輸入內容，謝謝。");
    return;
  }

  const select = document.getElementById("comment-star");
  const starNum = parseInt(select.options[select.selectedIndex].value);

  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  // Frontend Render
  ratingSum += starNum;
  document.getElementById("rating-avg").innerText = `平均 ${(
    ratingSum / ratingArrLength
  ).toFixed(1)}`;

  ratingArrLength += 1;
  document.getElementById(
    "rating-title"
  ).innerText = `目前共有 ${ratingArrLength} 則評論`;

  const date = new Date();
  const createDate = `${date.getFullYear()} / ${
    date.getMonth() + 1
  } / ${date.getDate()}`;

  let star = "";
  for (let j = 0; j < starNum; j++) {
    star += `<span class="fa fa-star checked"></span>`;
  }
  for (let j = 0; j < 5 - starNum; j++) {
    star += `<span class="fa fa-star"></span>`;
  }

  const containerDiv = document.createElement("div");
  containerDiv.setAttribute("class", "container");
  containerDiv.innerHTML = `<div class="avatar"><a href="./profile.html?id=${userInfo["id"]}"> 
    <img src="https://d1wan10jjr4v2x.cloudfront.net/profile/${userInfo["picture"]}" style="width: 100%" /></a>
  </div>
  <div class="text">
    <h3>${userInfo["name"]} <span class="time-right">${createDate}</span></h3>
    <div class="user-rating">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
      ${star}
    </div>
    <hr />
    <p>
      ${content}
    </p>
  </div>`;

  document.getElementsByClassName("containers")[1].prepend(containerDiv);

  // Clear Input
  document.getElementsByClassName("comment-area")[1].value = "";

  // Store Into database
  const comment = {
    commentedId: id,
    content: content,
    commentTypeId: 1,
    star: starNum,
  };

  fetch(`/api/1.0/comment`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
    body: JSON.stringify(comment),
  })
    .then((res) => {
      if (res.status == 200) {
        alert("已送出課堂評價 :)");
      }
    })
    .catch((error) => console.log("Error:", error));
};

// Post Discussion
const sendDiscussion = (event) => {
  const content = document.getElementsByTagName("textarea")[2].value;
  if (!content) {
    alert("請先輸入內容，謝謝。");
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  // Frontend Render
  discussionArrLength += 1;
  document.getElementById(
    "discussion-title"
  ).innerText = `目前共有 ${discussionArrLength} 則討論`;

  const date = new Date();
  const createDate = `${date.getFullYear()} / ${
    date.getMonth() + 1
  } / ${date.getDate()}`;

  const containerDiv = document.createElement("div");
  containerDiv.setAttribute("class", "container");
  containerDiv.innerHTML = `<div class="avatar"><a href="/profile.html?id=${userInfo["id"]}">
    <img  src="https://d1wan10jjr4v2x.cloudfront.net/profile/${userInfo["picture"]}" style="width: 100%" /></a>
  </div>
  <div class="text">
    <h3>${userInfo["name"]} <span class="time-right">${createDate}</span></h3>
    <hr />
    <p>
      ${content}
    </p>
  </div>`;

  document.getElementsByClassName("containers")[2].prepend(containerDiv);

  // Clear Input
  document.getElementsByClassName("comment-area")[2].value = "";

  // Store into Database
  const comment = {
    commentedId: id,
    content: content,
    commentTypeId: 3,
  };

  fetch(`/api/1.0/comment`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
    body: JSON.stringify(comment),
  })
    .then((res) => {
      if (res.status == 200) {
        alert("已送出課堂討論 :)");
      }
    })
    .catch((error) => console.log("Error:", error));
};

// Add Favorites
const addToFavorites = (event) => {
  const searchParams = new URLSearchParams(window.location.search);
  const body = { id: parseInt(searchParams.get("id")) };
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    alert("請先登入。");
  } else {
    fetch("/api/1.0/favorites", {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "content-type": "application/json",
      }),
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status == 200) {
          alert("成功加入收藏");
        } else if (res.status == 403) {
          alert("你之前已經加過囉");
        } else {
          alert("系統錯誤");
        }
      })
      .catch((error) => console.log("Error:", error));
  }
};

// Add to Cart
const addToCart = (event) => {
  const searchParams = new URLSearchParams(window.location.search);
  const body = { id: parseInt(searchParams.get("id")) };

  // Start to Storage - shopping list
  var shoppingList = localStorage.getItem("list");
  if (!shoppingList) {
    list = [body.id];
  } else {
    var list = JSON.parse(shoppingList);
    if (!list.includes(body.id)) {
      list.push(body.id);
    }
  }
  localStorage.removeItem("list");
  localStorage.setItem("list", JSON.stringify(list));
  showCartNum();

  alert("已加入購物車");
};
