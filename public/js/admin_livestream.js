window.onload = async function () {
  showCartNum();

  const authResponse = await fetch("/api/1.0/admin/auth", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    }),
  });
  const mainContent = document.getElementById("main-content");
  if (authResponse.status == 200) {
    mainContent.style.display = "block";
  } else {
    alert("抱歉，您並無權限，只有老師可以上傳哦。");
  }
};

// const postData = async (event) => {
//   event.preventDefault();
//   const data = new FormData(submitForm[0]);
//   let fetchResponse = await fetch("/api/1.0/admin/livestream", {
//     method: "POST",
//     headers: new Headers({
//       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//       "content-type": "application/json",
//     }),
//     body: data,
//   });
//   console.log(fetchResponse);
// };
// const submitForm = document.getElementById("submitForm");
// submitForm.addEventListener("submit", postData);
