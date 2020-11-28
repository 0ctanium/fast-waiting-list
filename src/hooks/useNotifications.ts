import { useContext } from 'react';
import {
  notificationContext,
  NotificationsContext,
} from '@context/notifications';

export const useNotifications = (): NotificationsContext => {
  return useContext(notificationContext);
};
