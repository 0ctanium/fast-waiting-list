import styles from './Tooltip.module.css';
import React from 'react';

export type TooltipProps = {
  text?: string;
  direction?: {
    vertical: 'top' | 'middle' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
};

const Tooltip: React.FC<TooltipProps> = ({ children, text, direction }) => {
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipContent}>{children}</div>
      <div
        className={`${styles.tooltipMessage}  ${
          styles[direction?.vertical || 'bottom']
        } ${styles[direction?.horizontal || 'center']}`}>
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
