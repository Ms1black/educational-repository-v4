window.FSD = window.FSD || {};
window.FSD.widgets = window.FSD.widgets || {};
window.FSD.widgets.adminPanel = window.FSD.widgets.adminPanel || {};
window.FSD.widgets.adminPanel.ui = window.FSD.widgets.adminPanel.ui || {};

window.FSD.widgets.adminPanel.ui.AdminPanel = function AdminPanel(props) {
  const { dict, user, errors, labForm, adminMessage, fileInputRef, onChange, onSubmit, onLogout, onDeleteLab, labs } = props;
  const LabsTable = window.FSD.entities.lab.ui.LabsTable;

  return (
    <section className="lab4-card p-3 p-md-4 mt-4" aria-live="polite">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 mb-0">{dict.adminListTitle}</h2>
        <div className="d-flex align-items-center gap-2">
          <span className="admin-panel__badge">{dict.userBadgePrefix}: {user || "-"}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={onLogout}>{dict.logoutBtn}</button>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <h3 className="h6 mb-0">{dict.addLabTitle}</h3>
        </div>
        <form className="row g-3 mt-1" onSubmit={onSubmit} noValidate>
          <div className="col-12 col-md-2">
            <label htmlFor="labWorkNumber" className="form-label">{dict.labNumberLabel}</label>
            <input id="labWorkNumber" type="number" className={`form-control ${errors.number ? "is-invalid" : ""}`} min="1" max="30" value={labForm.number} onChange={(e) => onChange("number", e.target.value)} required />
            <div className="invalid-feedback">{errors.number || ""}</div>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="labWorkTitle" className="form-label">{dict.labNameLabel}</label>
            <input id="labWorkTitle" type="text" className={`form-control ${errors.title ? "is-invalid" : ""}`} value={labForm.title} onChange={(e) => onChange("title", e.target.value)} required />
            <div className="invalid-feedback">{errors.title || ""}</div>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="labWorkTheme" className="form-label">{dict.labThemeLabel}</label>
            <input id="labWorkTheme" type="text" className={`form-control ${errors.theme ? "is-invalid" : ""}`} value={labForm.theme} onChange={(e) => onChange("theme", e.target.value)} required />
            <div className="invalid-feedback">{errors.theme || ""}</div>
          </div>
          <div className="col-12 col-md-2">
            <label htmlFor="labWorkYear" className="form-label">{dict.labYearLabel}</label>
            <input id="labWorkYear" type="text" className={`form-control ${errors.year ? "is-invalid" : ""}`} placeholder={dict.labYearPlaceholder} value={labForm.year} onChange={(e) => onChange("year", e.target.value)} required />
            <div className="invalid-feedback">{errors.year || ""}</div>
          </div>
          <div className="col-12 col-md-2">
            <label htmlFor="labWorkUrl" className="form-label">{dict.labLinkLabel}</label>
            <input id="labWorkUrl" type="text" className={`form-control ${errors.url ? "is-invalid" : ""}`} placeholder={dict.labUrlPlaceholder} value={labForm.url} onChange={(e) => onChange("url", e.target.value)} />
            <div className="invalid-feedback">{errors.url || ""}</div>
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="labWorkImageFile" className="form-label">{dict.labImageLabel}</label>
            <input id="labWorkImageFile" ref={fileInputRef} type="file" className={`form-control ${errors.imageFile ? "is-invalid" : ""}`} accept=".png,.jpg,.jpeg,.webp,.gif" onChange={(e) => onChange("imageFile", e.target.files && e.target.files[0] ? e.target.files[0] : null)} required />
            <div className="invalid-feedback">{errors.imageFile || ""}</div>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-dark">{dict.labAddSubmit}</button>
          </div>
        </form>
        <LabsTable labs={labs} dict={dict} onDelete={onDeleteLab} />
      </div>
      <p className={`small mt-3 mb-0 ${adminMessage.type === "success" ? "message-success" : adminMessage.type === "error" ? "message-error" : ""}`}>
        {adminMessage.text}
      </p>
    </section>
  );
};
