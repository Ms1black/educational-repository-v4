window.FSD = window.FSD || {};
window.FSD.widgets = window.FSD.widgets || {};
window.FSD.widgets.navigation = window.FSD.widgets.navigation || {};
window.FSD.widgets.navigation.ui = window.FSD.widgets.navigation.ui || {};

class LabNavigatorClass extends React.Component {
  render() {
    const { activePart, onChange, dict, canOpenAdmin } = this.props;

    return (
      <div className="d-flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Lab sections">
        <button
          type="button"
          className={`btn btn-sm ${activePart === "auth" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => onChange("auth")}
        >
          {dict.loginTitle}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activePart === "admin" ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => onChange("admin")}
          disabled={!canOpenAdmin}
        >
          {dict.adminListTitle}
        </button>
      </div>
    );
  }
}

window.FSD.widgets.navigation.ui.LabNavigatorClass = LabNavigatorClass;
