let courseId;

window.onload = async function () {
  let params = new URL(document.location).searchParams;
  courseId = params.get("id");

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
      document.getElementById("demo").innerHTML = "直播已經開始囉";
    }
  }, 1000);
};

// Add Favorites
const addBooking = (event) => {
  const searchParams = new URLSearchParams(window.location.search);
  const body = { id: parseInt(searchParams.get("id")) };

  fetch("/api/1.0/livestreams/book", {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
    body: JSON.stringify(body),
  })
    .then((res) => {
      alert(res.statusText);
    })
    .catch((error) => console.log("Error:", error));
};

let peerConnection;

const video = document.querySelector("video");

const config = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

const socket = io.connect("http://localhost:3000");
socket.emit("student_join", courseId);

socket.emit("viewer", courseId);
socket.on("broadcaster", () => {
  socket.emit("viewer", courseId);
});

socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch((e) => console.error(e));
});

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });

  peerConnection.ontrack = (event) => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

// socket.on("message", (message) => {
//   const subtitleContainer = document.querySelector(".subtitle");
//   subtitleContainer.innerHTML = message;
// });

// let chatButton = document.querySelector("button.chat-button");
// chatButton.addEventListener("click", (e) => {
//   e.preventDefault();
//   let chatInput = document.querySelector("input.chat-input");
//   let content = chatInput.value;
//   chatInput.value = "";
//   socket.emit("chat-message", content);
// });

// socket.on("chat-room", (content) => {
//   let chatContent = document.createElement("p");
//   chatContent.textContent = content;
//   let chatDiv = document.querySelector(".chat");
//   chatDiv.append(chatContent);
// });

window.onunload = () => {
  socket.close();
  peerConnection.close();
};

window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};
