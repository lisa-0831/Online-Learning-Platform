let currentRoom = [];
let userId = 0;
let username = "";

window.onload = async function () {
  const socket = io();

  const chatForm = document.getElementById("chat-form");
  const chatMessages = document.querySelector(".chat-messages");

  // Output message to DOM
  const outputMessage = (playload) => {
    const messageDiv = document.createElement("div");
    if (playload.userId == userId) {
      messageDiv.setAttribute("class", "message right");
    } else {
      messageDiv.setAttribute("class", "message");
    }

    let contentHtml = `
        <p class="meta">
          ${playload.message.username}
           <span> ${playload.message.time} </span>
        </p>
        <p class="text">
          ${playload.message.text}
        </p>`;

    const contentDiv = document.createElement("div");
    contentDiv.setAttribute("class", "content");
    contentDiv.innerHTML = contentHtml;

    messageDiv.appendChild(contentDiv);
    document.getElementById("chat-messages").appendChild(messageDiv);
  };

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

  // SideBar
  const renderSidebar = async () => {
    const sidebarRes = await fetch(`/api/1.0/messages/all`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
    });
    const sidebarObj = await sidebarRes.json();
    const messagesArr = sidebarObj.messages;
    const countObj = sidebarObj.count;
    const userObj = sidebarObj.user;
    userId = userObj.id; // Update userId
    username = userObj.name; // Update username

    for (let i = 0; i < messagesArr.length; i++) {
      let otherId = 0;
      let otherName = "";
      let otherPic = "";

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

      const imageDiv = document.createElement("div");
      imageDiv.setAttribute("class", "image");
      imageDiv.setAttribute("data-type", otherId);
      const image = document.createElement("img");
      image.setAttribute("class", "profile");
      image.setAttribute("src", `/images/${otherPic}`);
      image.setAttribute("alt", "profile piture");
      image.setAttribute("width", "50px");
      image.setAttribute("height", "50px");
      imageDiv.appendChild(image);

      const nameDiv = document.createElement("div");
      nameDiv.setAttribute("class", "group-name");
      nameDiv.setAttribute("data-type", otherId);

      let content = messagesArr[i]["content"];
      if (content.length > 30) {
        content = content.slice(0, 30) + "...";
      }

      if (messagesArr[i]["room"] in countObj) {
        nameDiv.innerHTML = `
        <p class="title">
          ${otherName}
          <span class="date">${timestamp2Date(
            messagesArr[i]["create_time"]
          )}</span>
        </p>
        <p>
          ${content}
          <span class="n">${countObj[messagesArr[i]["room"]]["msg_num"]}</span>
        </p>`;
      } else {
        nameDiv.innerHTML = `
        <p class="title">
          ${otherName}
          <span class="date">${timestamp2Date(
            messagesArr[i]["create_time"]
          )}</span>
        </p>
        <p>
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
  };

  await renderSidebar();

  // Change Room
  const roomParent = document.getElementById("roomParent");
  roomParent.addEventListener("click", async function (e) {
    e.preventDefault();
    const otherSideId = e.target.dataset.type;
    console.log(94, otherSideId);

    // Remove Messages
    const messagesElement = document.getElementById("chat-messages"); // will return element
    messagesElement.innerHTML = "";

    // Messages
    const chatroomRes = await fetch(
      `/api/1.0/messages/details?id=${otherSideId}`,
      {
        method: "GET",
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
           <span> ${timestamp2Time(messagesArr[i]["create_time"])} </span>
        </p>
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

    // Remove SideBar
    const sidebarElement = document.getElementById("roomParent"); // will return element
    sidebarElement.innerHTML = "";

    // Put SideBar
    await renderSidebar();
  });

  // Message submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;
    const playload = {
      room: currentRoom,
      userId: userId,
      message: {
        text: msg,
        username: username,
      },
    };

    // Emit message to server
    socket.emit("send_message", playload);

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
      body: JSON.stringify(playload),
    });

    // Remove SideBar
    const sidebarElement = document.getElementById("roomParent"); // will return element
    sidebarElement.innerHTML = "";

    // Put SideBar
    await renderSidebar();
  });

  // Message from server
  socket.on("receive_message", async (playload) => {
    if (playload.room == currentRoom) {
      outputMessage(playload);
    }
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Remove SideBar
    const sidebarElement = document.getElementById("roomParent"); // will return element
    sidebarElement.innerHTML = "";

    // Put SideBar
    await renderSidebar();
  });
};
