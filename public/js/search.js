pageSize = 12;
// pages = 1;
// currentPage = 1;

window.onload = async function () {
  showCartNum();

  let params = new URL(document.location).searchParams;
  if (params.get("keyword") !== null) {
    keyword = params.get("keyword");
  }

  let url = `/api/1.0/courses/search?keyword=${keyword}`;

  //   paging = params.get("paging");
  //   if (paging !== null) {
  //     url += `&paging=${paging - 1}`;
  //   }

  const coursesAllRes = await fetch(url);
  const coursesAllObj = await coursesAllRes.json();

  const coursesArr = coursesAllObj.courses;
  const livestreamsArr = coursesAllObj.livestreams;
  //   const courseNum = coursesAllObj.courseNum[0]["COUNT(*)"];

  // Title
  document.getElementById("search-result-title").innerHTML = `${keyword} 共有
  <p class="search-result-title-hightlight">${
    coursesArr.length + livestreamsArr.length
  }</p>
  筆結果`;

  document.getElementById("search-category-courses").innerHTML = `和
  <p class="search-category-title-hightlight">${keyword}</p>
  相關的 影音課程 (${coursesArr.length})`;

  document.getElementById("search-category-livestreams").innerHTML = `和
  <p class="search-category-title-hightlight">${keyword}</p>
  相關的 直播 (${livestreamsArr.length})`;

  // Courses

  if (coursesArr.length == 0) {
    document.getElementById(
      "courses"
    ).innerHTML = `<a href="./courses.html" class="course-redirect"> 哎呀！沒有相關的結果，前往逛逛其他課程 >> </a>`;
  } else {
    for (let i = 0; i < coursesArr.length; i++) {
      // Course Div
      let course = document.createElement("figure");
      course.setAttribute("class", "course");

      // Course a Tag
      let courseTag = document.createElement("a");
      courseTag.setAttribute("class", "course-detail");
      courseTag.setAttribute("href", `/course.html?id=${coursesArr[i].id}`);

      // Course Cover
      let imgDiv = document.createElement("div");
      imgDiv.setAttribute("class", "course-image");

      let courseImg = document.createElement("img");
      courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${coursesArr[i]["cover"]}`;
      // courseImg.width = "300";
      // courseImg.height = "186";
      imgDiv.appendChild(courseImg);
      courseTag.appendChild(imgDiv);

      // Course Figcaption
      let figcaption = document.createElement("figcaption");

      // Course Title
      let courseTitle = document.createElement("h3");
      // courseTitle.setAttribute("class", "course-title");
      courseTitle.innerText = coursesArr[i]["title"];
      figcaption.appendChild(courseTitle);

      // Course Students Num
      let courseTeacher = document.createElement("h4");
      // courseStudent.setAttribute("class", "course-student");
      courseTeacher.innerText = `授課老師 ${coursesArr[i]["name"]}`;
      figcaption.appendChild(courseTeacher);

      // Course Students Num
      let courseStudent = document.createElement("h4");
      // courseStudent.setAttribute("class", "course-student");
      courseStudent.innerText = `學生 ${coursesArr[i]["students_num"]} 人`;
      figcaption.appendChild(courseStudent);

      // Course Price
      let coursePrice = document.createElement("p");
      // coursePrice.setAttribute("class", "course-price");
      coursePrice.innerText = `NT$ ${coursesArr[i]["price"]}`;
      figcaption.appendChild(coursePrice);

      courseTag.appendChild(figcaption);
      course.appendChild(courseTag);
      document.getElementById("courses").appendChild(course);
    }
  }

  // LiveStreams

  // Timestamp To Date
  const timestamp2Date = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  if (livestreamsArr.length == 0) {
    document.getElementById(
      "livestreams"
    ).innerHTML = `<a href="./livestreams.html" class="course-redirect"> 哎呀！沒有相關的結果，前往逛逛其他直播 >> </a>`;
  } else {
    for (let i = 0; i < livestreamsArr.length; i++) {
      // Course Div
      let course = document.createElement("figure");
      course.setAttribute("class", "course");

      // Course a Tag
      let courseTag = document.createElement("a");
      courseTag.setAttribute("class", "course-detail");
      courseTag.setAttribute(
        "href",
        `/livestream.html?id=${livestreamsArr[i].id}`
      );

      // Course Cover
      let imgDiv = document.createElement("div");
      imgDiv.setAttribute("class", "course-image");

      let courseImg = document.createElement("img");
      courseImg.src = `https://d1wan10jjr4v2x.cloudfront.net/assets/${livestreamsArr[i]["cover"]}`;
      imgDiv.appendChild(courseImg);
      courseTag.appendChild(imgDiv);

      // Course Figcaption
      let figcaption = document.createElement("figcaption");

      // Course Title
      let courseTitle = document.createElement("h3");
      courseTitle.innerText = livestreamsArr[i]["title"];
      figcaption.appendChild(courseTitle);

      // Course Teacher
      let courseTeacher = document.createElement("h4");
      courseTeacher.innerText = `直播講師 ${livestreamsArr[i]["name"]}`;
      figcaption.appendChild(courseTeacher);

      // Course Students Num
      let courseStudent = document.createElement("h4");
      courseStudent.innerText = `預約人數 ${livestreamsArr[i]["students_num"]} 人`;
      figcaption.appendChild(courseStudent);

      // Course Time
      let courseTime = document.createElement("p");
      courseTime.innerText = `直播時間 ${timestamp2Date(
        livestreamsArr[i]["start_time"]
      )}`;
      figcaption.appendChild(courseTime);

      courseTag.appendChild(figcaption);
      course.appendChild(courseTag);
      document.getElementById("livestreams").appendChild(course);
    }
  }

  // Paging
  //   pages = Math.ceil(courseNum / pageSize);
  //   currentPage = parseInt(paging) || 1;

  //   const pageArr = [];
  //   if (pages <= 4 || (currentPage - 3 < 1 && currentPage + 3 > pages)) {
  //     for (let i = 1; i <= pages; i++) {
  //       pageArr.push(i);
  //     }
  //   } else {
  //     if (currentPage - 3 < 1) {
  //       pageArr = [1, 2, 3];
  //     } else {
  //       pageArr = [1, "...", currentPage - 1, currentPage];
  //       if (currentPage !== pages) {
  //         pageArr.push(currentPage + 1);
  //       }
  //     }

  //     if (pageArr[pageArr.length - 1] + 1 == pages) {
  //       pageArr.push(pages);
  //     } else if (pageArr[pageArr.length - 1] + 1 < pages) {
  //       pageArr.push("...");
  //       pageArr.push(pages);
  //     }
  //   }

  //   for (let i = 0; i < pageArr.length; i++) {
  //     let aTag = document.createElement("a");

  //     if (!parseInt(pageArr[i])) {
  //       if (i == 1) {
  //         let page = currentPage - 3;
  //         if (page < 1) {
  //           page = 1;
  //         }
  //         aTag.setAttribute("data-type", page);
  //       } else {
  //         let page = currentPage + 3;
  //         if (page > pages) {
  //           page = pages;
  //         }
  //         aTag.setAttribute("data-type", page);
  //       }
  //     } else {
  //       aTag.setAttribute("data-type", pageArr[i]);
  //       if (pageArr[i] == currentPage) {
  //         aTag.setAttribute("class", "active");
  //       }
  //     }

  //     aTag.innerText = pageArr[i];
  //     document.getElementById("pagingNum").appendChild(aTag);
  //   }

  //   const pagingParent = document.getElementById("pagingParent");
  //   pagingParent.addEventListener("click", function (e) {
  //     e.preventDefault();
  //     let paging = e.target.dataset.type;
  //     if (paging == "last") {
  //       if (currentPage == 1) {
  //         paging = 1;
  //       } else {
  //         paging = currentPage - 1;
  //       }
  //     } else if (paging == "next") {
  //       if (currentPage == pages) {
  //         paging = pages;
  //       } else {
  //         paging = currentPage + 1;
  //       }
  //     }
  //     let url = "";
  //     if (!hashtag) {
  //       url = `./courses.html?category=${category}&order=${order}&paging=${paging}`;
  //     } else {
  //       url = `./courses.html?category=all&order=${order}&hashtag=${hashtag}&paging=${paging}`;
  //     }
  //     console.log(url);

  //     window.location.href = url;
  //   });
};
