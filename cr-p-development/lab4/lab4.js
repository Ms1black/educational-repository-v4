const API_URL = "./api.php";

const authSection = document.getElementById("authSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");
const authMessage = document.getElementById("authMessage");
const currentUserBadge = document.getElementById("currentUserBadge");
const labWorkForm = document.getElementById("labWorkForm");
const labWorksBody = document.getElementById("labWorksBody");
const adminMessage = document.getElementById("adminMessage");

let isAdmin = false;

function setMessage(target, text, type = "") {
  target.textContent = text;
  target.className = "small mt-3 mb-0";
  if (type) {
    target.classList.add(type === "success" ? "message-success" : "message-error");
  }
}

async function request(action, payload = {}, method = "POST") {
  const isGet = method === "GET";
  const url = isGet ? `${API_URL}?action=${encodeURIComponent(action)}` : API_URL;
  const options = {
    method,
    credentials: "same-origin",
  };

  if (!isGet) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify({ action, ...payload });
  }

  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "リクエストエラー。");
  }
  return data;
}

async function requestFormData(formData) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "リクエストエラー。");
  }
  return data;
}

function clearFieldError(input) {
  input.classList.remove("is-invalid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.textContent = "";
  }
}

function setFieldError(input, message) {
  input.classList.add("is-invalid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) {
    feedback.textContent = message;
  }
}

function validateLoginForm() {
  const login = document.getElementById("loginName");
  const password = document.getElementById("loginPassword");
  [login, password].forEach(clearFieldError);

  let valid = true;
  if (login.value.trim().length < 3) {
    setFieldError(login, "ログイン名は3文字以上です。");
    valid = false;
  }
  if (password.value.trim().length < 6) {
    setFieldError(password, "パスワードは6文字以上です。");
    valid = false;
  }
  return valid;
}

function validateRegisterForm() {
  const login = document.getElementById("registerName");
  const password = document.getElementById("registerPassword");
  const confirm = document.getElementById("registerPasswordConfirm");
  [login, password, confirm].forEach(clearFieldError);

  let valid = true;
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(login.value.trim())) {
    setFieldError(login, "ログイン名は3〜20文字（英数字と_）です。");
    valid = false;
  }
  if (password.value.length < 6) {
    setFieldError(password, "パスワードは6文字以上です。");
    valid = false;
  }
  if (confirm.value !== password.value) {
    setFieldError(confirm, "パスワードが一致しません。");
    valid = false;
  }
  return valid;
}

function toggleAuthUI(isAuthorized) {
  const showAdmin = isAuthorized && isAdmin;
  authSection.classList.toggle("d-none", showAdmin);
  adminSection.classList.toggle("d-none", !showAdmin);
}

function updateUserBadge(user) {
  currentUserBadge.textContent = `ユーザー: ${user || "-"}`;
}

function renderLabsTable(labs) {
  if (!Array.isArray(labs) || labs.length === 0) {
    labWorksBody.innerHTML = '<tr><td colspan="7">データなし</td></tr>';
    return;
  }

  labWorksBody.innerHTML = "";
  labs.forEach((lab) => {
    const row = document.createElement("tr");
    const safeUrl = String(lab.url || "").replace(/"/g, "&quot;");
    row.innerHTML = `
      <td>${lab.number}</td>
      <td>${lab.title}</td>
      <td>${lab.theme}</td>
      <td>${lab.year || "-"}</td>
      <td>${safeUrl ? `<a href="${safeUrl}" target="_blank" rel="noopener">${safeUrl}</a>` : "-"}</td>
      <td>${lab.image ? `<img src="${lab.image}" alt="${lab.title}" class="admin-lab-image"><div class="small text-muted">${lab.image}</div>` : "-"}</td>
      <td><button type="button" class="btn btn-sm btn-outline-danger" data-delete-lab-id="${lab.id}">削除</button></td>
    `;
    labWorksBody.appendChild(row);
  });
}

async function loadLabs() {
  if (!isAdmin) {
    adminSection.classList.add("d-none");
    return;
  }
  const data = await request("labs_list", {}, "GET");
  renderLabsTable(data.labs);
}

function validateLabWorkForm() {
  const number = document.getElementById("labWorkNumber");
  const title = document.getElementById("labWorkTitle");
  const theme = document.getElementById("labWorkTheme");
  const year = document.getElementById("labWorkYear");
  const url = document.getElementById("labWorkUrl");
  const imageFile = document.getElementById("labWorkImageFile");
  [number, title, theme, year, url, imageFile].forEach(clearFieldError);

  let valid = true;
  const numberValue = Number(number.value);
  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 30) {
    setFieldError(number, "番号は1〜30の整数です。");
    valid = false;
  }
  if (title.value.trim().length < 3 || title.value.trim().length > 80) {
    setFieldError(title, "名称は3〜80文字です。");
    valid = false;
  }
  if (theme.value.trim().length < 3 || theme.value.trim().length > 120) {
    setFieldError(theme, "テーマは3〜120文字です。");
    valid = false;
  }
  if (!/^\d{4}(?:-\d{4})?$/.test(year.value.trim())) {
    setFieldError(year, "年度の形式は 2026 または 2025-2026。");
    valid = false;
  }
  if (url.value.trim() && !/^[a-zA-Z0-9_./-]+$/.test(url.value.trim())) {
    setFieldError(url, "リンクに使用できるのは英数字と _ . / - です。");
    valid = false;
  }
  const file = imageFile.files && imageFile.files[0];
  if (!file) {
    setFieldError(imageFile, "画像ファイルを選択してください。");
    valid = false;
  } else {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setFieldError(imageFile, "対応形式: PNG/JPG/WEBP/GIF。");
      valid = false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldError(imageFile, "最大サイズは5MBです。");
      valid = false;
    }
  }

  if (url.value.trim() && !/^[a-zA-Z0-9_./#-]+$/.test(url.value.trim())) {
    setFieldError(url, "リンクに使用できるのは英数字と _ . / - # です。");
    valid = false;
  }

  return valid;
}

