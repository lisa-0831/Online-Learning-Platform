let detailsObj;
let questionsArr;
let ratingArr;
let discussionArr;
let userInfo;
let questionsArrLength;
let discussionArrLength;

window.onload = async function () {
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
  console.log(detailsObj);
  questionsArr = courseObj.questions;
  console.log(questionsArr);
  ratingArr = courseObj.rating;
  console.log(19, ratingArr);
  discussionArr = courseObj.discussion;
  console.log(discussionArr);
  const status = courseObj.status;
  console.log(status);
  userInfo = courseObj.userInfo;
  console.log(userInfo);

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
  let priceDiv = document.createElement("div");
  priceDiv.setAttribute("class", "course-info course-price");
  priceDiv.innerHTML = `<p>課程售價</p>
  <h2>NT$${detailsObj["price"]}</h2>`;
  document.getElementsByClassName("course-all-info")[0].prepend(priceDiv);

  // Course Title
  let titleDiv = document.createElement("div");
  titleDiv.setAttribute("class", "course-info course-title");
  let courseTitle = document.createElement("h1");
  courseTitle.innerText = detailsObj["title"];
  titleDiv.appendChild(courseTitle);
  document.getElementsByClassName("course-all-info")[0].prepend(titleDiv);

  // Course Upload Time
  let date = new Date(detailsObj["upload_time"]);
  let uploadDate = `上傳日期: ${date.getFullYear()} / ${
    date.getMonth() + 1
  } / ${date.getDate()}`;

  let courseUploadTime = document.createElement("p");
  courseUploadTime.setAttribute("class", "course-upload-time");
  courseUploadTime.innerText = uploadDate;
  document.getElementById("detail").appendChild(courseUploadTime);

  // Course Teacher
  let courseTeacher = document.createElement("p");
  courseTeacher.setAttribute("class", "course-teacher");
  courseTeacher.innerText = `開課老師：${detailsObj["name"]}`;
  document.getElementById("detail").appendChild(courseTeacher);

  // Course Description
  let courseDescription = document.createElement("p");
  courseDescription.setAttribute("class", "course-description");
  courseDescription.innerText = detailsObj["description"];
  document.getElementById("detail").appendChild(courseDescription);

  if (userInfo !== undefined) {
    // User Info
    document.getElementsByClassName(
      "containers"
    )[0].innerHTML = `<div class="container">
    <div class="avatar user-avatar">
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
    </div>
  </div>
  <h4 id="questions-num"></h4>`;

    document.getElementsByClassName(
      "user-avatar"
    )[1].innerHTML = `<a href="./profile.html?id=${userInfo["userId"]}">
<img src="./profile/${userInfo["picture"]}" style="width: 100%" />
</a>`;

    document.getElementsByClassName("user-name")[0].innerText =
      userInfo["name"];
  }

  // Questions
  questionsArrLength = questionsArr.length;
  document.getElementById(
    "questions-num"
  ).innerText = `${questionsArrLength} 則 Q&A`;

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

    document.getElementsByClassName("containers")[1].appendChild(containerDiv);
  }

  // Rating
  if (status == "course_before_pay") {
    const button = document.getElementById("myBtn");
    button.remove();
  }

  document.getElementById(
    "rating-num"
  ).innerText = `${ratingArr.length}則 評論`;

  let total = 0;
  for (let i = 0; i < ratingArr.length; i++) {
    const date = new Date(ratingArr[i]["create_time"]);
    const createDate = `${date.getFullYear()} / ${
      date.getMonth() + 1
    } / ${date.getDate()}`;

    let star = "";
    total += ratingArr[i].star;
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

    document.getElementsByClassName("containers")[2].appendChild(containerDiv);
  }

  const avgP = document.createElement("p");
  if (ratingArr.length > 0) {
    avgP.innerText = `平均 ${(total / ratingArr.length).toFixed(1)}`;
  }
  document.getElementsByClassName("rating-avg")[0].appendChild(avgP);

  // Discussion
  if (status == "course_before_pay") {
    document.getElementsByClassName("containers")[3].innerText =
      "請先購買才可以看到上課討論哦～ 感謝 :)";
  } else {
    const inputDiv = document.createElement("div");
    inputDiv.setAttribute("class", "container");
    inputDiv.innerHTML = `
    <div class="avatar">
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
    </div>
  `;

    document.getElementsByClassName("containers")[3].prepend(inputDiv);
    discussionArrLength = discussionArr.length;

    document.getElementById(
      "discussion-num"
    ).innerText = `${discussionArr.length} 則 討論`;

    for (let i = 0; i < discussionArr.length; i++) {
      const date = new Date(discussionArr[i]["create_time"]);
      const createDate = `${date.getFullYear()} / ${
        date.getMonth() + 1
      } / ${date.getDate()}`;

      const containerDiv = document.createElement("div");
      containerDiv.setAttribute("class", "container");
      containerDiv.innerHTML = `<div class="avatar"><a href="/profile.html?id=${discussionArr[i]["id"]}">
      <img  src="https://d1wan10jjr4v2x.cloudfront.net/profile/${discussionArr[i]["picture"]}" style="width: 100%" /></a>
    </div>
    <div class="text">
      <h3>${discussionArr[i]["name"]} <span class="time-right">${createDate}</span></h3>
      <hr />
      <p>
        ${discussionArr[i]["content"]}
      </p>
    </div>`;

      document
        .getElementsByClassName("containers")[4]
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
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// Post Question
const sendQuestion = (event) => {
  const content = document.getElementsByTagName("textarea")[0].value;
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  // Render
  questionsArrLength += 1;
  document.getElementById(
    "questions-num"
  ).innerText = `${questionsArrLength} 則 Q&A`;

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

  document.getElementsByClassName("containers")[1].prepend(containerDiv);

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
  const select = document.getElementById("comment-star");
  const star = select.options[select.selectedIndex].value;

  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  const comment = {
    commentedId: id,
    content: content,
    commentTypeId: 1,
    star: star,
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
      history.go(0);
    })
    .catch((error) => console.log("Error:", error));
};

// Post Discussion
const sendDiscussion = (event) => {
  const content = document.getElementsByTagName("textarea")[2].value;
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  // Frontend Render
  discussionArrLength += 1;
  document.getElementById(
    "discussion-num"
  ).innerText = `${discussionArrLength} 則 討論`;

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

  document.getElementsByClassName("containers")[4].prepend(containerDiv);

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
    list.push(body.id);
  }
  localStorage.removeItem("list");
  localStorage.setItem("list", JSON.stringify(list));

  alert("已加入購物車");
};

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
