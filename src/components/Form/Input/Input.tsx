import styles from './Input.module.css';
import React, { InputHTMLAttributes } from 'react';

export type InputProps = {
  label?: string;
  fullWidth?: boolean;
  color: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({
  children,
  label,
  fullWidth,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.input} ${className}`}>
      <input
        {...props}
        style={{ width: fullWidth && '100%', ...props.style }}
      />
      {label && (
        <label htmlFor={props.id} style={{ background: props.color }}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Input;
