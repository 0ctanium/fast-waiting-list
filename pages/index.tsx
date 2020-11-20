import React, {
  useCallback,
  useState,
  ButtonHTMLAttributes,
  useEffect,
} from 'react';
import { NextPage } from 'next';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import Layout from '@components/Layout/Layout';
import Button from '@components/Button/Button';
import BackIcon from '@icons/Back';
import CreateListForm, {
  CreateListFormValues,
} from '@components/Form/CreateList';
import JoinListForm, { JoinListFormValues } from '@components/Form/Join';
import { initializeFirebase } from '@services/firebase/client';

import styles from '@styles/Home.module.css';
import firebase from 'firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@hooks/useAuth';

initializeFirebase();

const HomePage: NextPage = () => {
  const { uid } = useAuth();
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

  return (
    <Layout>
      <h1 className={styles.title}>
        Bienvenue sur{' '}
        <a href="https://fast-waiting-list.vercel.app">Fast Wait List</a>
      </h1>

      <p className={styles.description}>
        Commencez par créer une liste d'attente ou rejoignez-en une
      </p>

      <div className={styles.card}>
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
            {choice ? (
              choice === 'join' ? (
                <div className={styles.cardContainer}>
                  <div className={styles.cardHeader}>
                    <h3>Rejoindre une liste</h3>
                    <BackButton onClick={() => setChoice(null)} />
                  </div>
                  <div className={styles.cardContent}>
                    {ownedList && (
                      <div className={styles.ownedLists}>
                        <h4>Reprendre mes listes</h4>
                        {Object.entries(ownedList).map(([key, list]) => (
                          <Link href={`/${key}`}>{list.name}</Link>
                        ))}
                      </div>
                    )}
                    <JoinListForm onSubmit={handleJoinSubmit} />
                  </div>
                </div>
              ) : choice === 'create' ? (
                <div className={styles.cardContainer}>
                  <div className={styles.cardHeader}>
                    <h3>Créer une liste</h3>
                    <BackButton onClick={() => setChoice(null)} />
                  </div>
                  <div className={styles.cardContent}>
                    <CreateListForm
                      onSubmit={handleCreateSubmit}
                      loading={formLoading}
                    />
                  </div>
                </div>
              ) : null
            ) : (
              <div className={styles.cardContainer}>
                <div className={styles.cardHeader}>
                  <h3>De quelle humeur êtes-vous ?</h3>
                </div>
                <div className={styles.cardContent}>
                  <Button fullWidth onClick={() => setChoice('create')}>
                    Créer une liste
                  </Button>
                  <div className={styles.divider} />
                  <Button fullWidth onClick={() => setChoice('join')}>
                    Rejoindre une liste
                  </Button>
                </div>
              </div>
            )}
          </CSSTransition>
        </SwitchTransition>
      </div>
    </Layout>
  );
};

const BackButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => {
  return (
    <button {...props} className={styles.backButton}>
      <BackIcon />
    </button>
  );
};

export default HomePage;
