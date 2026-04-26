import React, { useState } from 'react';
import AuthPage from '../pages/AuthPage';
import LabWorksPage from '../pages/LabWorksPage';
import OverviewPage from '../pages/OverviewPage';
import AppHeader from '../widgets/AppHeader';
import AppFooter from '../widgets/AppFooter';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [page, setPage] = useState('works');

  const handleLogin = (tok, user) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('username', user);
    setToken(tok);
    setUsername(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  };

  if (!token) return <AuthPage onLogin={handleLogin} />;

  return (
    <>
      <AppHeader page={page} onPageChange={setPage} username={username} onLogout={handleLogout} />
      {page === 'works'    && <LabWorksPage />}
      {page === 'overview' && <OverviewPage />}
      <AppFooter />
    </>
  );
};

export default App;
