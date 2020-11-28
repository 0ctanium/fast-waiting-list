import styles from './Notification.module.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Transition, TransitionGroup } from 'react-transition-group';
import { Notification } from '@context/notifications';
import { MdClose } from 'react-icons/md';

export interface NotificationProps {
  autoHide?: number;
  text: string;
}

const duration = 300;
const defaultStyle = {
  transition: `opacity ${duration}ms`,
  opacity: 0,
};

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

const Snackbar: React.FC<NotificationProps> = ({ autoHide, text }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoHide > 0) {
      setTimeout(() => {
        setShow(false);
      }, autoHide);
    }
  }, [autoHide]);

  return (
    <Transition in={show} timeout={duration} unmountOnExit>
      {(state) => (
        <div
          className={styles.snackbar}
          style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}>
          <p>{text}</p>
          <button className={styles.close} onClick={() => setShow(false)}>
            <MdClose />
          </button>
        </div>
      )}
    </Transition>
  );
};

export interface NotificationPortalProps {
  notifications: Notification[];
}

// TODO: auto remove hidden notifs to prevent too big array of non-showed elements
// TODO: prevent duplicate notification
export const NotificationPortal: React.FC<NotificationPortalProps> = ({
  notifications,
}) => {
  if (typeof window === 'undefined') return null;

  return ReactDOM.createPortal(
    <div className={styles.portal}>
      <TransitionGroup>
        {notifications.map((notification, i) => (
          <Snackbar key={i} text={notification.text} />
        ))}
      </TransitionGroup>
    </div>,
    document.body
  );
};

export default NotificationPortal;
