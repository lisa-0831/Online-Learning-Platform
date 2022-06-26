const addHashtagCol = () => {
  // Create div
  var div = document.createElement("div");
  div.id = "hashtagCol";

  // Hashtag
  var input = document.createElement("input");
  input.type = "text";
  input.name = "hashtag";
  input.placeholder = "#DigitalMarketing";

  div.appendChild(input);

  // div.innerHTML = '<button type="button" onclick="removeField">Remove</button>'
  document.getElementById("hashtagCols").appendChild(div);
};
