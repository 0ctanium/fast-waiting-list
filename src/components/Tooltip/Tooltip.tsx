import styles from './Tooltip.module.css';
import React from 'react';

export type TooltipProps = {
  text?: string;
};

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipContent}>{children}</div>
      <div className={styles.tooltipMessage}>{text}</div>
    </div>
  );
};

export default Tooltip;
