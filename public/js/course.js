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

  const detailsObj = courseObj.details;
  const commentsArr = courseObj.comments;

  // Course Video
  let courseVideo = document.createElement("source");
  courseVideo.src = `/assets/${detailsObj["video"]}`;
  courseVideo.type = "video/mp4";
  document.getElementById("video-controls").appendChild(courseVideo);

  // Course Information

  // Course Title
  let courseTitle = document.createElement("h2");
  courseTitle.setAttribute("class", "course-title");
  courseTitle.innerText = detailsObj["title"];
  document.getElementById("course-info").appendChild(courseTitle);

  // Course Upload Time
  let date = new Date(detailsObj["upload_time"]);
  let uploadDate = `上傳日期: ${date.getFullYear()} / ${
    date.getMonth() + 1
  } / ${date.getDate()}`;

  let courseUploadTime = document.createElement("p");
  courseUploadTime.setAttribute("class", "course-upload-time");
  courseUploadTime.innerText = uploadDate;
  document.getElementById("course-info").appendChild(courseUploadTime);

  // Course Teacher
  let courseTeacher = document.createElement("p");
  courseTeacher.setAttribute("class", "course-teacher");
  courseTeacher.innerText = `開課老師：${detailsObj["name"]}`;
  document.getElementById("course-info").appendChild(courseTeacher);

  // Course Description
  let courseDescription = document.createElement("p");
  courseDescription.setAttribute("class", "course-description");
  courseDescription.innerText = detailsObj["description"];
  document.getElementById("course-info").appendChild(courseDescription);

  // Comments
  document.getElementById(
    "comments-num"
  ).innerText = `${commentsArr.length} comments`;

  for (let i = 0; i < commentsArr.length; i++) {
    let li = document.createElement("li");

    let commentMainLevel = document.createElement("div");
    commentMainLevel.setAttribute("class", "comment-main-level");

    // Avatar
    let commentAvatar = document.createElement("div");
    commentAvatar.setAttribute("class", "comment-avatar");

    let img = document.createElement("img");
    img.src = `images/profile.png`;
    img.alt = "";
    commentAvatar.appendChild(img);

    // Content
    let commentBox = document.createElement("div");
    commentBox.setAttribute("class", "comment-box");

    // Comment Head
    let commentHead = document.createElement("div");
    commentHead.setAttribute("class", "comment-head");

    let commentName = document.createElement("h6");
    commentName.setAttribute("class", "comment-name");
    commentHead.appendChild(commentName);

    let commentATag = document.createElement("a");
    //commentATag.href="" // personal profile page
    commentATag.innerText = commentsArr[i]["name"];
    commentName.appendChild(commentATag);
    commentHead.appendChild(commentName);

    let date = new Date(commentsArr[i]["create_time"]);
    let createDate = `${date.getFullYear()} / ${
      date.getMonth() + 1
    } / ${date.getDate()}`;
    let commentSpan = document.createElement("span");
    commentSpan.innerText = createDate;
    commentHead.appendChild(commentSpan);

    let commentReply = document.createElement("i");
    commentReply.setAttribute("class", "fa fa-reply");
    commentHead.appendChild(commentReply);

    let commentHeart = document.createElement("i");
    commentHeart.setAttribute("class", "fa fa-heart");
    commentHead.appendChild(commentHeart);

    commentBox.appendChild(commentHead);

    // Comment Content
    let commentContent = document.createElement("div");
    commentContent.setAttribute("class", "comment-content");
    commentContent.innerText = commentsArr[i]["content"];
    commentBox.appendChild(commentContent);

    commentMainLevel.appendChild(commentAvatar);
    commentMainLevel.appendChild(commentBox);
    li.appendChild(commentMainLevel);

    document.getElementById("comments-list").appendChild(li);
  }
};

const fontendSendComment = (event) => {
  const content = document.getElementsByTagName("textarea")[0].value;
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");

  const comment = {
    commentedId: id,
    content: content,
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
