const courseId = 10;

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
