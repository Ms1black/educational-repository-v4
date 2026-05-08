const API_URL = "./api";

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
const langToggleBtn = document.getElementById("langToggleBtn");

let isAdmin = false;
let currentLang = "ja";
let cachedUserForBadge = null;
let cachedLabs = [];

const I18N = {
  ja: {
    langBtn: "RU",
    loginTitle: "ログイン",
    registerTitle: "新規登録",
    loginNameLabel: "ログイン名",
    passwordLabel: "パスワード",
    passwordConfirmLabel: "パスワード確認",
    loginSubmit: "ログイン",
    registerSubmit: "登録する",
    adminListTitle: "研究室リスト管理",
    userBadgePrefix: "ユーザー",
    logoutBtn: "ログアウト",
    addLabTitle: "研究室を追加",
    labNumberLabel: "番号",
    labNameLabel: "名称",
    labThemeLabel: "テーマ",
    labYearLabel: "年度",
    labLinkLabel: "リンク",
    labImageLabel: "画像（img/ に保存）",
    labAddSubmit: "追加する",
    labYearPlaceholder: "2025-2026",
    labUrlPlaceholder: "humanoid",
    tableThNum: "#",
    tableThName: "名称",
    tableThTheme: "テーマ",
    tableThYear: "年度",
    tableThLink: "リンク",
    tableThImage: "画像",
    tableThActions: "操作",
    labNoData: "データなし",
    labDelete: "削除",
    valLoginNameMin: "ログイン名は3文字以上です。",
    valPasswordMin: "パスワードは6文字以上です。",
    valRegisterLogin: "ログイン名は3〜20文字（英数字と_）です。",
    valPasswordMismatch: "パスワードが一致しません。",
    valLabNumber: "番号は1〜30の整数です。",
    valLabTitle: "名称は3〜80文字です。",
    valLabTheme: "テーマは3〜120文字です。",
    valLabYear: "年度の形式は 2026 または 2025-2026。",
    valLabUrl: "リンクに使用できるのは英数字と _ . / - です。",
    valLabUrlHash: "リンクに使用できるのは英数字と _ . / - # です。",
    valLabImagePick: "画像ファイルを選択してください。",
    valLabImageType: "対応形式: PNG/JPG/WEBP/GIF。",
    valLabImageSize: "最大サイズは5MBです。",
    msgRequestError: "リクエストエラー。",
    msgRegisterOk: "登録が完了しました。ログインしてください。",
    msgLoginOk: "ログインに成功しました。",
    msgLoginNotAdmin: "ログインしましたが、このアカウントには管理者権限がありません。",
    msgLogoutOk: "ログアウトしました。",
    msgSessionNotAdmin: "一般ユーザーでログインしています。管理画面にはadmin権限が必要です。",
    msgLabAdded: "研究室を追加しました。画像は img/ に保存されました。",
    msgLabDeleted: "研究室を削除しました。",
    labDeleteConfirm: "この研究室を一覧から削除しますか？",
  },
  ru: {
    langBtn: "JA",
    loginTitle: "Вход",
    registerTitle: "Регистрация",
    loginNameLabel: "Логин",
    passwordLabel: "Пароль",
    passwordConfirmLabel: "Повтор пароля",
    loginSubmit: "Войти",
    registerSubmit: "Зарегистрироваться",
    adminListTitle: "Управление списком лабораторий",
    userBadgePrefix: "Пользователь",
    logoutBtn: "Выйти",
    addLabTitle: "Добавить лабораторную",
    labNumberLabel: "Номер",
    labNameLabel: "Название",
    labThemeLabel: "Тема",
    labYearLabel: "Год",
    labLinkLabel: "Ссылка",
    labImageLabel: "Изображение (сохраняется в img/)",
    labAddSubmit: "Добавить",
    labYearPlaceholder: "2025-2026",
    labUrlPlaceholder: "humanoid",
    tableThNum: "#",
    tableThName: "Название",
    tableThTheme: "Тема",
    tableThYear: "Год",
    tableThLink: "Ссылка",
    tableThImage: "Изображение",
    tableThActions: "Действие",
    labNoData: "Нет данных",
    labDelete: "Удалить",
    valLoginNameMin: "Логин не короче 3 символов.",
    valPasswordMin: "Пароль не короче 6 символов.",
    valRegisterLogin: "Логин: 3–20 символов (латиница, цифры, _).",
    valPasswordMismatch: "Пароли не совпадают.",
    valLabNumber: "Номер — целое от 1 до 30.",
    valLabTitle: "Название: 3–80 символов.",
    valLabTheme: "Тема: 3–120 символов.",
    valLabYear: "Год: формат 2026 или 2025-2026.",
    valLabUrl: "В ссылке допустимы латиница, цифры и _ . / -",
    valLabUrlHash: "В ссылке допустимы латиница, цифры и _ . / - #",
    valLabImagePick: "Выберите файл изображения.",
    valLabImageType: "Форматы: PNG/JPG/WEBP/GIF.",
    valLabImageSize: "Максимум 5 МБ.",
    msgRequestError: "Ошибка запроса.",
    msgRegisterOk: "Регистрация завершена. Войдите в систему.",
    msgLoginOk: "Вход выполнен.",
    msgLoginNotAdmin: "Вы вошли, но у этой учётной записи нет прав администратора.",
    msgLogoutOk: "Вы вышли из системы.",
    msgSessionNotAdmin: "Обычный пользователь. Для панели нужна роль admin.",
    msgLabAdded: "Лабораторная добавлена. Изображение сохранено в img/.",
    msgLabDeleted: "Запись удалена.",
    labDeleteConfirm: "Удалить эту лабораторную из списка?",
  },
};

