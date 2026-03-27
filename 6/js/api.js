function showToast(message, type) {
  let container = document.getElementById("toast-container");
  let toast = document.createElement("div");
  toast.className = "toast " + (type || "info");
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 3500);
}

function setStatus(id, html) {
  let el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function showLoading(id) {
  setStatus(id, '<span class="spinner"></span> Загрузка...');
}

function showSkeletons(containerId) {
  let el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    let sk = document.createElement("div");
    sk.className = "skeleton-card";
    el.appendChild(sk);
  }
}

function showPlaceholder(containerId, text, isError) {
  let el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="placeholder-msg ' + (isError ? "error" : "") + '">' + text + '</div>';
}

// ПОСТЫ - JSONPlaceholder

let POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

function loadPosts() {
  showSkeletons("posts-list");

  fetch(POSTS_URL + "?_limit=12")
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        return res.json();
      })
      .then(function (posts) {
        renderPosts(posts);
      })
      .catch(function (err) {
        showPlaceholder("posts-list", "Не удалось загрузить посты: " + err.message, true);
      });
}

function renderPosts(posts) {
  let container = document.getElementById("posts-list");
  container.innerHTML = "";

  if (posts.length === 0) {
    showPlaceholder("posts-list", "Постов пока нет.");
    return;
  }

  posts.forEach(function (post) {
    let card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML =
        '<span class="card-id">#' + post.id + '</span>' +
        '<div class="card-title">' + escapeHtml(post.title) + '</div>' +
        '<div class="card-body">' + escapeHtml(post.body).substring(0, 120) + '...</div>' +
        '<div class="card-actions">' +
        '<button class="btn-edit" onclick="editPost(' + post.id + ', this)">Изменить <span class="method-tag put">PUT</span></button>' +
        '<button class="btn-delete" onclick="deletePost(' + post.id + ', this)">Удалить <span class="method-tag delete">DEL</span></button>' +
        '</div>';
    container.appendChild(card);
  });
}

function createPost(event) {
  event.preventDefault();
  let titleInput = document.getElementById("post-title");
  let bodyInput = document.getElementById("post-body");
  let title = titleInput.value.trim();
  let body = bodyInput.value.trim();

  if (!title || !body) {
    setStatus("post-form-status", '<span style="color:let(--red)">Заполните все поля.</span>');
    return;
  }

  showLoading("post-form-status");
  event.target.querySelector("button").disabled = true;

  fetch(POSTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, body: body, userId: 1 })
  })
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        return res.json();
      })
      .then(function (data) {
        setStatus("post-form-status", '<span style="color:let(--green)">✓ Пост #' + data.id + ' создан!</span>');
        showToast("Пост создан (POST → 201)", "success");
        titleInput.value = "";
        bodyInput.value = "";
      })
      .catch(function (err) {
        setStatus("post-form-status", '<span style="color:let(--red)">Ошибка: ' + err.message + '</span>');
        showToast("Ошибка создания поста", "error");
      })
      .finally(function () {
        event.target.querySelector("button").disabled = false;
      });
}

function editPost(id) {
  openModal("Редактировать пост #" + id, [
    { name: "title", label: "Заголовок", type: "text", value: "" },
    { name: "body", label: "Текст", type: "textarea", value: "" }
  ], function (data) {
    showLoading("edit-form-status");

    fetch(POSTS_URL + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, title: data.title, body: data.body, userId: 1 })
    })
        .then(function (res) {
          if (!res.ok) throw new Error("Ошибка " + res.status);
          return res.json();
        })
        .then(function (result) {
          setStatus("edit-form-status", '<span style="color:let(--green)">✓ Пост обновлён!</span>');
          showToast("Пост #" + id + " обновлён (PUT → 200)", "success");
          setTimeout(closeModal, 1000);
        })
        .catch(function (err) {
          setStatus("edit-form-status", '<span style="color:let(--red)">Ошибка: ' + err.message + '</span>');
          showToast("Ошибка обновления", "error");
        });
  });
}

