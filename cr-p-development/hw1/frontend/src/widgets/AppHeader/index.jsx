import React from 'react';
import styles from './AppHeader.module.css';

const NAV_ITEMS = [
  { key: 'works',    label: 'Lab Works' },
  { key: 'overview', label: 'Overview'  },
];

const AppHeader = ({ page, onPageChange, username, onLogout }) => (
  <header className={styles.header}>
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <i className="bi bi-flower2" />
        TIAR
      </div>

      <div className={styles.divider} />

      {NAV_ITEMS.map(({ key, label }) => (
        <button
          key={key}
          className={`${styles.navBtn} ${page === key ? styles.active : ''}`}
          onClick={() => onPageChange(key)}
        >
          {label}
        </button>
      ))}

      <div className={styles.divider} />

      <div className={styles.userArea}>
        <span className={styles.username}>{username}</span>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <i className="bi bi-box-arrow-right" />
        </button>
      </div>
    </nav>
  </header>
);

export default AppHeader;
