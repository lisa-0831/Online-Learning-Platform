window.onload = async function () {
  // Courses
  let order = "trending";
  let hashtag = null;
  let category = "all";

  let params = new URL(document.location).searchParams;
  if (params.get("category") !== null) {
    category = params.get("category");
  }
  if (params.get("order") !== null) {
    order = params.get("order");
  }

  let url = `/api/1.0/courses/${category}?order=${order}`;
  hashtag = params.get("hashtag");
  if (hashtag !== null) {
    url += `&hashtag=${hashtag}`;
  }

  const coursesRes = await fetch(url);
  const coursesObj = await coursesRes.json();
  console.log(coursesObj);

  for (let i = 0; i < coursesObj.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute("href", `/course.html?id=${coursesObj[i].id}`);

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `/assets/${coursesObj[i]["cover"]}`;
    // courseImg.width = "300";
    // courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = coursesObj[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Students Num
    let courseStudent = document.createElement("h4");
    // courseStudent.setAttribute("class", "course-student");
    courseStudent.innerText = `學生 ${coursesObj[i]["students_num"]} 人`;
    figcaption.appendChild(courseStudent);

    // Course Price
    let coursePrice = document.createElement("p");
    // coursePrice.setAttribute("class", "course-price");
    coursePrice.innerText = `NT$ ${coursesObj[i]["price"]}`;
    figcaption.appendChild(coursePrice);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementById("courses").appendChild(course);
  }

  const orderParent = document.getElementById("orderParent");
  orderParent.addEventListener("click", function (e) {
    e.preventDefault();
    let order = e.target.dataset.type;
    let url = `./courses.html?category=${category}&order=${order}`;
    if (hashtag !== null) {
      url += `&hashtag=${hashtag}`;
    }
    window.location.href = url;
  });

  const tagParent = document.getElementById("tagParent");
  tagParent.addEventListener("click", function (e) {
    e.preventDefault();
    let hashtag = e.target.dataset.type;
    hashtag = hashtag.substring(1);
    let url = `./courses.html?category=all&order=${order}&hashtag=${hashtag}`;
    window.location.href = url;
  });
};
