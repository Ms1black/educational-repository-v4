window.FSD = window.FSD || {};
window.FSD.app = window.FSD.app || {};

window.FSD.app.bootstrap = function bootstrap() {
  const AdminPage = window.FSD.pages.admin.ui.AdminPage;
  ReactDOM.createRoot(document.getElementById("adminReactRoot")).render(<AdminPage />);
};

window.FSD.app.bootstrap();