function deletePost(id, btn) {
  if (!confirm("Удалить пост #" + id + "?")) return;
  btn.disabled = true;
  btn.textContent = "Удаление...";

  fetch(POSTS_URL + "/" + id, { method: "DELETE" })
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        let card = btn.closest(".item-card");
        card.style.opacity = "0.3";
        showToast("Пост #" + id + " удалён (DELETE → 200)", "success");
      })
      .catch(function (err) {
        showToast("Ошибка удаления: " + err.message, "error");
        btn.disabled = false;
        btn.textContent = "Удалить";
      });
}
// ПОЛЬЗОВАТЕЛИ - ReqRes
let USERS_URL = "https://dummyjson.com/users";

function loadUsers() {
  showSkeletons("users-list");

  fetch(USERS_URL + "?limit=12")
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        return res.json();
      })
      .then(function (json) {
        renderUsers(json.users);
      })
      .catch(function (err) {
        showPlaceholder("users-list", "Не удалось загрузить пользователей: " + err.message, true);
      });
}

function renderUsers(users) {
  let container = document.getElementById("users-list");
  container.innerHTML = "";

  if (!users || users.length === 0) {
    showPlaceholder("users-list", "Пользователей пока нет.");
    return;
  }

  users.forEach(function (user) {
    let card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML =
        '<div class="card-top">' +
        '<img class="card-avatar" src="' + user.image + '" alt="' + escapeHtml(user.firstName) + '">' +
        '<div class="card-info">' +
        '<span class="card-id">#' + user.id + '</span>' +
        '<div class="card-title">' + escapeHtml(user.firstName) + ' ' + escapeHtml(user.lastName) + '</div>' +
        '<div class="card-body">' + escapeHtml(user.email) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="card-actions">' +
        '<button class="btn-edit" onclick="editUser(' + user.id + ')">Изменить <span class="method-tag put">PATCH</span></button>' +
        '<button class="btn-delete" onclick="deleteUser(' + user.id + ', this)">Удалить <span class="method-tag delete">DEL</span></button>' +
        '</div>';
    container.appendChild(card);
  });
}

function createUser(event) {
  event.preventDefault();
  let nameInput = document.getElementById("user-name");
  let jobInput = document.getElementById("user-job");
  let name = nameInput.value.trim();
  let job = jobInput.value.trim();

  if (!name || !job) {
    setStatus("user-form-status", '<span style="color:let(--red)">Заполните все поля.</span>');
    return;
  }

  showLoading("user-form-status");
  event.target.querySelector("button").disabled = true;

  fetch(USERS_URL + "/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: name, company: { title: job } })
  })
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        return res.json();
      })
      .then(function (data) {
        setStatus("user-form-status", '<span style="color:let(--green)">✓ Пользователь #' + data.id + ' создан!</span>');
        showToast("Пользователь создан (POST → 201)", "success");
        nameInput.value = "";
        jobInput.value = "";
      })
      .catch(function (err) {
        setStatus("user-form-status", '<span style="color:let(--red)">Ошибка: ' + err.message + '</span>');
        showToast("Ошибка создания пользователя", "error");
      })
      .finally(function () {
        event.target.querySelector("button").disabled = false;
      });
}

function editUser(id) {
  openModal("Редактировать пользователя #" + id, [
    { name: "firstName", label: "Имя", type: "text", value: "" },
    { name: "lastName", label: "Фамилия", type: "text", value: "" }
  ], function (data) {
    showLoading("edit-form-status");

    fetch(USERS_URL + "/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: data.firstName, lastName: data.lastName })
    })
        .then(function (res) {
          if (!res.ok) throw new Error("Ошибка " + res.status);
          return res.json();
        })
        .then(function (result) {
          setStatus("edit-form-status", '<span style="color:let(--green)">✓ Обновлено!</span>');
          showToast("Пользователь #" + id + " обновлён (PATCH → 200)", "success");
          setTimeout(closeModal, 1000);
        })
        .catch(function (err) {
          setStatus("edit-form-status", '<span style="color:let(--red)">Ошибка: ' + err.message + '</span>');
        });
  });
}

