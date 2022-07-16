pageSize = 12;
hashtagSize = 20;

const showCartNum = () => {
  cartNum = JSON.parse(localStorage.getItem("list"));
  if (cartNum !== null) {
    document.getElementsByClassName("count")[0].innerText = cartNum.length;
    document.getElementsByClassName("count")[1].innerText = cartNum.length;
  }
};

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
const searchBar = document.getElementById("search");
const mobileSearchBar = document.getElementById("search-mobile");

searchBar.addEventListener("keypress", (event) => {
  if (event.key == "Enter") {
    event.preventDefault();
    const searchInput = document.querySelector("input").value;
    console.log(searchInput);

    // Clear input
    searchBar.value = "";
    searchBar.focus();

    window.location.href = `./search.html?keyword=${searchInput}`;
  }
});

mobileSearchBar.addEventListener("keypress", (event) => {
  console.log(86);
  if (event.key == "Enter") {
    event.preventDefault();
    const searchInput = document.getElementById("search-mobile").value;

    // Clear input
    searchBar.value = "";
    searchBar.focus();

    window.location.href = `./search.html?keyword=${searchInput}`;
  }
});