async function checkSession() {
  try {
    const data = await request("status", {}, "GET");
    isAdmin = Boolean(data.isAdmin);
    toggleAuthUI(Boolean(data.user));
    updateUserBadge(data.user || null);
    if (data.user && isAdmin) {
      await loadLabs();
    } else if (data.user && !isAdmin) {
      setMessage(authMessage, "一般ユーザーでログインしています。管理画面にはadmin権限が必要です。", "error");
    }
  } catch (error) {
    isAdmin = false;
    toggleAuthUI(false);
    updateUserBadge(null);
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(authMessage, "");

  if (!validateLoginForm()) {
    return;
  }

  try {
    const login = document.getElementById("loginName").value.trim();
    const password = document.getElementById("loginPassword").value;
    const data = await request("login", { login, password });
    isAdmin = Boolean(data.isAdmin);
    updateUserBadge(data.user || null);
    toggleAuthUI(true);
    if (isAdmin) {
      setMessage(adminMessage, "ログインに成功しました。", "success");
      await loadLabs();
    } else {
      setMessage(authMessage, "ログインしましたが、このアカウントには管理者権限がありません。", "error");
    }
  } catch (error) {
    setMessage(authMessage, error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(authMessage, "");

  if (!validateRegisterForm()) {
    return;
  }

  try {
    const login = document.getElementById("registerName").value.trim();
    const password = document.getElementById("registerPassword").value;
    await request("register", { login, password });
    registerForm.reset();
    setMessage(authMessage, "登録が完了しました。ログインしてください。", "success");
  } catch (error) {
    setMessage(authMessage, error.message, "error");
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await request("logout");
    isAdmin = false;
    toggleAuthUI(false);
    updateUserBadge(null);
    setMessage(authMessage, "ログアウトしました。", "success");
  } catch (error) {
    setMessage(adminMessage, error.message, "error");
  }
});

labWorkForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(adminMessage, "");

  if (!validateLabWorkForm()) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append("action", "labs_add");
    formData.append("number", document.getElementById("labWorkNumber").value);
    formData.append("title", document.getElementById("labWorkTitle").value.trim());
    formData.append("theme", document.getElementById("labWorkTheme").value.trim());
    formData.append("year", document.getElementById("labWorkYear").value.trim());
    formData.append("url", document.getElementById("labWorkUrl").value.trim());
    formData.append("imageFile", document.getElementById("labWorkImageFile").files[0]);

    const data = await requestFormData(formData);
    renderLabsTable(data.labs);
    labWorkForm.reset();
    setMessage(adminMessage, "研究室を追加しました。画像は img/ に保存されました。", "success");
  } catch (error) {
    setMessage(adminMessage, error.message, "error");
  }
});

labWorksBody.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-lab-id]");
  if (!button) {
    return;
  }

  const id = Number(button.getAttribute("data-delete-lab-id"));
  if (!Number.isInteger(id) || id < 1) {
    return;
  }

  const ok = window.confirm("この研究室を一覧から削除しますか？");
  if (!ok) {
    return;
  }

  try {
    const data = await request("labs_delete", { id });
    renderLabsTable(data.labs);
    setMessage(adminMessage, "研究室を削除しました。", "success");
  } catch (error) {
    setMessage(adminMessage, error.message, "error");
  }
});

checkSession();
