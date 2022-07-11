let courseId;

window.onload = async function () {
  let params = new URL(document.location).searchParams;
  courseId = params.get("id");
  console.log(courseId);

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
  console.log(livestreamObj);
  console.log(detailsObj);

  // Timestamp To Date
  const timestamp2Date = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

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

const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
};

const videoGrid = document.getElementById("video-grid");
const video = document.createElement("video");
// video.setAttribute("controls");
// video.setAttribute("width", "1280");
// video.setAttribute("height", "720");
// video.setAttribute("id", "video-controls");

const constraints = {
  video: {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
  },
  audio: true,
};

const socket = io.connect("http://localhost:3000");
socket.emit("teacher_join", courseId);

let recognizing = true;
let recognition = new webkitSpeechRecognition();

recognition.interimResults = true; // 講話的當下即時辨識
recognition.lang = "cmn-Hant-TW"; // 要辨識的語言
recognition.continuous = false; // 持續辨識，不會自動結束

let videostream;
navigator.mediaDevices
  .getUserMedia(constraints)
  .then((stream) => {
    videostream = stream;
    video.srcObject = stream;
    addVideoStream(video, stream);
  })
  .catch((error) => console.error(error));

// Subtitle
const subtitleContainer = document.querySelector(".subtitle");
let p = document.createElement("p");
subtitleContainer.appendChild(p);
recognition.start();

const startLivestream = (event) => {
  socket.emit("broadcaster", courseId);

  socket.on("viewer", (id) => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;

    let stream = videostream;
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection
      .createOffer()
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", id, peerConnection.localDescription);
      })
      .catch((e) => console.log(e));

    // event is called when receive an ICE candidate
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };

    // Subtitle
    let content;
    let previousContent;
    recognition.addEventListener("result", (e) => {
      p.textContent = e.results[0][0].transcript;
      content = p.textContent;
      if (e.results[0].isFinal) {
        p = document.createElement("p");
        subtitleContainer.appendChild(p);
      }
    });

    // We need to restart the api after the user finish a sentence
    recognition.addEventListener("end", (e) => {
      recognizing ? recognition.start() : recognition.stop();
      if (previousContent !== content) {
        const subtitleContainer = document.querySelector(".subtitle");
        subtitleContainer.textContent = content;
        socket.emit("message", id, content);
        previousContent = content;
      }
    });
  });

  socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
  });

  socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });
};

// socket.on("disconnectPeer", (id) => {
//   peerConnections[id].close();
//   delete peerConnections[id];
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
//   console.log(content);
//   let chatContent = document.createElement("p");
//   chatContent.textContent = content;
//   let chatDiv = document.querySelector(".chat");
//   chatDiv.append(chatContent);
// });

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
