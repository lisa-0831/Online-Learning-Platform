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

const addHashtagCol = () => {
  // Create div
  const div = document.createElement("div");
  div.setAttribute("class", "col-75");
  div.id = "hashtagCol";

  // Hashtag
  const input = document.createElement("input");
  input.type = "text";
  input.name = "hashtag";
  input.placeholder = "#DigitalMarketing";

  div.appendChild(input);

  // div.innerHTML = '<button type="button" onclick="removeField">Remove</button>'
  document.getElementById("hashtagCols").appendChild(div);
};

const addVideoCol = () => {
  // Create div
  const div = document.createElement("div");
  div.setAttribute("class", "col-75");
  div.id = "videoCol";

  // Chapter Title
  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.name = "chapterTitle";
  inputText.placeholder = "章節標題";
  div.appendChild(inputText);

  // Video List
  const inputVideo = document.createElement("input");
  inputVideo.type = "file";
  inputVideo.name = "videoList";
  div.appendChild(inputVideo);

  // div.innerHTML = '<button type="button" onclick="removeField">Remove</button>'
  document.getElementById("videoCols").appendChild(div);
};
