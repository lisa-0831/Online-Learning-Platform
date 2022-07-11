window.onload = async function () {
  let params = new URL(document.location).searchParams;
  let courseId = params.get("id");

  const livestreamRes = await fetch(
    `/api/1.0/livestreams/details?id=${courseId}`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "content-type": "application/json",
      }),
    }
  );
  const livestreamObj = await livestreamRes.json();
  const detailsObj = livestreamObj.details;

  // Timestamp To Date
  const timestamp2Date = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Course Video
  let courseVideo = document.createElement("source");
  courseVideo.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${detailsObj["teaser"]}`;
  courseVideo.type = "video/mp4";
  document.getElementById("video-controls").appendChild(courseVideo);

  // Course Information - Left

  // Course Introduction
  const introductionDiv = document.createElement("div");
  introductionDiv.setAttribute("class", "course-info-detail");
  introductionDiv.innerText = detailsObj.introduction;
  document
    .getElementsByClassName("course-introduction")[0]
    .appendChild(introductionDiv);

  // Course description
  const descriptionDiv = document.createElement("div");
  descriptionDiv.setAttribute("class", "course-info-detail");
  descriptionDiv.innerText = detailsObj.description;
  document
    .getElementsByClassName("course-description")[0]
    .appendChild(descriptionDiv);

  // Course preparation
  const preparationDiv = document.createElement("div");
  preparationDiv.setAttribute("class", "course-info-detail");
  preparationDiv.innerText = detailsObj.preparation;
  document
    .getElementsByClassName("course-preparation")[0]
    .appendChild(preparationDiv);

  // Course Information - Right

  // Course Title
  document.getElementsByClassName("course-title")[0].innerText =
    detailsObj.title;

  // Course Teacher
  const teacherDiv = document.createElement("div");
  teacherDiv.setAttribute("class", "course-action-detail");
  teacherDiv.innerText = `直播老師：${detailsObj.teacher_name}`;
  document
    .getElementsByClassName("course-action-content")[0]
    .appendChild(teacherDiv);

  // Course Time
  const startTimeDiv = document.createElement("div");
  startTimeDiv.setAttribute("class", "course-action-detail");
  startTimeDiv.innerText = `直播時間：${timestamp2Date(detailsObj.start_time)}`;
  document
    .getElementsByClassName("course-action-content")[0]
    .appendChild(startTimeDiv);

  // Student Num
  const studentNumDiv = document.createElement("div");
  studentNumDiv.setAttribute("class", "course-action-detail");
  studentNumDiv.innerText = `預約人數：目前 ${detailsObj.students_num} 人預約`;
  document
    .getElementsByClassName("course-action-content")[0]
    .appendChild(studentNumDiv);

  // Set the date we're counting down to
  // let countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();
  let countDownDate = detailsObj.start_time;

  // Update the count down every 1 second
  let x = setInterval(function () {
    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the count down date
    let distance = countDownDate - now;
    if (distance > 0) {
      document.getElementById("timer-title").innerHTML = "距離直播開始還剩";
    }

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    document.getElementById("demo").innerHTML =
      days + "天 " + hours + "時 " + minutes + "分 " + seconds + "秒 ";

    // If the count down is over, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("demo").innerHTML = detailsObj.title;
    }
  }, 1000);
};

// Add Favorites
const addBooking = (event) => {
  const searchParams = new URLSearchParams(window.location.search);
  const body = { id: parseInt(searchParams.get("id")) };

  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    alert("請先登入。");
  } else {
    fetch("/api/1.0/livestreams/book", {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "content-type": "application/json",
      }),
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status == 200) {
          alert("成功預約");
        } else if (res.status == 403) {
          alert("你之前已經預約過囉");
        } else {
          alert("系統錯誤");
        }
      })
      .catch((error) => console.log("Error:", error));
  }
};
