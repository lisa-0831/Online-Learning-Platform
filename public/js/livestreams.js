pageSize = 12;
pages = 1;
currentPage = 1;

window.onload = async function () {
  // Courses
  let order = "trending";
  let category = "all";
  let paging = null;

  let params = new URL(document.location).searchParams;
  if (params.get("category") !== null) {
    category = params.get("category");
  }
  if (params.get("order") !== null) {
    order = params.get("order");
  }
  let url = `/api/1.0/livestreams/${category}?order=${order}`;

  paging = params.get("paging");
  if (paging !== null) {
    url += `&paging=${paging - 1}`;
  }

  const livestreamsAllRes = await fetch(url);
  const livestreamsAllObj = await livestreamsAllRes.json();

  const livestreamsObj = livestreamsAllObj.products;
  const livestreamNum = livestreamsAllObj.livestreamNum[0]["COUNT(*)"];
  console.log(livestreamsObj);
  console.log(livestreamNum);

  // Timestamp To Date
  const timestamp2Date = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  for (let i = 0; i < livestreamsObj.length; i++) {
    // Course Div
    let course = document.createElement("figure");
    course.setAttribute("class", "course");

    // Course a Tag
    let courseTag = document.createElement("a");
    courseTag.setAttribute("class", "course-detail");
    courseTag.setAttribute(
      "href",
      `/livestream.html?id=${livestreamsObj[i].id}`
    );

    // Course Cover
    let imgDiv = document.createElement("div");
    imgDiv.setAttribute("class", "course-image");

    let courseImg = document.createElement("img");
    courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${livestreamsObj[i]["cover"]}`;
    // courseImg.width = "300";
    // courseImg.height = "186";
    imgDiv.appendChild(courseImg);
    courseTag.appendChild(imgDiv);

    // Course Figcaption
    let figcaption = document.createElement("figcaption");

    // Course Title
    let courseTitle = document.createElement("h3");
    // courseTitle.setAttribute("class", "course-title");
    courseTitle.innerText = livestreamsObj[i]["title"];
    figcaption.appendChild(courseTitle);

    // Course Students Num
    let courseStudent = document.createElement("h4");
    // courseStudent.setAttribute("class", "course-student");
    courseStudent.innerText = `預約人數 ${livestreamsObj[i]["students_num"]} 人`;
    figcaption.appendChild(courseStudent);

    // Course Time
    let courseTime = document.createElement("p");
    // coursePrice.setAttribute("class", "course-price");
    courseTime.innerText = `直播時間 ${timestamp2Date(
      livestreamsObj[i]["start_time"]
    )}`;
    figcaption.appendChild(courseTime);

    courseTag.appendChild(figcaption);
    course.appendChild(courseTag);
    document.getElementById("courses").appendChild(course);
  }

  // Paging
  pages = Math.ceil(livestreamNum / pageSize);
  currentPage = parseInt(paging) || 1;

  const pageArr = [];
  if (pages <= 4 || (currentPage - 3 < 1 && currentPage + 3 > pages)) {
    for (let i = 1; i <= pages; i++) {
      pageArr.push(i);
    }
  } else {
    if (currentPage - 3 < 1) {
      pageArr = [1, 2, 3];
    } else {
      pageArr = [1, "...", currentPage - 1, currentPage];
      if (currentPage !== pages) {
        pageArr.push(currentPage + 1);
      }
    }

    if (pageArr[pageArr.length - 1] + 1 == pages) {
      pageArr.push(pages);
    } else if (pageArr[pageArr.length - 1] + 1 < pages) {
      pageArr.push("...");
      pageArr.push(pages);
    }
  }

  console.log(117, pageArr);

  for (let i = 0; i < pageArr.length; i++) {
    let aTag = document.createElement("a");

    if (!parseInt(pageArr[i])) {
      if (i == 1) {
        let page = currentPage - 3;
        if (page < 1) {
          page = 1;
        }
        aTag.setAttribute("data-type", page);
      } else {
        let page = currentPage + 3;
        if (page > pages) {
          page = pages;
        }
        aTag.setAttribute("data-type", page);
      }
    } else {
      aTag.setAttribute("data-type", pageArr[i]);
      if (pageArr[i] == currentPage) {
        aTag.setAttribute("class", "active");
      }
    }

    aTag.innerText = pageArr[i];
    document.getElementById("pagingNum").appendChild(aTag);
  }

  const orderParent = document.getElementById("orderParent");
  orderParent.addEventListener("click", function (e) {
    e.preventDefault();
    let order = e.target.dataset.type;
    let url = `./livestreams.html?category=${category}&order=${order}`;
    window.location.href = url;
  });

  const pagingParent = document.getElementById("pagingParent");
  pagingParent.addEventListener("click", function (e) {
    e.preventDefault();
    let paging = e.target.dataset.type;
    if (paging == "last") {
      if (currentPage == 1) {
        paging = 1;
      } else {
        paging = currentPage - 1;
      }
    } else if (paging == "next") {
      if (currentPage == pages) {
        paging = pages;
      } else {
        paging = currentPage + 1;
      }
    }
    let url = `./livestreams.html?category=all&order=${order}&paging=${paging}`;
    console.log(url);

    window.location.href = url;
  });
};
