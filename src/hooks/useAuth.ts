import { useContext } from 'react';
import { AuthContext, authContext } from '@context/auth';

export const useAuth = (): AuthContext => {
  return useContext(authContext);
};
