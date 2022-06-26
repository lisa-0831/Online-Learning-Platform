const checkLogin = (event) => {
  const access_token = localStorage.getItem("access_token");
  console.log(3, access_token);
  if (access_token !== null) {
    fetch(`/api/1.0/user/profile/detail?`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.error) {
          console.log(106, response.error);
          window.location.href = "/signin.html";
        } else {
          console.log(response);
          // window.location.href = "/profile.html";
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    window.location.href = "/signin.html";
  }
};
