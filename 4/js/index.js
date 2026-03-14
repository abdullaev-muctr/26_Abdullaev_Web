let defaultReviews = [
  {
    name: "Ковбой Алексей",
    text: "Начал курить Marlboro — жена ушла, кот сбежал, на работе повысили. Совпадение? Не думаю. 10/10.",
    image: "img/seventy-twos.jpg",
    stars: 5,
    date: "2026-01-15"
  },
  {
    name: "Дмитрий «Дым» Петров",
    text: "Раньше я был обычным офисным работником. Теперь я обычный офисный работник с Marlboro. Чувствую разницу.",
    image: "img/naked-girl.jpg",
    stars: 5,
    date: "2026-02-03"
  },
  {
    name: "Артём, коллекционер",
    text: "Купил пачку ради эстетики. Поставил на полку. Любуюсь. Курить не начал, но пачку обожаю.",
    image: "img/marlboro-aesthetic.jpg",
    stars: 4,
    date: "2026-02-20"
  },
  {
    name: "Марина К.",
    text: "Подарила мужу блок на 23 февраля. Он сказал это лучший подарок в его жизни. Даже лучше носков.",
    image: "",
    stars: 5,
    date: "2026-02-23"
  }
];

let reviews = [];

function loadReviews() {
  let saved = loadJSON("marlboro_reviews");
  if (saved !== null && Array.isArray(saved) && saved.length > 0) {
    reviews = saved;
  } else {
    reviews = defaultReviews.slice();
  }
}

function saveReviews() {
  saveJSON("marlboro_reviews", reviews, 90);
}

function initTheme() {
  let saved = getCookie("marlboro_theme");
  if (saved === "light") {
    document.body.classList.add("light-theme");
  }
  updateThemeButton();
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
  let isLight = document.body.classList.contains("light-theme");
  setCookie("marlboro_theme", isLight ? "light" : "dark", 365);
  updateThemeButton();
}

function updateThemeButton() {
  let btn = document.getElementById("theme-toggle");
  if (!btn) return;

  let isLight = document.body.classList.contains("light-theme");
  btn.textContent = isLight ? "☾ Тёмная" : "☀ Светлая";
}

function renderReviews() {
  let container = document.getElementById("reviews-list");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < reviews.length; i++) {
    let r = reviews[i];

    let card = document.createElement("article");
    card.className = "review-card";

    if (r.image) {
      let img = document.createElement("img");
      img.src = r.image;
      img.alt = "Фото к отзыву от " + r.name;
      card.appendChild(img);
    }

    let starsCount = r.stars || 5;
    let starStr = "";

    for (let s = 0; s < 5; s++) {
      starStr += s < starsCount ? "★" : "☆";
    }

    let starsEl = document.createElement("div");
    starsEl.className = "stars";
    starsEl.textContent = starStr;
    card.appendChild(starsEl);

    let text = document.createElement("p");
    text.className = "text";
    text.textContent = "«" + r.text + "»";
    card.appendChild(text);

    let author = document.createElement("p");
    author.className = "author";
    author.textContent = "— " + r.name + (r.date ? " · " + r.date : "");
    card.appendChild(author);

    container.appendChild(card);
  }
}

function handleReviewSubmit(event) {
  event.preventDefault();

  let nameInput = document.getElementById("review-name");
  let textInput = document.getElementById("review-text");
  let imageInput = document.getElementById("review-image");
  let errorDiv = document.getElementById("review-error");

  errorDiv.textContent = "";
  errorDiv.style.display = "none";
  errorDiv.style.color = "";

  nameInput.classList.remove("input-error");
  textInput.classList.remove("input-error");

  let errors = [];
  let nameVal = nameInput.value.trim();
  let textVal = textInput.value.trim();

  if (nameVal === "") {
    errors.push("Введите имя.");
    nameInput.classList.add("input-error");
  } else if (nameVal.length < 2) {
    errors.push("Имя — минимум 2 символа.");
    nameInput.classList.add("input-error");
  } else if (nameVal.length > 50) {
    errors.push("Имя — максимум 50 символов.");
    nameInput.classList.add("input-error");
  }

  if (textVal === "") {
    errors.push("Введите текст отзыва.");
    textInput.classList.add("input-error");
  } else if (textVal.length < 10) {
    errors.push("Отзыв — минимум 10 символов.");
    textInput.classList.add("input-error");
  } else if (textVal.length > 500) {
    errors.push("Отзыв — максимум 500 символов.");
    textInput.classList.add("input-error");
  }

  if (errors.length > 0) {
    errorDiv.textContent = errors.join(" ");
    errorDiv.style.display = "block";
    return;
  }

  if (imageInput && imageInput.files && imageInput.files[0]) {
    let file = imageInput.files[0];

    let allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (allowed.indexOf(file.type) === -1) {
      errorDiv.textContent = "Допустимые форматы: JPG, PNG, GIF, WEBP.";
      errorDiv.style.display = "block";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      errorDiv.textContent = "Макс. размер изображения — 2 МБ.";
      errorDiv.style.display = "block";
      return;
    }

    let reader = new FileReader();

    reader.onload = function (e) {
      addReview(nameVal, textVal, e.target.result);
    };

    reader.readAsDataURL(file);
    return;
  }

  addReview(nameVal, textVal, "");
}

function addReview(name, text, image) {
  let today = new Date();

  let dateStr =
      today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");

  reviews.unshift({
    name: name,
    text: text,
    image: image,
    stars: 5,
    date: dateStr
  });

  saveReviews();
  renderReviews();

  document.getElementById("review-name").value = "";
  document.getElementById("review-text").value = "";

  let imageInput = document.getElementById("review-image");
  if (imageInput) imageInput.value = "";

  let errorDiv = document.getElementById("review-error");
  errorDiv.textContent = "✓ Отзыв добавлен!";
  errorDiv.style.display = "block";
  errorDiv.style.color = "#27ae60";

  setTimeout(function () {
    errorDiv.style.display = "none";
    errorDiv.style.color = "";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  loadReviews();
  renderReviews();

  let form = document.getElementById("review-form");
  if (form) form.addEventListener("submit", handleReviewSubmit);

  let themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});