const courseId = 10;

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

const constraints = {
  video: true,
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

    socket.emit("broadcaster", courseId);
  })
  .catch((error) => console.error(error));

// Subtitle
const subtitleContainer = document.querySelector(".subtitle");
let p = document.createElement("p");
subtitleContainer.appendChild(p);
recognition.start();

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
