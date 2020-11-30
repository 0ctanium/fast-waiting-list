import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import AuthProvider from '@context/auth';
import { useRouter } from 'next/router';

import theme from '@theme';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import LoadingSpinner from '@icons/Loading';

const pageTransitionDuration = 800;

function App({ Component, pageProps }: AppProps): JSX.Element {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    const wrapper = document.getElementById('page-wrapper');

    const start = () => {
      wrapper.classList.remove('fadeIn');
      wrapper.classList.add('fadeOut');
      setLoading(true);

      setTimeout(() => {
        wrapper.style.display = 'none';
      }, pageTransitionDuration);
    };

    const done = () => {
      setTimeout(() => {
        wrapper.style.display = 'block';
        wrapper.classList.remove('fadeOut');
        wrapper.classList.add('fadeIn');

        setLoading(false);
      }, pageTransitionDuration);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Fast Waiting List</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {loading && (
          <div className={'loader'}>
            <LoadingSpinner />
          </div>
        )}
        <AuthProvider>
          <SnackbarProvider preventDuplicate>
            <div id={'page-wrapper'}>
              <Component {...pageProps} />
            </div>
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
      <style jsx global>{`
        html,
        body,
        #__next,
        #page-wrapper {
          overflow-x: hidden;
        }

        html {
          transition: filter 300ms;
        }

        #__next {
          background: #fff;
        }

        html[theme='dark'] {
          filter: invert(1) hue-rotate(180deg);
        }

        html[theme='dark'] img,
        html[theme='dark'] video,
        html[theme='dark'] .bypass-theme {
          filter: invert(1) hue-rotate(180deg);
        }

        .MuiPaper-elevation0 {
          transition: box-shadow 300ms;
        }

        html[theme='dark'] .MuiPaper-elevation0 {
          box-shadow: 0 0 6px 3px rgb(225, 225, 225);
        }

        .loader {
          display: block;
          shape-rendering: auto;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(2.5);
        }

        #page-wrapper.fadeIn {
          animation: fadeIn ${pageTransitionDuration}ms;
        }

        #page-wrapper.fadeOut {
          animation: fadeOut ${pageTransitionDuration}ms;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0%);
          }
        }
        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: translateX(0%);
          }
          100% {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
      `}</style>
    </React.Fragment>
  );
}

export default App;
