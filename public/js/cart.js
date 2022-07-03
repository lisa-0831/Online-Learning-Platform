let total_amount = 0;
let order = [];

window.onload = async function () {
  let shoppingList = localStorage.getItem("list");
  let data = JSON.parse(shoppingList);

  let list = [];
  if (data !== null) {
    fetch("/api/1.0/order/list", {
      method: "GET",
      headers: new Headers({
        "content-type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        data: data,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        list = response.data;

        for (let i = 0; i < list.length; i++) {
          let item = document.createElement("div");
          item.setAttribute("class", "item");

          // item_image

          let item_image = document.createElement("img");
          item_image.setAttribute("class", "item__image");
          item_image.setAttribute(
            "src",
            `https://d1wan10jjr4v2x.cloudfront.net/assets/${list[i]["cover"]}`
          );

          item.appendChild(item_image);

          // item_detail

          let item_detail = document.createElement("div");
          item_detail.setAttribute("class", "item__detail");

          let item_name = document.createElement("div");
          item_name.setAttribute("class", "item__name");
          item_name.innerText = list[i]["title"];
          let item_id = document.createElement("div");
          item_id.setAttribute("class", "item__id");
          item_id.innerText = `課程編號：${list[i]["id"]}`;

          item_detail.appendChild(item_name);
          item_detail.appendChild(item_id);

          item.appendChild(item_detail);

          // item_price

          let item_price = document.createElement("div");
          item_price.setAttribute("class", "item__price");

          let mobile_price_text = document.createElement("div");
          mobile_price_text.setAttribute("class", "mobile-text");
          mobile_price_text.innerText = "單價";

          item_price.appendChild(mobile_price_text);

          if (list[i]["student_in_course"] == 0) {
            item_price.innerText = `NT.${list[i]["price"]}`;
            total_amount += list[i]["price"];
            order.push(list[i]["id"]);
          } else {
            item_price.innerText = `已購買過此課程`;
          }

          item.appendChild(item_price);

          // item_remove
          let item_remove = document.createElement("div");
          item_remove.setAttribute("class", "item__remove");

          let remove_pic = document.createElement("img");
          item_remove.setAttribute("src", "/images/cart-remove.png");

          item_remove.appendChild(remove_pic);
          item.appendChild(item_remove);

          // Put them into items
          document.getElementsByClassName("items")[0].appendChild(item);
        }

        document.getElementsByTagName("span")[0].innerHTML = total_amount;
      })
      .catch((error) => console.log("Error:", error));
  }
};

TPDirect.setupSDK(
  12348,
  "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF",
  "sandbox"
);
TPDirect.card.setup({
  fields: {
    number: {
      element: document.querySelector("#card-number"),
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      element: document.getElementById("card-expiration-date"),
      placeholder: "MM / YY",
    },
    ccv: {
      element: document.querySelector("#card-ccv"),
      placeholder: "後三碼",
    },
  },
  styles: {
    input: {
      color: "gray",
    },
    "input.ccv": {
      // 'font-size': '16px'
    },
    ":focus": {
      color: "black",
    },
    ".valid": {
      color: "green",
    },
    ".invalid": {
      color: "red",
    },
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
});
// listen for TapPay Field
TPDirect.card.onUpdate(function (update) {
  /* Disable / enable submit button depend on update.canGetPrime  */
  /* ============================================================ */

  // update.canGetPrime === true
  //     --> you can call TPDirect.card.getPrime()
  // const submitButton = document.querySelector('button[type="submit"]')
  if (update.canGetPrime) {
    // submitButton.removeAttribute('disabled')
    $('button[type="submit"]').removeAttr("disabled");
  } else {
    // submitButton.setAttribute('disabled', true)
    $('button[type="submit"]').attr("disabled", true);
  }

  /* Change card type display when card type change */
  /* ============================================== */

  // cardTypes = ['visa', 'mastercard', ...]
  var newType = update.cardType === "unknown" ? "" : update.cardType;
  $("#cardtype").text(newType);

  /* Change form-group style when tappay field status change */
  /* ======================================================= */

  // number 欄位是錯誤的
  if (update.status.number === 2) {
    setNumberFormGroupToError(".card-number-group");
  } else if (update.status.number === 0) {
    setNumberFormGroupToSuccess(".card-number-group");
  } else {
    setNumberFormGroupToNormal(".card-number-group");
  }

  if (update.status.expiry === 2) {
    setNumberFormGroupToError(".expiration-date-group");
  } else if (update.status.expiry === 0) {
    setNumberFormGroupToSuccess(".expiration-date-group");
  } else {
    setNumberFormGroupToNormal(".expiration-date-group");
  }

  if (update.status.cvc === 2) {
    setNumberFormGroupToError(".cvc-group");
  } else if (update.status.cvc === 0) {
    setNumberFormGroupToSuccess(".cvc-group");
  } else {
    setNumberFormGroupToNormal(".cvc-group");
  }
});

function checkout(event) {
  // check if user login
  let access_token = localStorage.getItem("access_token");
  if (!access_token) {
    window.location.href = "/signin.html";
  }

  // fix keyboard issue in iOS device
  forceBlurIos();

  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  // console.log(tappayStatus);

  // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
  if (!tappayStatus.canGetPrime) {
    alert("can not get prime");
    return;
  }

  // Get prime
  TPDirect.card.getPrime(function (result) {
    if (result.status !== 0) {
      alert("get prime error " + result.msg);
      return;
    }
    // alert("get prime 成功, prime: " + result.card.prime);

    let data = {
      prime: `${result.card.prime}`,
      order: {
        payment: "credit_card",
        total: total_amount,
        list: order,
      },
    };

    console.log(data);

    fetch("/api/1.0/order/checkout", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(data), // must match 'Content-Type' header
      method: "POST", // *GET, POST, PUT, DELETE, etc.
    }).then((response) => {
      if (response.status == 200) {
        localStorage.removeItem("list");
        window.location.href = `/thankyou.html`;
      }
    });
  });
}

function setNumberFormGroupToError(selector) {
  $(selector).addClass("has-error");
  $(selector).removeClass("has-success");
}

function setNumberFormGroupToSuccess(selector) {
  $(selector).removeClass("has-error");
  $(selector).addClass("has-success");
}

function setNumberFormGroupToNormal(selector) {
  $(selector).removeClass("has-error");
  $(selector).removeClass("has-success");
}

function forceBlurIos() {
  if (!isIos()) {
    return;
  }
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  // Insert to active element to ensure scroll lands somewhere relevant
  document.activeElement.prepend(input);
  input.focus();
  input.parentNode.removeChild(input);
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
