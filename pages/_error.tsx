import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

interface ErrorProps {
  statusCode: number;
  statusMessage: string;
  name: string;
}

const ErrorPage: NextPage<ErrorProps> = ({
  statusCode,
  statusMessage,
  name,
}) => {
  return (
    <div>
      <Head>
        <title>{name}</title>
      </Head>
      <h1>Error: {statusCode}</h1>
      <p>{statusMessage || name}</p>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const currentStatusCode = res?.statusCode || 500;
  const throwedStatusCode = err?.statusCode;

  const currentStatusMessage = res?.statusMessage;
  const throwedStatusMessage = err?.message;

  const statusCode = throwedStatusCode || currentStatusCode;
  const statusMessage = throwedStatusMessage || currentStatusMessage;

  if (res) {
    res.statusCode = statusCode;
    res.statusMessage = statusMessage;
  }

  return { statusCode, statusMessage, name: err?.name };
};

export default ErrorPage;
