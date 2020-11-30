import React from 'react';
import Head from 'next/head';
import Footer from '@components/Layout/Footer/Footer';
import { IconButton, makeStyles } from '@material-ui/core';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import Link from 'next/link';

export interface LayoutProps {
  disableHomepageButton?: boolean;
}

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    padding: '0 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    padding: '3rem 0 5rem 0',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Layout: React.FC<LayoutProps> = ({ disableHomepageButton, children }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Head>
        <title>Fast Wait List</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!disableHomepageButton && (
        <Link href={'/'} passHref>
          <IconButton style={{ alignSelf: 'flex-start' }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
      )}

      <main className={styles.main}>{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
