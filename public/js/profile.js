window.onload = async function () {
  let params = new URL(document.location).searchParams;
  let userId = params.get("id");

  const userRes = await fetch(`/api/1.0/user/profile/details?id=${userId}`, {
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "content-type": "application/json",
    }),
  });
  const userObj = await userRes.json();
  console.log(userObj);
};
