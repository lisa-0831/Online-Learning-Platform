window.onload = async function () {
  showCartNum();
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
