import React from 'react';
import StatusBadge from '../../../shared/ui/StatusBadge';
import { CATEGORY_CODE } from '../constants';
import styles from './LabWorkCard.module.css';

const LabWorkCard = ({ labWork, onDelete }) => {
  const { id, title, description, category, status, due_date } = labWork;
  const code = CATEGORY_CODE[category] ?? '??';

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.code}>[{code}-{String(id).padStart(2, '0')}]</span>
        <StatusBadge status={status} />
      </div>

      <h3 className={styles.title}>{title}</h3>

      <p className={styles.description}>{description}</p>

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.category}>{category}</span>
          {due_date && <span className={styles.dueDate}>Due: {due_date}</span>}
        </div>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(id)}
          title="Delete lab work"
        >
          <i className="bi bi-trash3" />
        </button>
      </div>
    </article>
  );
};

export default LabWorkCard;
