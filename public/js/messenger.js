let currentRoom = [];
let currentSelected = -1;
let userId = 0;
let username = "";

window.onload = async function () {
  showCartNum();

  const socket = io();

  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.querySelector(".chat-messages");

  // Timestamp To Date
  const timestamp2Date = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    // return `${date.getFullYear()}/${
    //   date.getMonth() + 1
    // }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  // Timestamp To Time
  const timestamp2Time = (timestamp) => {
    const date = new Date(timestamp);
    if (new Date(timestamp).toDateString() === new Date().toDateString()) {
      // Today's Message
      return `${date.toLocaleTimeString()}`;
    } else {
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  };

  // Output message to DOM
  const outputMessage = (payload) => {
    const messageDiv = document.createElement("div");
    if (payload.userId == userId) {
      messageDiv.setAttribute("class", "message right");
    } else {
      messageDiv.setAttribute("class", "message");
    }

    let contentHtml = `
        <p class="meta">
          ${payload.message.username}
           <span> ${timestamp2Time(payload.message.time)} </span>
        </p>
        <p class="text">
          ${payload.message.text}
        </p>`;

    const contentDiv = document.createElement("div");
    contentDiv.setAttribute("class", "content");
    contentDiv.innerHTML = contentHtml;

    messageDiv.appendChild(contentDiv);
    document.getElementById("chat-messages").appendChild(messageDiv);
  };

  // SideBar
  const renderSidebar = async () => {
    const sidebarRes = await fetch(`/api/1.0/messages/all`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
      body: JSON.stringify({
        receiverId: localStorage.getItem("receiver_id"),
      }),
    });
    const sidebarObj = await sidebarRes.json();
    const messagesArr = sidebarObj.messages;
    const countObj = sidebarObj.count;
    const userObj = sidebarObj.user;

    document.getElementsByClassName("chat-left-title")[0].innerText =
      userObj.name;
    const receiverObj = sidebarObj.receiver;

    if (messagesArr.length == 0 && receiverObj == undefined) {
      alert("目前無任何聊天記錄，可以到他人頁面開始聊天唷～");
    } else {
      document.getElementById("chat-form").innerHTML = `<input
      id="msg"
      type="text"
      placeholder="Enter Message"
      required
      autocomplete="off"
      />
      <button class="btn">
        <i class="fas fa-paper-plane"></i> Send
      </button>`;
    }

    userId = userObj.id; // Update userId
    username = userObj.name; // Update username
    let allMessageRoom = [];

    for (let i = 0; i < messagesArr.length; i++) {
      let otherId = 0;
      let otherName = "";
      let otherPic = "";

      allMessageRoom.push(messagesArr[i]["room"]);

      if (messagesArr[i]["sender_id"] !== userObj.id) {
        otherId = messagesArr[i]["sender_id"];
        otherName = messagesArr[i]["sender_name"];
        otherPic = messagesArr[i]["sender_pic"];
      } else {
        otherId = messagesArr[i]["receiver_id"];
        otherName = messagesArr[i]["receiver_name"];
        otherPic = messagesArr[i]["receiver_pic"];
      }

      const groupDiv = document.createElement("a");
      if (messagesArr[i]["room"] in countObj) {
        groupDiv.setAttribute("class", "group active");
      } else {
        groupDiv.setAttribute("class", "group");
      }
      groupDiv.setAttribute("data-type", otherId);
      groupDiv.setAttribute("id", otherId);

      const imageDiv = document.createElement("div");
      imageDiv.setAttribute("class", "image");
      const image = document.createElement("img");
      image.setAttribute("class", "profile");
      image.setAttribute(
        "src",
        `https://d1wan10jjr4v2x.cloudfront.net/profile/${otherPic}`
      );
      image.setAttribute("alt", "profile piture");
      image.setAttribute("width", "50px");
      image.setAttribute("height", "50px");
      imageDiv.appendChild(image);

      const nameDiv = document.createElement("div");
      nameDiv.setAttribute("class", "group-name");

      let content = messagesArr[i]["content"];
      if (content.length > 30) {
        content = content.slice(0, 30) + "...";
      }

      if (otherName.length > 10) {
        otherName = otherName.slice(0, 10) + "...";
      }

      if (messagesArr[i]["room"] in countObj) {
        nameDiv.innerHTML = `
        <p class="title">
          ${otherName}
          <span class="date" id="d${otherId}">${timestamp2Date(
          messagesArr[i]["create_time"]
        )}</span>
        </p>
        <p id="p${otherId}">
          ${content}
        </p>`;
      } else {
        nameDiv.innerHTML = `
        <p class="title">
          ${otherName}
          <span class="date" id="d${otherId}">${timestamp2Date(
          messagesArr[i]["create_time"]
        )}</span>
        </p>
        <p id="p${otherId}">
          ${content}
        </p>`;
      }
      groupDiv.appendChild(imageDiv);
      groupDiv.appendChild(nameDiv);

      document.getElementById("roomParent").appendChild(groupDiv);

      // Connect Socket
      socket.emit("user_join", {
        room: messagesArr[i]["room"],
      });
    }

    if (receiverObj !== undefined) {
      if (allMessageRoom.includes(receiverObj["clickRoom"])) {
        const moveToTop = (toId) => {
          // Update the sidebar
          const sendToUser = document.getElementById(toId);
          sendToUser.remove();
          document.getElementsByClassName("group-list")[0].prepend(sendToUser);
        };

        moveToTop(receiverObj.receiverInfo.id);
      } else {
        const groupDiv = document.createElement("a");
        groupDiv.setAttribute("class", "group");
        groupDiv.setAttribute("data-type", receiverObj.receiverInfo.id);
        groupDiv.setAttribute("id", receiverObj.receiverInfo.id);

        const imageDiv = document.createElement("div");
        imageDiv.setAttribute("class", "image");
        const image = document.createElement("img");
        image.setAttribute("class", "profile");
        image.setAttribute(
          "src",
          `https://d1wan10jjr4v2x.cloudfront.net/profile/${receiverObj.receiverInfo.picture}`
        );
        image.setAttribute("alt", "profile piture");
        image.setAttribute("width", "50px");
        image.setAttribute("height", "50px");
        imageDiv.appendChild(image);

        const nameDiv = document.createElement("div");
        nameDiv.setAttribute("class", "group-name");
        nameDiv.innerHTML = `
        <p class="title">
          ${receiverObj.receiverInfo.name}
          <span class="date" id="d${receiverObj.receiverInfo.id}"></span>
        </p>
        <p id="p${receiverObj.receiverInfo.id}">
        </p>`;
        groupDiv.appendChild(imageDiv);
        groupDiv.appendChild(nameDiv);

        document.getElementById("roomParent").prepend(groupDiv);
      }

      // Connect Socket
      socket.emit("user_join", {
        room: receiverObj.clickRoom,
      });

      currentRoom = receiverObj.clickRoom;

      localStorage.removeItem("receiver_id");
    }
  };

  await renderSidebar();

  // If User clicked messenger button
  // const receiver_id = localStorage.getItem("receiver_id");
  // if (receiver_id !== null) {
  //   currentRoom = [userId, receiver_id];
  //   room.sort(function (a, b) {
  //     return a - b;
  //   });
  //   room = room.toString();
  // }
  // 要再remove localstorage

  // Change Room
  const roomParent = document.getElementById("roomParent");
  roomParent.addEventListener("click", async function (e) {
    e.preventDefault();
    const otherSideId = e.target.dataset.type;

    // Remove Messages
    const messagesElement = document.getElementById("chat-messages"); // will return element
    messagesElement.innerHTML = "";

    // Messages
    const chatroomRes = await fetch(
      `/api/1.0/messages/details?id=${otherSideId}`,
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }),
      }
    );
    const chatroomObj = await chatroomRes.json();
    const messagesArr = chatroomObj.messages;
    const userObj = chatroomObj.user;
    currentRoom = userObj.room;

    // Put Messages
    for (let i = 0; i < messagesArr.length; i++) {
      const messageDiv = document.createElement("div");
      let contentHtml = "";

      if (messagesArr[i]["sender_id"] == userObj.id) {
        messageDiv.setAttribute("class", "message right");

        contentHtml = `
        <p class="meta">
          ${userObj.name}
        </p>
        <span class="meta"> ${timestamp2Time(
          messagesArr[i]["create_time"]
        )} </span>
        <p class="text">
          ${messagesArr[i]["content"]}
        </p>`;
      } else {
        messageDiv.setAttribute("class", "message");

        contentHtml = `
        <p class="meta"> 
          ${messagesArr[i]["name"]}
           <span> ${timestamp2Time(messagesArr[i]["create_time"])} </span>
        </p>
        <p class="text">
          ${messagesArr[i]["content"]}
        </p>`;
      }

      const contentDiv = document.createElement("div");
      contentDiv.setAttribute("class", "content");
      contentDiv.innerHTML = contentHtml;

      messageDiv.appendChild(contentDiv);
      document.getElementById("chat-messages").appendChild(messageDiv);
    }

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Change the background
    if (currentSelected !== -1) {
      document.getElementById(currentSelected).classList.remove("selected");
    }
    document.getElementById(otherSideId).classList.add("selected");
    document.getElementById(otherSideId).classList.remove("active");

    // if (document.getElementById(`n${otherSideId}`) !== null) {
    //   document.getElementById(`n${otherSideId}`).classList.add("n-selected");
    //   document.getElementById(`n${otherSideId}`).innerText = "";
    // }

    currentSelected = otherSideId;

    // Update the last check time
    await fetch(`/api/1.0/messenger/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ receiverId: currentSelected }),
    });
  });

  // Message submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let msg;
    if (currentRoom.length == 0) {
      alert("請先選擇聊天室。");
    } else {
      // Get message text
      msg = e.target.elements.msg.value;
      const payload = {
        room: currentRoom,
        userId: userId,
        message: {
          text: msg,
          username: username,
        },
      };

      // Emit message to server
      socket.emit("send_message", payload);

      // Clear input
      e.target.elements.msg.value = "";
      e.target.elements.msg.focus();

      // Store Message API
      const messageId = await fetch(`/api/1.0/messages`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }),
        body: JSON.stringify(payload),
      });
    }

    // Update the sidebar
    document.getElementById(`d${currentSelected}`).innerText = timestamp2Date(
      Date.now()
    );

    if (msg.length > 30) {
      msg = msg.slice(0, 30);
    }
    document.getElementById(`p${currentSelected}`).innerText = msg;
    const sendToUser = document.getElementById(currentSelected);
    sendToUser.remove();
    document.getElementsByClassName("group-list")[0].prepend(sendToUser);

    // Update the last check time
    await fetch(`/api/1.0/messenger/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ receiverId: currentSelected }),
    });
  });

  // Message from server
  socket.on("receive_message", async (payload) => {
    const moveToTop = (toId) => {
      // Update the sidebar
      document.getElementById(`d${toId}`).innerText = timestamp2Date(
        Date.now()
      );
      const message = payload.message.text;
      if (message.length > 30) {
        message = message.slice(0, 30);
      }
      document.getElementById(`p${toId}`).innerText = message;
      const sendToUser = document.getElementById(toId);
      sendToUser.remove();
      document.getElementsByClassName("group-list")[0].prepend(sendToUser);
    };

    if (payload.room == currentRoom) {
      outputMessage(payload);
      // Scroll down
      chatMessages.scrollTop = chatMessages.scrollHeight;

      moveToTop(currentSelected);
    } else {
      moveToTop(payload.userId);
      document.getElementById(payload.userId).classList.add("active");
    }
  });
};
