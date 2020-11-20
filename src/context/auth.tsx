import React, { createContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { initializeFirebase } from '@services/firebase/client';

initializeFirebase();
export interface AuthContext {
  uid: string;
}

const initialValue = {
  uid: null,
};

export const authContext = createContext<AuthContext>(initialValue);

export const AuthProvider: React.FC = ({ children }) => {
  const auth = useAuthProvider();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuthProvider = (): AuthContext => {
  const [uid, setUid] = useState<string>(null);

  useEffect(() => {
    firebase
      .auth()
      .signInAnonymously()
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorMessage, errorCode);
      });

    const cancelAuthListener = firebase.auth().onIdTokenChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => {
      cancelAuthListener();
    };
  }, []);

  return {
    uid,
  };
};

export const withAuth = <P extends Record<string, any>>(
  Component: React.ComponentType<P>
): React.ComponentType<P> =>
  class WithAuth extends React.Component<P> {
    render() {
      return (
        <AuthProvider>
          <Component {...this.props} />
        </AuthProvider>
      );
    }
  };

export default AuthProvider;
