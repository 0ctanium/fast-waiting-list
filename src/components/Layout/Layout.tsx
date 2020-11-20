import styles from './Layout.module.css';
import React from 'react';
import Head from 'next/head';
import Footer from '@components/Layout/Footer/Footer';

const Layout: React.FC = ({ children }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Fast Wait List</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
