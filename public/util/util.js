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