function deleteUser(id, btn) {
  if (!confirm("Удалить пользователя #" + id + "?")) return;
  btn.disabled = true;
  btn.textContent = "Удаление...";

  fetch(USERS_URL + "/" + id, { method: "DELETE" })
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        let card = btn.closest(".item-card");
        card.style.opacity = "0.3";
        showToast("Пользователь #" + id + " удалён (DELETE → 200)", "success");
      })
      .catch(function (err) {
        showToast("Ошибка: " + err.message, "error");
        btn.disabled = false;
        btn.textContent = "Удалить";
      });
}
// ТОВАРЫ - DummyJSON
let PRODUCTS_URL = "https://dummyjson.com/products";

function loadProducts() {
  showSkeletons("products-list");

  fetch(PRODUCTS_URL + "?limit=12")
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        return res.json();
      })
      .then(function (json) {
        renderProducts(json.products);
      })
      .catch(function (err) {
        showPlaceholder("products-list", "Не удалось загрузить товары: " + err.message, true);
      });
}

function renderProducts(products) {
  let container = document.getElementById("products-list");
  container.innerHTML = "";

  if (!products || products.length === 0) {
    showPlaceholder("products-list", "Товаров пока нет.");
    return;
  }

  products.forEach(function (p) {
    let card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML =
        '<div class="card-top">' +
        '<img class="card-thumb" src="' + p.thumbnail + '" alt="' + escapeHtml(p.title) + '">' +
        '<div class="card-info">' +
        '<span class="card-id">#' + p.id + ' · ' + escapeHtml(p.category) + '</span>' +
        '<div class="card-title">' + escapeHtml(p.title) + '</div>' +
        '<div class="card-price">$' + p.price + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="card-body">' + escapeHtml(p.description).substring(0, 100) + '</div>' +
        '<div class="card-actions">' +
        '<button class="btn-edit" onclick="editProduct(' + p.id + ')">Изменить <span class="method-tag put">PUT</span></button>' +
        '<button class="btn-delete" onclick="deleteProduct(' + p.id + ', this)">Удалить <span class="method-tag delete">DEL</span></button>' +
        '</div>';
    container.appendChild(card);
  });
}

function createProduct(event) {
  event.preventDefault();
  let titleInput = document.getElementById("product-title");
  let priceInput = document.getElementById("product-price");
  let title = titleInput.value.trim();
  let price = parseFloat(priceInput.value);

  if (!title || isNaN(price) || price <= 0) {
    setStatus("product-form-status", '<span style="color:let(--red)">Заполните все поля корректно.</span>');
    return;
  }

  showLoading("product-form-status");
  event.target.querySelector("button").disabled = true;

  fetch(PRODUCTS_URL + "/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, price: price })
  })
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        return res.json();
      })
      .then(function (data) {
        setStatus("product-form-status", '<span style="color:let(--green)">✓ Товар #' + data.id + ' добавлен!</span>');
        showToast("Товар создан (POST → 201)", "success");
        titleInput.value = "";
        priceInput.value = "";
      })
      .catch(function (err) {
        setStatus("product-form-status", '<span style="color:let(--red)">Ошибка: ' + err.message + '</span>');
        showToast("Ошибка добавления товара", "error");
      })
      .finally(function () {
        event.target.querySelector("button").disabled = false;
      });
}

