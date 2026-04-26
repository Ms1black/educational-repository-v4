import React from 'react';
import styles from './AppFooter.module.css';

const AppFooter = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.brand}>
        <div className={styles.logo}><i className="bi bi-flower2" /> TIAR</div>
        <p className={styles.desc}>
          Tokyo Institute of Advanced Robotics.<br />
          <span className="ja">機械と精神の調和を研究する。</span>
        </p>
        <div className={styles.socials}>
          <a href="#x"><i className="bi bi-instagram" /></a>
          <a href="#x"><i className="bi bi-github" /></a>
          <a href="#x"><i className="bi bi-twitter-x" /></a>
        </div>
      </div>

      <div className={styles.links}>
        <div className={styles.col}>
          <h4>Research</h4>
          <ul>
            <li><a href="#x">Neural Haptics</a></li>
            <li><a href="#x">Kinetic Logic</a></li>
            <li><a href="#x">Fluid Dynamics</a></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Institute</h4>
          <ul>
            <li><a href="#x">Admissions</a></li>
            <li><a href="#x">Faculty</a></li>
            <li><a href="#x">Contact</a></li>
          </ul>
        </div>
      </div>
    </div>

    <p className={styles.copy}>© 2025 TIAR — Tokyo Institute of Advanced Robotics</p>
  </footer>
);

export default AppFooter;
