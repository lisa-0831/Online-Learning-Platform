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
  const user = userObj.user.user;
  document.getElementsByClassName("name")[0].innerText = user.name;
  document.getElementsByClassName("email")[0].innerText = user.email;
  document.getElementsByClassName("value")[0].innerText = user.bought.length;
  document.getElementsByClassName("value")[1].innerText = user.teach.length;

  // Bought
  for (let i = 0; i < user.bought.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${user.bought[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.bought[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.bought[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Students Num
    // let courseStudent = document.createElement("h4");
    // // courseStudent.setAttribute("class", "course-student");
    // courseStudent.innerText = `學生 ${coursesObj[i]["students_num"]} 人`;
    // figcaption.appendChild(courseStudent);

    // Course Price
    let coursePrice = document.createElement("p");
    // coursePrice.setAttribute("class", "course-price");
    coursePrice.innerText = `NT$ ${user.bought[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[0].appendChild(course);
  }

  // Bought
  for (let i = 0; i < user.favorites.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${user.favorites[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.favorites[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.favorites[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Students Num
    // let courseStudent = document.createElement("h4");
    // // courseStudent.setAttribute("class", "course-student");
    // courseStudent.innerText = `學生 ${coursesObj[i]["students_num"]} 人`;
    // figcaption.appendChild(courseStudent);

    // Course Price
    let coursePrice = document.createElement("p");
    // coursePrice.setAttribute("class", "course-price");
    coursePrice.innerText = `NT$ ${user.favorites[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[1].appendChild(course);
  }

  // Teach
  for (let i = 0; i < user.teach.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${user.teach[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${user.teach[i]["cover"]}`;
    courseImg.width = "300";
    courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = user.teach[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Students Num
    // let courseStudent = document.createElement("h4");
    // // courseStudent.setAttribute("class", "course-student");
    // courseStudent.innerText = `學生 ${coursesObj[i]["students_num"]} 人`;
    // figcaption.appendChild(courseStudent);

    // Course Price
    let coursePrice = document.createElement("p");
    // coursePrice.setAttribute("class", "course-price");
    coursePrice.innerText = `NT$ ${user.teach[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementsByClassName("courses")[1].appendChild(course);
  }
};

const signOut = (event) => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_id");
  window.location.href = "./";
};
