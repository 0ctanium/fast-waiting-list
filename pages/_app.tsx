import React from 'react';
import { AppProps } from 'next/app';
import AuthProvider from '@context/auth';

import '@styles/globals.css';
import { NotificationsProvider } from '@context/notifications';

function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Component {...pageProps} />
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