function editProduct(id) {
  openModal("Редактировать товар #" + id, [
    { name: "title", label: "Название", type: "text", value: "" },
    { name: "price", label: "Цена", type: "number", value: "" }
  ], function (data) {
    showLoading("edit-form-status");

    fetch(PRODUCTS_URL + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: data.title, price: parseFloat(data.price) })
    })
        .then(function (res) {
          if (!res.ok) throw new Error("Ошибка " + res.status);
          return res.json();
        })
        .then(function (result) {
          setStatus("edit-form-status", '<span style="color:let(--green)">✓ Товар обновлён!</span>');
          showToast("Товар #" + id + " обновлён (PUT → 200)", "success");
          setTimeout(closeModal, 1000);
        })
        .catch(function (err) {
          setStatus("edit-form-status", '<span style="color:let(--red)">Ошибка: ' + err.message + '</span>');
        });
  });
}

function deleteProduct(id, btn) {
  if (!confirm("Удалить товар #" + id + "?")) return;
  btn.disabled = true;
  btn.textContent = "Удаление...";

  fetch(PRODUCTS_URL + "/" + id, { method: "DELETE" })
      .then(function (res) {
        if (!res.ok) throw new Error("Ошибка " + res.status);
        let card = btn.closest(".item-card");
        card.style.opacity = "0.3";
        showToast("Товар #" + id + " удалён (DELETE → 200)", "success");
      })
      .catch(function (err) {
        showToast("Ошибка: " + err.message, "error");
        btn.disabled = false;
        btn.textContent = "Удалить";
      });
}
// МОДАЛКА РЕДАКТИРОВАНИЯ
let currentEditCallback = null;

function openModal(title, fields, onSave) {
  document.getElementById("modal-title").textContent = title;
  let container = document.getElementById("edit-fields");
  container.innerHTML = "";
  setStatus("edit-form-status", "");

  fields.forEach(function (f) {
    let label = document.createElement("label");
    label.textContent = f.label;
    label.style.fontSize = "0.85em";
    label.style.color = "let(--text-muted)";
    container.appendChild(label);

    let input;
    if (f.type === "textarea") {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = f.type || "text";
    }
    input.name = f.name;
    input.placeholder = f.label;
    input.value = f.value || "";
    input.required = true;
    container.appendChild(input);
  });

  currentEditCallback = onSave;
  document.getElementById("edit-modal").classList.add("open");
}

function closeModal() {
  document.getElementById("edit-modal").classList.remove("open");
  currentEditCallback = null;
  setStatus("edit-form-status", "");
}
// НАВИГАЦИЯ
function switchSection(sectionId) {
  document.querySelectorAll(".api-section").forEach(function (s) {
    s.classList.remove("active");
  });
  document.querySelectorAll(".nav-link").forEach(function (l) {
    l.classList.remove("active");
  });

  let section = document.getElementById(sectionId);
  if (section) section.classList.add("active");

  let link = document.querySelector('[data-section="' + sectionId + '"]');
  if (link) link.classList.add("active");
}
// УТИЛИТЫ
function escapeHtml(text) {
  if (!text) return "";
  let div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
// ИНИЦИАЛИЗАЦИЯ
document.addEventListener("DOMContentLoaded", function () {
  // навигация
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      let section = this.getAttribute("data-section");
      switchSection(section);
    });
  });

  // формы
  document.getElementById("post-form").addEventListener("submit", createPost);
  document.getElementById("user-form").addEventListener("submit", createUser);
  document.getElementById("product-form").addEventListener("submit", createProduct);

  // модалка
  document.getElementById("edit-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!currentEditCallback) return;
    let inputs = document.querySelectorAll("#edit-fields input, #edit-fields textarea");
    let data = {};
    inputs.forEach(function (inp) { data[inp.name] = inp.value.trim(); });

    // валидация
    let empty = false;
    inputs.forEach(function (inp) {
      if (!inp.value.trim()) empty = true;
    });
    if (empty) {
      setStatus("edit-form-status", '<span style="color:let(--red)">Заполните все поля.</span>');
      return;
    }

    currentEditCallback(data);
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("edit-modal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });

  // загрузка данных
  loadPosts();
  loadUsers();
  loadProducts();
});