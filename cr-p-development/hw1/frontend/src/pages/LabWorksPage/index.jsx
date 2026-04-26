import React, { useEffect, useState } from 'react';
import { dataClient } from '../../shared/api/client';
import { CATEGORIES, STATUSES } from '../../entities/labWork/constants';
import LabWorkCard from '../../entities/labWork/LabWorkCard';
import AddLabWorkForm from '../../features/labWork/AddLabWorkForm';
import Button from '../../shared/ui/Button';
import LoadingSpinner from '../../shared/ui/LoadingSpinner';
import styles from './LabWorksPage.module.css';

const StatCard = ({ value, label }) => (
  <div className={styles.statCard}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const LabWorksPage = () => {
  const [labWorks, setLabWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dataClient.get('/lab-works/')
      .then((res) => setLabWorks(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = labWorks.filter(
    (lw) =>
      (!categoryFilter || lw.category === categoryFilter) &&
      (!statusFilter   || lw.status   === statusFilter),
  );

  const stats = {
    total:      labWorks.length,
    inProgress: labWorks.filter((lw) => lw.status === 'In Progress').length,
    completed:  labWorks.filter((lw) => lw.status === 'Completed').length,
  };

  const handleAdd = (newWork) => {
    setLabWorks((prev) => [...prev, newWork]);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await dataClient.delete(`/lab-works/${id}`);
      setLabWorks((prev) => prev.filter((lw) => lw.id !== id));
    } catch {}
  };

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lab Works</h1>
        <p className={styles.pageSubtitle}>
          <span className="ja">東京先端ロボティクス研究所</span>
        </p>
      </div>

      <div className={styles.stats}>
        <StatCard value={stats.total}      label="Total"       />
        <StatCard value={stats.inProgress} label="In Progress" />
        <StatCard value={stats.completed}  label="Completed"   />
      </div>

      <div className={styles.toolbar}>
        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <div className={styles.spacer} />

        <Button
          variant={showForm ? 'secondary' : 'primary'}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <><i className="bi bi-x-lg" /> Cancel</>
          ) : (
            <><i className="bi bi-plus-lg" /> Add Lab Work</>
          )}
        </Button>
      </div>

      {showForm && (
        <div className={styles.formPanel}>
          <AddLabWorkForm onSuccess={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><i className="bi bi-inbox" /></div>
              <p className={styles.emptyText}>
                {labWorks.length === 0 ? 'No lab works yet' : 'No results for current filters'}
              </p>
              {labWorks.length === 0 && (
                <p className={styles.emptyHint}>Click "Add Lab Work" to get started.</p>
              )}
            </div>
          ) : (
            filtered.map((lw) => (
              <LabWorkCard key={lw.id} labWork={lw} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </main>
  );
};

export default LabWorksPage;
