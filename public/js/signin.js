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

  const name = document.getElementsByName("name")[0].value;
  const email = document.getElementsByName("email")[0].value;
  const password = document.getElementsByName("password")[0].value;
  const signUpInfo = {
    name: name,
    email: email,
    password: password,
  };

  fetch(`/api/1.0/user/signup`, {
    method: "POST",
    body: JSON.stringify(signUpInfo),
    headers: { "content-type": "application/json" },
  })
    .then((res) => res.json())
    .then((response) => {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user.id);
    })
    .then((data) => {
      window.location.href = "/courses.html";
    })
    .catch((error) => console.error("Error:", error));
};

const signInForm = (event) => {
  event.preventDefault();

  const email = document.getElementsByName("email")[1].value;
  const password = document.getElementsByName("password")[1].value;
  const signInInfo = {
    email: email,
    password: password,
    provider: "native",
  };

  fetch(`/api/1.0/user/signin`, {
    method: "POST",
    body: JSON.stringify(signInInfo),
    headers: { "content-type": "application/json" },
  })
    .then((res) => res.json())
    .then((response) => {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_id", response.data.user.id);
    })
    .then((data) => {
      window.location.href = "/courses.html";
    })
    .catch((error) => console.error("Error:", error));
};

firstForm.addEventListener("submit", signUpForm);
secondForm.addEventListener("submit", signInForm);
