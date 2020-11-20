import styles from './Button.module.css';
import React, { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

export type ButtonProps = {
  fullWidth?: boolean;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button: React.FC<ButtonProps> = ({ children, fullWidth, ...props }) => {
  return (
    <button
      {...props}
      className={styles.button}
      style={{ width: fullWidth && '100%' }}>
      {children}
    </button>
  );
};

export default Button;
