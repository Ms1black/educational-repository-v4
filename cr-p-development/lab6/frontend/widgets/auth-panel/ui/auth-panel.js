window.FSD = window.FSD || {};
window.FSD.widgets = window.FSD.widgets || {};
window.FSD.widgets.authPanel = window.FSD.widgets.authPanel || {};
window.FSD.widgets.authPanel.ui = window.FSD.widgets.authPanel.ui || {};

window.FSD.widgets.authPanel.ui.AuthPanel = function AuthPanel(props) {
  const {
    dict,
    errors,
    loginForm,
    registerForm,
    authMessage,
    onLoginChange,
    onRegisterChange,
    onLoginSubmit,
    onRegisterSubmit,
  } = props;

  return (
    <section className="lab4-card auth-section p-3 p-md-4 mb-4" aria-live="polite">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="auth-box">
            <h2 className="h5 mb-3 auth-box__title">{dict.loginTitle}</h2>
            <form onSubmit={onLoginSubmit} noValidate autoComplete="on">
              <div className="mb-3">
                <label htmlFor="loginName" className="form-label auth-box__label">{dict.loginNameLabel}</label>
                <input id="loginName" type="text" className={`form-control ${errors.login ? "is-invalid" : ""}`} autoComplete="username" value={loginForm.login} onChange={(e) => onLoginChange("login", e.target.value)} required />
                <div className="invalid-feedback">{errors.login || ""}</div>
              </div>
              <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label auth-box__label">{dict.passwordLabel}</label>
                <input id="loginPassword" type="password" className={`form-control ${errors.loginPassword ? "is-invalid" : ""}`} autoComplete="current-password" value={loginForm.password} onChange={(e) => onLoginChange("password", e.target.value)} required />
                <div className="invalid-feedback">{errors.loginPassword || ""}</div>
              </div>
              <button className="btn btn-dark auth-box__button" type="submit">{dict.loginSubmit}</button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="auth-box auth-box--secondary">
            <h2 className="h5 mb-3 auth-box__title">{dict.registerTitle}</h2>
            <form onSubmit={onRegisterSubmit} noValidate autoComplete="off">
              <div className="mb-3">
                <label htmlFor="registerName" className="form-label auth-box__label">{dict.loginNameLabel}</label>
                <input id="registerName" type="text" className={`form-control ${errors.registerLogin ? "is-invalid" : ""}`} autoComplete="nickname" value={registerForm.login} onChange={(e) => onRegisterChange("login", e.target.value)} required />
                <div className="invalid-feedback">{errors.registerLogin || ""}</div>
              </div>
              <div className="mb-3">
                <label htmlFor="registerPassword" className="form-label auth-box__label">{dict.passwordLabel}</label>
                <input id="registerPassword" type="password" className={`form-control ${errors.registerPassword ? "is-invalid" : ""}`} autoComplete="new-password" value={registerForm.password} onChange={(e) => onRegisterChange("password", e.target.value)} required />
                <div className="invalid-feedback">{errors.registerPassword || ""}</div>
              </div>
              <div className="mb-3">
                <label htmlFor="registerPasswordConfirm" className="form-label auth-box__label">{dict.passwordConfirmLabel}</label>
                <input id="registerPasswordConfirm" type="password" className={`form-control ${errors.registerConfirm ? "is-invalid" : ""}`} autoComplete="new-password" value={registerForm.confirm} onChange={(e) => onRegisterChange("confirm", e.target.value)} required />
                <div className="invalid-feedback">{errors.registerConfirm || ""}</div>
              </div>
              <button className="btn btn-outline-dark auth-box__button auth-box__button--outline" type="submit">{dict.registerSubmit}</button>
            </form>
          </div>
        </div>
      </div>
      <p className={`small mt-3 mb-0 ${authMessage.type === "success" ? "message-success" : authMessage.type === "error" ? "message-error" : ""}`}>
        {authMessage.text}
      </p>
    </section>
  );
};
