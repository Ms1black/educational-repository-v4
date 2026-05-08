window.FSD = window.FSD || {};
window.FSD.features = window.FSD.features || {};
window.FSD.features.auth = window.FSD.features.auth || {};
window.FSD.features.auth.model = window.FSD.features.auth.model || {};

window.FSD.features.auth.model.useAuth = function useAuth(dict, onLabsLoad) {
  const [authorized, setAuthorized] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [authMessage, setAuthMessage] = React.useState({ text: "", type: "" });
  const [adminMessage, setAdminMessage] = React.useState({ text: "", type: "" });
  const [loginForm, setLoginForm] = React.useState({ login: "", password: "" });
  const [registerForm, setRegisterForm] = React.useState({ login: "", password: "", confirm: "" });
  const [errors, setErrors] = React.useState({});

  const clearMessages = () => {
    setAuthMessage({ text: "", type: "" });
    setAdminMessage({ text: "", type: "" });
  };

  const checkSession = React.useCallback(async () => {
    try {
      const data = await window.FSD.shared.api.request("status", {}, "GET", dict);
      const userName = data.user || null;
      const admin = Boolean(data.isAdmin);
      setUser(userName);
      setAuthorized(Boolean(userName));
      setIsAdmin(admin);
      if (userName && admin) {
        await onLabsLoad();
      } else if (userName && !admin) {
        setAuthMessage({ text: dict.msgSessionNotAdmin, type: "error" });
      }
    } catch (_error) {
      setAuthorized(false);
      setIsAdmin(false);
      setUser(null);
    }
  }, [dict, onLabsLoad]);

  return {
    authorized,
    isAdmin,
    user,
    authMessage,
    adminMessage,
    setAdminMessage,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    errors,
    setErrors,
    clearMessages,
    setAuthMessage,
    setAuthorized,
    setIsAdmin,
    setUser,
    checkSession,
  };
};
