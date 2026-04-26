import React from 'react';
import styles from './StatusBadge.module.css';

const CLASS_MAP = {
  'Not Started': styles.notStarted,
  'In Progress': styles.inProgress,
  'Completed':   styles.completed,
};

const StatusBadge = ({ status }) => (
  <span className={`${styles.badge} ${CLASS_MAP[status] ?? styles.notStarted}`}>
    <span className={styles.dot} />
    {status}
  </span>
);

export default StatusBadge;
