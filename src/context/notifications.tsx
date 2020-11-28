import React, { createContext, useCallback, useState } from 'react';
import { initializeFirebase } from '@services/firebase/client';
import NotificationPortal from '@components/Notification/Notification';

initializeFirebase();
export interface Notification {
  text: string;
}
export type Notify = (notification: Notification) => void;
export interface NotificationsContext {
  notifications: Notification[];
  notify: Notify;
}

export const notificationContext = createContext<NotificationsContext>(null);

export const NotificationsProvider: React.FC = ({ children }) => {
  const contextValue = useNotificationsProvider();
  const { notifications } = contextValue;

  return (
    <notificationContext.Provider value={contextValue}>
      {children}
      <NotificationPortal notifications={notifications} />
    </notificationContext.Provider>
  );
};

export const useNotificationsProvider = (): NotificationsContext => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback<Notify>((notification) => {
    setNotifications((prevState) => [...prevState, notification]);
  }, []);

  return { notifications, notify };
};

export const withAuth = <P extends Record<string, any>>(
  Component: React.ComponentType<P>
): React.ComponentType<P> =>
  class WithAuth extends React.Component<P> {
    render() {
      return (
        <NotificationsProvider>
          <Component {...this.props} />
        </NotificationsProvider>
      );
    }
  };

export default NotificationsProvider;
