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
