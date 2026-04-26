import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  onClick,
  className = '',
}) => {
  const cls = [styles.btn, styles[variant], size !== 'md' && styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
};

export default Button;
