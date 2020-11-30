import React, { useCallback, useState, useEffect } from 'react';
import { NextPage } from 'next';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Layout from '@components/Layout/Layout';
import CreateListForm, {
  CreateListFormValues,
} from '@components/Form/CreateList';
import JoinListForm, { JoinListFormValues } from '@components/Form/Join';
import { initializeFirebase } from '@services/firebase/client';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';

import firebase from 'firebase';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import {
  Typography,
  Link as MUILink,
  IconButton,
  Card,
  CardContent,
  Button,
  CardHeader,
  makeStyles,
  Divider,
} from '@material-ui/core';
import Link from '@components/Link';

initializeFirebase();

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 450,
    minHeight: 500,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  cardContent: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  desc: {
    margin: '1.5rem',
    fontWeight: 400,
  },
  button: {
    margin: '1rem 0',
    padding: '1.5rem',
    fontSize: '1.5rem',
  },
  owned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '1rem',
  },

  fadeEnterLeft: {
    opacity: 0,
    transform: 'translateX(-100%)',
    transition: 'opacity 500ms, transform 500ms',
  },
  fadeEnterRight: {
    opacity: 0,
    transform: 'translateX(100%)',
    transition: 'opacity 500ms, transform 500ms',
  },
  fadeEnterActive: {
    opacity: 1,
    transform: 'translateX(0%)',
  },

  fadeExit: {
    opacity: 1,
    transform: 'translateX(0%)',
  },
  fadeExitActiveLeft: {
    opacity: 0,
    transform: 'translateX(100%)',
    transition: 'opacity 500ms, transform 500ms',
  },
  fadeExitActiveRight: {
    opacity: 0,
    transform: 'translateX(-100%)',
    transition: 'opacity 500ms, transform 500ms',
  },
});

const HomePage: NextPage = () => {
  const { uid } = useAuth();
  const styles = useStyles();
  const [choice, setChoice] = useState<'join' | 'create'>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [ownedList, setOwnedList] = useState([]);
  const router = useRouter();

  const handleJoinSubmit = useCallback(
    (values: JoinListFormValues) => {
      router.push(`/${values.code}`).then();
    },
    [router]
  );

  const handleCreateSubmit = useCallback(
    async (values: CreateListFormValues) => {
      setFormLoading(true);

      firebase
        .functions()
        .httpsCallable('createList')({
          name: values.name,
          desc: values.desc,
        })
        .then((key) => {
          if (key && key.data) {
            setFormLoading(false);
            router.push(`/${key.data}`);
          }
        });
    },
    [router]
  );

  useEffect(() => {
    if (uid) {
      firebase
        .database()
        .ref()
        .child('lists')
        .orderByChild('owner')
        .equalTo(uid)
        .once('value')
        .then((snap) => {
          setOwnedList(snap.val());
        });
    }
  }, [uid]);

  let paperContent;
  switch (choice) {
    case 'join':
      paperContent = (
        <React.Fragment>
          <CardHeader
            action={
              <IconButton onClick={() => setChoice(null)}>
                <ArrowBackIcon />
              </IconButton>
            }
            title={'Rejoindre une liste'}
            className={styles.cardHeader}
          />
          <CardContent className={styles.cardContent}>
            {ownedList && (
              <React.Fragment>
                <div className={styles.owned}>
                  <Typography variant={'h4'}>Reprendre mes listes</Typography>
                  {Object.entries(ownedList).map(([key, list]) => (
                    <Link href={`/${key}`}>{list.name}</Link>
                  ))}
                </div>
                <Divider
                  // variant={'fullWidth'}
                  orientation={'horizontal'}
                  style={{ margin: '0 auto 1.5rem auto', width: '50%' }}
                />
              </React.Fragment>
            )}
            <JoinListForm onSubmit={handleJoinSubmit} />
          </CardContent>
        </React.Fragment>
      );
      break;

    case 'create':
      paperContent = (
        <React.Fragment>
          <CardHeader
            action={
              <IconButton onClick={() => setChoice(null)}>
                <ArrowBackIcon />
              </IconButton>
            }
            title={'Créer une liste'}
            className={styles.cardHeader}
          />
          <CardContent className={styles.cardContent}>
            <CreateListForm
              onSubmit={handleCreateSubmit}
              loading={formLoading}
            />
          </CardContent>
        </React.Fragment>
      );
      break;

    default:
      paperContent = (
        <React.Fragment>
          <CardHeader
            title={'De quelle humeur êtes-vous ?'}
            className={styles.cardHeader}
          />
          <CardContent className={styles.cardContent}>
            <Button
              variant={'outlined'}
              className={styles.button}
              onClick={() => setChoice('create')}
              fullWidth>
              Créer une liste
            </Button>
            <Button
              variant={'outlined'}
              className={styles.button}
              onClick={() => setChoice('join')}
              fullWidth>
              Rejoindre une liste
            </Button>
          </CardContent>
        </React.Fragment>
      );
      break;
  }

  return (
    <Layout disableHomepageButton>
      <Typography variant={'h1'}>
        Bienvenue sur{' '}
        <MUILink href="https://fast-waiting-list.vercel.app">
          Fast Waiting List
        </MUILink>
      </Typography>

      <Typography variant={'h3'} className={styles.desc}>
        Commencez par créer une liste d'attente ou rejoignez-en une
      </Typography>

      <Card>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={choice}
            // @ts-ignore
            addEndListener={(node: any, done: () => void) => {
              node.addEventListener('transitionend', done, false);
            }}
            classNames={{
              enter: !choice ? styles.fadeEnterLeft : styles.fadeEnterRight,
              enterActive: styles.fadeEnterActive,
              exit: styles.fadeExit,
              exitActive: !choice
                ? styles.fadeExitActiveRight
                : styles.fadeExitActiveLeft,
            }}>
            <div className={styles.card}>{paperContent}</div>
          </CSSTransition>
        </SwitchTransition>
      </Card>
    </Layout>
  );
};

export default HomePage;
