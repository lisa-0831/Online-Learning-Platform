const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");

signInBtn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

const signUpForm = (event) => {
  event.preventDefault();
  const signUpInfo = new FormData(firstForm);

  fetch(`/api/1.0/user/signup`, {
    method: "POST",
    body: signUpInfo,
  })
    .then((res) => res.json())
    .then((response) => {
      localStorage.setItem("access_token", response.data.access_token);
    })
    .then((data) => {
      window.location.href = "/profile.html";
    })
    .catch((error) => console.error("Error:", error));
};

const signInForm = (event) => {
  event.preventDefault();
  const signInInfo = new FormData(secondForm);
  signInInfo.append("provider", "native");

  fetch(`/api/1.0/user/signin`, {
    method: "POST",
    body: signInInfo,
  })
    .then((res) => res.json())
    .then((response) => {
      console.log(44, response.data);
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user.id);
    })
    .then((data) => {
      history.go(-1);
    })
    .catch((error) => console.error("Error:", error));
};

firstForm.addEventListener("submit", signUpForm);
secondForm.addEventListener("submit", signInForm);
