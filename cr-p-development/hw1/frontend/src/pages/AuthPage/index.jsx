import React, { useState } from 'react';
import LoginForm from '../../features/auth/LoginForm';
import RegisterForm from '../../features/auth/RegisterForm';
import styles from './AuthPage.module.css';

const AuthPage = ({ onLogin }) => {
  const [view, setView] = useState('login');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <i className="bi bi-flower2" />
          TIAR
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formWrap}>
          {view === 'login' ? (
            <LoginForm onLogin={onLogin} onSwitch={() => setView('register')} />
          ) : (
            <RegisterForm onSwitch={() => setView('login')} />
          )}
          <p className={styles.tagline}>
            <span className="ja">東京先端ロボティクス研究所</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