function t() {
  return I18N[currentLang];
}

function applyLanguage() {
  document.documentElement.lang = currentLang === "ja" ? "ja" : "ru";
  const dict = t();
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key && dict[key] !== undefined) {
      node.textContent = dict[key];
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (key && dict[key] !== undefined) {
      node.setAttribute("placeholder", dict[key]);
    }
  });
  if (langToggleBtn) {
    langToggleBtn.textContent = dict.langBtn;
  }
  updateUserBadge(cachedUserForBadge);
  renderLabsTable(cachedLabs);
}

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
    throw new Error(data.error || t().msgRequestError);
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
    throw new Error(data.error || t().msgRequestError);
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
  const d = t();
  if (login.value.trim().length < 3) {
    setFieldError(login, d.valLoginNameMin);
    valid = false;
  }
  if (password.value.trim().length < 6) {
    setFieldError(password, d.valPasswordMin);
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
  const d = t();
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(login.value.trim())) {
    setFieldError(login, d.valRegisterLogin);
    valid = false;
  }
  if (password.value.length < 6) {
    setFieldError(password, d.valPasswordMin);
    valid = false;
  }
  if (confirm.value !== password.value) {
    setFieldError(confirm, d.valPasswordMismatch);
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
  cachedUserForBadge = user;
  const prefix = t().userBadgePrefix;
  currentUserBadge.textContent = `${prefix}: ${user || "-"}`;
}

function renderLabsTable(labs) {
  cachedLabs = Array.isArray(labs) ? labs : [];
  const d = t();
  if (!Array.isArray(labs) || labs.length === 0) {
    labWorksBody.innerHTML = `<tr><td colspan="7">${d.labNoData}</td></tr>`;
    return;
  }

  labWorksBody.innerHTML = "";
  labs.forEach((lab) => {
    const row = document.createElement("tr");
    const safeUrl = String(lab.url || "").replace(/"/g, "&quot;");
    const delLabel = d.labDelete.replace(/"/g, "&quot;");
    row.innerHTML = `
      <td>${lab.number}</td>
      <td>${lab.title}</td>
      <td>${lab.theme}</td>
      <td>${lab.year || "-"}</td>
      <td>${safeUrl ? `<a href="${safeUrl}" target="_blank" rel="noopener">${safeUrl}</a>` : "-"}</td>
      <td>${lab.image ? `<img src="${lab.image}" alt="${String(lab.title || "").replace(/"/g, "&quot;")}" class="admin-lab-image"><div class="small text-muted">${lab.image}</div>` : "-"}</td>
      <td><button type="button" class="btn btn-sm btn-outline-danger" data-delete-lab-id="${lab.id}">${delLabel}</button></td>
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
  const d = t();
  const numberValue = Number(number.value);
  if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 30) {
    setFieldError(number, d.valLabNumber);
    valid = false;
  }
  if (title.value.trim().length < 3 || title.value.trim().length > 80) {
    setFieldError(title, d.valLabTitle);
    valid = false;
  }
  if (theme.value.trim().length < 3 || theme.value.trim().length > 120) {
    setFieldError(theme, d.valLabTheme);
    valid = false;
  }
  if (!/^\d{4}(?:-\d{4})?$/.test(year.value.trim())) {
    setFieldError(year, d.valLabYear);
    valid = false;
  }
  if (url.value.trim() && !/^[a-zA-Z0-9_./-]+$/.test(url.value.trim())) {
    setFieldError(url, d.valLabUrl);
    valid = false;
  }
  const file = imageFile.files && imageFile.files[0];
  if (!file) {
    setFieldError(imageFile, d.valLabImagePick);
    valid = false;
  } else {
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setFieldError(imageFile, d.valLabImageType);
      valid = false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldError(imageFile, d.valLabImageSize);
      valid = false;
    }
  }

  if (url.value.trim() && !/^[a-zA-Z0-9_./#-]+$/.test(url.value.trim())) {
    setFieldError(url, d.valLabUrlHash);
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
      setMessage(authMessage, t().msgSessionNotAdmin, "error");
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
      setMessage(adminMessage, t().msgLoginOk, "success");
      await loadLabs();
    } else {
      setMessage(authMessage, t().msgLoginNotAdmin, "error");
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
    setMessage(authMessage, t().msgRegisterOk, "success");
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
    cachedLabs = [];
    renderLabsTable([]);
    setMessage(authMessage, t().msgLogoutOk, "success");
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
    setMessage(adminMessage, t().msgLabAdded, "success");
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

  const ok = window.confirm(t().labDeleteConfirm);
  if (!ok) {
    return;
  }

  try {
    const data = await request("labs_delete", { id });
    renderLabsTable(data.labs);
    setMessage(adminMessage, t().msgLabDeleted, "success");
  } catch (error) {
    setMessage(adminMessage, error.message, "error");
  }
});

if (langToggleBtn) {
  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "ja" ? "ru" : "ja";
    applyLanguage();
  });
}

applyLanguage();
checkSession();
