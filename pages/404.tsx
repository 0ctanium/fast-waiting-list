import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

const NotFoundErrorPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>404</title>
      </Head>
      <h1>Error: 404</h1>
      <p>Page introuvable</p>
    </div>
  );
};

export default NotFoundErrorPage;
