pageSize = 12;
hashtagSize = 20;

const checkLogin = (event) => {
  const access_token = localStorage.getItem("access_token");
  if (access_token !== null) {
    fetch(`/api/1.0/user/status`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        window.location.href = "/cart.html";
      })
      .catch((error) => (window.location.href = "/signin.html"));
  } else {
    window.location.href = "/signin.html";
  }
};

const checkIdentity = (event) => {
  const access_token = localStorage.getItem("access_token");
  const user_id = localStorage.getItem("user_id");

  if (access_token !== null) {
    fetch(`/api/1.0/user/status`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        window.location.href = `/profile.html?id=${user_id}`;
      })
      .catch((error) => (window.location.href = "/signin.html"));
  } else {
    window.location.href = "/signin.html";
  }
};

const checkMessenger = (event) => {
  const access_token = localStorage.getItem("access_token");

  if (access_token !== null) {
    fetch(`/api/1.0/user/status`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        window.location.href = `/messenger.html`;
      })
      .catch((error) => (window.location.href = "/signin.html"));
  } else {
    window.location.href = "/signin.html";
  }
};

// Search
const searchBar = document.getElementById("search-bar");
console.log(searchBar);

searchBar.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log(72);

  // Get message text
  const searchInput = e.target.elements.search.value;

  if (input.length == 0) {
    alert("請先輸入欲搜尋的字。");
  } else {
    console.log("here");
    console.log(searchInput);

    // const payload = {
    //   room: currentRoom,
    //   userId: userId,
    //   message: {
    //     text: msg,
    //     username: username,
    //   },
    // };

    // // Clear input
    // e.target.elements.search.value = "";
    // e.target.elements.search.focus();

    // // Store Message API
    // const searchId = await fetch(`/api/1.0/courses/search?keyword=${input}`, {
    //   method: "POST",
    //   headers: new Headers({
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    //   }),
    //   body: JSON.stringify(payload),
    // });
  }
});
