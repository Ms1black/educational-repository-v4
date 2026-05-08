window.FSD = window.FSD || {};
window.FSD.pages = window.FSD.pages || {};
window.FSD.pages.admin = window.FSD.pages.admin || {};
window.FSD.pages.admin.ui = window.FSD.pages.admin.ui || {};

window.FSD.pages.admin.ui.AdminPage = function AdminPage() {
  const [lang, setLang] = React.useState("ja");
  const [activePart, setActivePart] = React.useState("auth");
  const dict = window.FSD.shared.config.I18N[lang];
  const [labs, setLabs] = React.useState([]);
  const [labForm, setLabForm] = React.useState({ number: "", title: "", theme: "", year: "", url: "", imageFile: null });
  const fileInputRef = React.useRef(null);

  const loadLabs = React.useCallback(async () => {
    const data = await window.FSD.shared.api.request("labs_list", {}, "GET", dict);
    setLabs(Array.isArray(data.labs) ? data.labs : []);
  }, [dict]);

  const auth = window.FSD.features.auth.model.useAuth(dict, loadLabs);

  React.useEffect(() => {
    document.documentElement.lang = lang === "ja" ? "ja" : "ru";
    document.title = dict.pageTitle;
  }, [lang, dict.pageTitle]);

  React.useEffect(() => {
    auth.checkSession();
  }, [auth.checkSession]);

  const setFieldError = (name, message) => auth.setErrors((prev) => ({ ...prev, [name]: message }));
  const showAdmin = auth.authorized && auth.isAdmin;

  const validateLogin = () => {
    const nextErrors = {};
    if (auth.loginForm.login.trim().length < 3) nextErrors.login = dict.valLoginNameMin;
    if (auth.loginForm.password.trim().length < 6) nextErrors.loginPassword = dict.valPasswordMin;
    auth.setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegister = () => {
    const nextErrors = {};
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(auth.registerForm.login.trim())) nextErrors.registerLogin = dict.valRegisterLogin;
    if (auth.registerForm.password.length < 6) nextErrors.registerPassword = dict.valPasswordMin;
    if (auth.registerForm.confirm !== auth.registerForm.password) nextErrors.registerConfirm = dict.valPasswordMismatch;
    auth.setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateLab = () => {
    const nextErrors = {};
    const numberValue = Number(labForm.number);
    if (!Number.isInteger(numberValue) || numberValue < 1 || numberValue > 30) nextErrors.number = dict.valLabNumber;
    if (labForm.title.trim().length < 3 || labForm.title.trim().length > 80) nextErrors.title = dict.valLabTitle;
    if (labForm.theme.trim().length < 3 || labForm.theme.trim().length > 120) nextErrors.theme = dict.valLabTheme;
    if (!/^\d{4}(?:-\d{4})?$/.test(labForm.year.trim())) nextErrors.year = dict.valLabYear;
    if (labForm.url.trim() && !/^[a-zA-Z0-9_./-]+$/.test(labForm.url.trim())) nextErrors.url = dict.valLabUrl;
    if (labForm.url.trim() && !/^[a-zA-Z0-9_./#-]+$/.test(labForm.url.trim())) nextErrors.url = dict.valLabUrlHash;
    if (!labForm.imageFile) nextErrors.imageFile = dict.valLabImagePick;
    if (labForm.imageFile) {
      const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
      if (!validTypes.includes(labForm.imageFile.type)) nextErrors.imageFile = dict.valLabImageType;
      if (labForm.imageFile.size > 5 * 1024 * 1024) nextErrors.imageFile = dict.valLabImageSize;
    }
    auth.setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    auth.clearMessages();
    if (!validateLogin()) return;
    try {
      const data = await window.FSD.shared.api.request("login", { login: auth.loginForm.login.trim(), password: auth.loginForm.password }, "POST", dict);
      auth.setUser(data.user || null);
      auth.setAuthorized(true);
      auth.setIsAdmin(Boolean(data.isAdmin));
      if (data.isAdmin) {
        await loadLabs();
        setActivePart("admin");
        auth.setAdminMessage({ text: dict.msgLoginOk, type: "success" });
      } else {
        setActivePart("auth");
        auth.setAuthMessage({ text: dict.msgLoginNotAdmin, type: "error" });
      }
    } catch (error) {
      auth.setAuthMessage({ text: error.message, type: "error" });
    }
  };

  const onRegisterSubmit = async (event) => {
    event.preventDefault();
    auth.clearMessages();
    if (!validateRegister()) return;
    try {
      await window.FSD.shared.api.request("register", { login: auth.registerForm.login.trim(), password: auth.registerForm.password }, "POST", dict);
      auth.setRegisterForm({ login: "", password: "", confirm: "" });
      auth.setAuthMessage({ text: dict.msgRegisterOk, type: "success" });
    } catch (error) {
      auth.setAuthMessage({ text: error.message, type: "error" });
    }
  };

  const onLogout = async () => {
    try {
      await window.FSD.shared.api.request("logout", {}, "POST", dict);
      auth.setAuthorized(false);
      auth.setIsAdmin(false);
      auth.setUser(null);
      setActivePart("auth");
      setLabs([]);
      auth.setAuthMessage({ text: dict.msgLogoutOk, type: "success" });
    } catch (error) {
      auth.setAdminMessage({ text: error.message, type: "error" });
    }
  };

  const onLabSubmit = async (event) => {
    event.preventDefault();
    auth.setAdminMessage({ text: "", type: "" });
    if (!validateLab()) return;
    const formData = new FormData();
    formData.append("action", "labs_add");
    formData.append("number", labForm.number);
    formData.append("title", labForm.title.trim());
    formData.append("theme", labForm.theme.trim());
    formData.append("year", labForm.year.trim());
    formData.append("url", labForm.url.trim());
    formData.append("imageFile", labForm.imageFile);
    try {
      const data = await window.FSD.shared.api.requestFormData(formData, dict);
      setLabs(Array.isArray(data.labs) ? data.labs : []);
      setLabForm({ number: "", title: "", theme: "", year: "", url: "", imageFile: null });
      auth.setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      auth.setAdminMessage({ text: dict.msgLabAdded, type: "success" });
    } catch (error) {
      auth.setAdminMessage({ text: error.message, type: "error" });
    }
  };

  const onDeleteLab = async (id) => {
    if (!window.confirm(dict.labDeleteConfirm)) return;
    try {
      const data = await window.FSD.shared.api.request("labs_delete", { id }, "POST", dict);
      setLabs(Array.isArray(data.labs) ? data.labs : []);
      auth.setAdminMessage({ text: dict.msgLabDeleted, type: "success" });
    } catch (error) {
      auth.setAdminMessage({ text: error.message, type: "error" });
    }
  };

  const AuthPanel = window.FSD.widgets.authPanel.ui.AuthPanel;
  const AdminPanel = window.FSD.widgets.adminPanel.ui.AdminPanel;
  const LabNavigatorClass = window.FSD.widgets.navigation.ui.LabNavigatorClass;

  return (
    <>
      <header className="header">
        <nav className="nav admin-nav">
          <ul className="nav__list nav__list--center admin-nav__list">
            <li className="nav__item"><a href="index.html" className="nav__link">{dict.home}</a></li>
            <li className="nav__item nav__item--lang">
              <button type="button" className="btn btn-sm btn-outline-secondary lab4-lang-toggle" aria-label="Switch language" onClick={() => setLang((prev) => (prev === "ja" ? "ru" : "ja"))}>
                {dict.langBtn}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container py-4 py-md-5">
        <LabNavigatorClass
          activePart={activePart}
          onChange={setActivePart}
          dict={dict}
          canOpenAdmin={showAdmin}
        />
        {activePart === "auth" && (
          <AuthPanel
            dict={dict}
            errors={auth.errors}
            loginForm={auth.loginForm}
            registerForm={auth.registerForm}
            authMessage={auth.authMessage}
            onLoginChange={(name, value) => { auth.setLoginForm({ ...auth.loginForm, [name]: value }); setFieldError(name === "login" ? "login" : "loginPassword", ""); auth.clearMessages(); }}
            onRegisterChange={(name, value) => { auth.setRegisterForm({ ...auth.registerForm, [name]: value }); const keyMap = { login: "registerLogin", password: "registerPassword", confirm: "registerConfirm" }; setFieldError(keyMap[name], ""); auth.clearMessages(); }}
            onLoginSubmit={onLoginSubmit}
            onRegisterSubmit={onRegisterSubmit}
          />
        )}
        {activePart === "admin" && showAdmin && (
          <AdminPanel
            dict={dict}
            user={auth.user}
            errors={auth.errors}
            labForm={labForm}
            labs={labs}
            adminMessage={auth.adminMessage}
            fileInputRef={fileInputRef}
            onChange={(name, value) => { setLabForm({ ...labForm, [name]: value }); setFieldError(name, ""); }}
            onSubmit={onLabSubmit}
            onLogout={onLogout}
            onDeleteLab={onDeleteLab}
          />
        )}
      </main>
    </>
  );
};
