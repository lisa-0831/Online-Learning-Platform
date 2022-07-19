// const postData = async (event) => {
//   event.preventDefault();
//   const data = new FormData(submitForm);
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
