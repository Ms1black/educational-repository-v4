import React, { useState, useEffect } from 'react';
import { dataClient } from '../../shared/api/client';
import { CATEGORIES, CATEGORY_META } from '../../entities/labWork/constants';
import LabWorkCard from '../../entities/labWork/LabWorkCard';
import LoadingSpinner from '../../shared/ui/LoadingSpinner';
import styles from './OverviewPage.module.css';

const DeptGrid = ({ onSelect }) => (
  <div className={styles.deptGrid}>
    {CATEGORIES.map((cat) => {
      const { index, img, desc } = CATEGORY_META[cat];
      return (
        <article
          key={cat}
          className={styles.deptCard}
          onClick={() => onSelect(cat)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(cat)}
        >
          <div className={styles.imgWrap}>
            <img className={styles.deptImg} src={img} alt={cat} />
          </div>
          <div className={styles.deptInfo}>
            <span className={styles.deptIndex}>{index}</span>
            <h3 className={styles.deptTitle}>{cat}</h3>
            <p className={styles.deptDesc}>{desc}</p>
          </div>
        </article>
      );
    })}
  </div>
);

const DeptDetail = ({ category, onBack }) => {
  const [labWorks, setLabWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const meta = CATEGORY_META[category];

  useEffect(() => {
    setLoading(true);
    dataClient.get('/lab-works/')
      .then((res) => setLabWorks(res.data.filter((lw) => lw.category === category)))
      .finally(() => setLoading(false));
  }, [category]);

  const handleDelete = async (id) => {
    try {
      await dataClient.delete(`/lab-works/${id}`);
      setLabWorks((prev) => prev.filter((lw) => lw.id !== id));
    } catch { }
  };

  return (
    <div className={styles.detail}>
      <button className={styles.backLink} onClick={onBack}>
        <i className="bi bi-arrow-left" /> Research Departments
      </button>

      <div className={styles.heroWrap}>
        <img className={styles.heroImg} src={meta.img} alt={category} />
        <div className={styles.heroOverlay}>
          <span className={styles.heroIndex}>{meta.index}</span>
          <h1 className={styles.heroTitle}>{category}</h1>
        </div>
      </div>

      <p className={styles.deptDetailDesc}>{meta.desc}</p>

      <div className={styles.divider} />

      <div className={styles.labWorksHeader}>
        <h2 className={styles.labWorksTitle}>Lab Works</h2>
        <span className={styles.labWorksCount}>
          {loading ? '—' : `${labWorks.length} total`}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : labWorks.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><i className="bi bi-inbox" /></div>
          <p className={styles.emptyText}>No lab works in this department yet</p>
        </div>
      ) : (
        <div className={styles.labWorksGrid}>
          {labWorks.map((lw) => (
            <LabWorkCard key={lw.id} labWork={lw} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

const OverviewPage = () => {
  const [selected, setSelected] = useState(null);

  return (
    <main className={styles.main}>
      {selected === null ? (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Research<br />Departments</h1>
            <p className={styles.pageSubtitle}><span className="ja">研究部門</span></p>
          </div>

          <div className={styles.quote}>
            <p className={styles.quoteText}>
              「 究極の機械とは考える機械ではなく、<br />
              行動間の沈黙を理解する機械である。」
            </p>
            <div className={styles.quoteAuthorWrap}>
              <img className={styles.quoteAvatar} src="/img/quote-avatar.png" alt="Dr. Arata Sato" />
              <p className={styles.quoteAuthor}>— Dr. Arata Sato<br />Founding Dean of TIAR</p>
            </div>
          </div>

          <DeptGrid onSelect={setSelected} />
        </>
      ) : (
        <DeptDetail category={selected} onBack={() => setSelected(null)} />
      )}
    </main>
  );
};

export default OverviewPage;
