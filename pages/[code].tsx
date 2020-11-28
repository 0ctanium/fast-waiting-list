import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import Layout from '@components/Layout/Layout';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { initializeFirebase } from '@services/firebase/client';
import firebase from 'firebase';

import styles from '@styles/List.module.css';
import Input from '@components/Form/Input/Input';
import { useAuth } from '@hooks/useAuth';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  MdClose,
  MdExitToApp,
  MdDragHandle,
  MdPersonAdd,
} from 'react-icons/md';
import Tooltip from '@components/Tooltip/Tooltip';
import LoadingSpinner from '@icons/Loading';
import copy from 'copy-to-clipboard';
import { useNotifications } from '@hooks/useNotifications';
import Head from 'next/head';
initializeFirebase();

type Waiter = {
  name: string;
  index: number;
  checked: boolean;
  banned: boolean;
  uid: string;
};

const ListPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = (
  props
) => {
  const { uid } = useAuth();
  const [name, setName] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Waiter[]>(null);
  const { notify } = useNotifications();

  const current = useMemo(
    () => data && data.find((item) => item && item.uid === uid),
    [data, uid]
  );

  const prevCurrentRef = useRef<Waiter>();
  useEffect(() => {
    prevCurrentRef.current = current;
  });
  const prevCurrent = prevCurrentRef.current;
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    window.addEventListener(
      'click',
      function onFirstTouch() {
        if (!audio) {
          const newAudio = new Audio();
          setAudio(newAudio);

          newAudio.play().catch();
          window.removeEventListener('click', onFirstTouch, false);
        }
      },
      false
    );
  }, [audio]);

  useEffect(() => {
    if (current && prevCurrent) {
      if (current.checked !== prevCurrent.checked) {
        if (current.checked) {
          const notification = audio || new Audio();

          notification.src = '/static/audio/notification.mp3';
          notification.play();
        }
      }
    }
  }, [audio, current, prevCurrent]);

  const currentIndex = useMemo(
    () =>
      data &&
      current &&
      data.findIndex((item) => item && item.uid === current.uid),
    [current, data]
  );
  const uncheckedPeople = useMemo(
    () =>
      (data &&
        data.filter((item) => {
          if (!item) return false;
          return !item.checked;
        })) ||
      [],
    [data]
  );
  const beforePeople = useMemo(
    () =>
      uncheckedPeople.filter((item, i) => {
        return i < currentIndex;
      }).length,
    [currentIndex, uncheckedPeople]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setName(value);
  }, []);

  const handleJoinWaiters = useCallback(
    (e) => {
      e.preventDefault();
      setFormLoading(true);

      firebase
        .functions()
        .httpsCallable('joinList')({
          name: name,
          id: props.list.id,
        })
        .then(() => {
          setFormLoading(false);
        });
    },
    [name, props.list.id]
  );

  const handleLeaveWaiter = useCallback(
    (key = uid) => async () => {
      await firebase
        .database()
        .ref()
        .child('lists')
        .child(props.list.id)
        .child('data')
        .child(key)
        .remove();
    },
    [props.list.id, uid]
  );

  const handleCheckWaiter = useCallback(
    (key: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      await firebase
        .database()
        .ref()
        .child('lists')
        .child(props.list.id)
        .child('dataState')
        .child(key)
        .update({
          checked: !!e.target.checked,
        });
    },
    [props.list.id]
  );

  const handleNext = useCallback(async () => {
    if (uncheckedPeople.length > 0) {
      await firebase
        .database()
        .ref()
        .child('lists')
        .child(props.list.id)
        .child('dataState')
        .child(uncheckedPeople[0].uid)
        .update({
          checked: true,
        });
    }
  }, [props.list.id, uncheckedPeople]);

  //  TODO: Ban management
  // const handleBanWaiter = useCallback(
  //   (key: string) => async () => {
  //     await firebase
  //       .database()
  //       .ref()
  //       .child('lists')
  //       .child(props.list.id)
  //       .child('blacklist')
  //       .update({
  //         [key]: true,
  //       });
  //   },
  //   [props.list.id]
  // );

  const onDragEnd = useCallback(
    async (result) => {
      // dropped outside the list
      if (!result.destination) {
        return;
      }

      const items = Array.from(data);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);

      const newItems: Waiter[] = items.filter(Boolean) as Waiter[];

      const newData = newItems.reduce(
        (acc, { uid, name, ...curr }, i) => ({
          ...acc,
          [uid]: {
            ...curr,
            index: i,
          },
        }),
        {}
      );

      await firebase
        .database()
        .ref()
        .child('lists')
        .child(props.list.id)
        .child('dataState')
        .set(newData);
    },
    [data, props.list.id]
  );

  useEffect(() => {
    const listRef = firebase
      .database()
      .ref()
      .child('lists')
      .child(props.list.id);

    listRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();

        if (val.data && val.dataState) {
          setData(
            Object.keys(val.data).reduce((acc, key) => {
              if (typeof val.dataState[key]?.index === 'number') {
                acc[val.dataState[key].index] = {
                  ...val.dataState[key],
                  ...val.data[key],
                  uid: key,
                };
              }

              return acc;
            }, [])
          );
        }
      }
    });

    return function cleanup() {
      listRef.off();
    };
  }, [props.list.id, uid]);

  useEffect(() => {
    setLoading(data === null);
  }, [data]);

  return (
    <Layout>
      <Head>
        <title>{props.list.name} - Fast Wait list</title>
      </Head>
      <div className={styles.title}>
        <h1>{props.list.name}</h1>
        <div className={styles.invite}>
          <Tooltip text={'Inviter des personnes'}>
            <button
              onClick={() => {
                notify({ text: 'Le code de la liste a été copié !' });
                copy(process.env.NEXT_PUBLIC_HOSTNAME + props.list.id);
              }}>
              <MdPersonAdd />
            </button>
          </Tooltip>
        </div>
      </div>

      <p className={styles.description}>{props.list.desc}</p>

      {isLoading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
        <React.Fragment>
          {!current && props.list.owner !== uid ? (
            <form className={styles.joinForm}>
              <Input
                label={'Votre nom'}
                name={'name'}
                id={'name'}
                type={'text'}
                value={name}
                onChange={handleChange}
                color={'#fff'}
                className={styles.joinInput}
                required
              />
              <button onClick={handleJoinWaiters} className={styles.button}>
                {formLoading ? (
                  <LoadingSpinner />
                ) : (
                  "Rejoindre la liste d'attente"
                )}
              </button>
            </form>
          ) : (
            current && (
              <h4>
                {current.checked
                  ? 'Tu as réussi à passer, Bravo !'
                  : beforePeople === 0
                  ? `Tu y es presque, tu es le prochain sur la liste !`
                  : `Attend encore un peu, il reste ${beforePeople} personne${
                      beforePeople > 1 ? 's' : ''
                    } devant toi !`}
              </h4>
            )
          )}

          {props.list.owner === uid && (
            <div className={styles.info}>
              {data &&
                data.length > 0 &&
                (uncheckedPeople.length > 0 ? (
                  <>
                    <div className={styles.actions}>
                      <Tooltip text={'Passer à la personne suivant'}>
                        <button className={styles.button} onClick={handleNext}>
                          Au suivant !
                        </button>
                      </Tooltip>
                    </div>
                    <div className={styles.stats}>
                      <h4>Personne suivante: {uncheckedPeople[0].name} </h4>
                    </div>
                  </>
                ) : (
                  <h3>Bravo, tu as terminé la liste !</h3>
                ))}
            </div>
          )}

          {!data || data.length === 0 ? (
            <h3>Il n'y a personne pour le moment..</h3>
          ) : null}

          <div>
            {data &&
              (props.list.owner === uid ? (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        className={styles.list}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver
                            ? 'lightblue'
                            : '#eaeaea',
                        }}>
                        {Object.entries(data).map(
                          ([key, waiter]) =>
                            waiter.name &&
                            typeof waiter.index === 'number' && (
                              <Draggable
                                key={key}
                                draggableId={key}
                                index={waiter.index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    key={key}
                                    className={styles.listItem}
                                    style={{
                                      ...provided.draggableProps.style,
                                      background: snapshot.isDragging
                                        ? 'lightgreen'
                                        : 'grey',
                                    }}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}>
                                    <span
                                      style={{
                                        marginRight: 12,
                                        cursor: 'grab',
                                      }}>
                                      <MdDragHandle />
                                    </span>
                                    <input
                                      className={styles.listItemCheck}
                                      type={'checkbox'}
                                      name={'checked'}
                                      value={''}
                                      checked={waiter.checked}
                                      onChange={handleCheckWaiter(waiter.uid)}
                                    />
                                    <span
                                      className={styles.listItemTitle}
                                      style={{
                                        textDecoration:
                                          waiter.checked && 'line-through',
                                      }}>
                                      {waiter.name}
                                    </span>
                                    <div className={styles.listItemActions}>
                                      {waiter.uid === uid && (
                                        <Tooltip
                                          text={"Quitter la liste d'attente"}>
                                          <button onClick={handleLeaveWaiter()}>
                                            <MdExitToApp />
                                          </button>
                                        </Tooltip>
                                      )}

                                      <Tooltip text={'Retirer de la liste'}>
                                        <button
                                          onClick={handleLeaveWaiter(
                                            waiter.uid
                                          )}>
                                          <MdClose />
                                        </button>
                                      </Tooltip>

                                      {/* TODO: Ban management /*/}
                                      {/*<button onClick={handleBanWaiter(key)}>*/}
                                      {/*  <MdBlock />*/}
                                      {/*</button>*/}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            )
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className={styles.list}>
                  {Object.entries(data).map(
                    ([key, waiter]) =>
                      waiter.name &&
                      typeof waiter.index === 'number' && (
                        <div key={key} className={styles.listItem}>
                          <span
                            className={styles.listItemTitle}
                            style={{
                              textDecoration: waiter.checked && 'line-through',
                            }}>
                            {waiter.name}
                          </span>
                          <div className={styles.listItemActions}>
                            {waiter.uid === uid && (
                              <Tooltip text={"Quitter la liste d'attente"}>
                                <button onClick={handleLeaveWaiter()}>
                                  <MdExitToApp />
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      )
                  )}
                </div>
              ))}
          </div>
        </React.Fragment>
      )}
    </Layout>
  );
};

export type ListPageProps = {
  list: List;
};

export type List = {
  id: string;
  name: string;
  desc: string;
  owner: string;
};

export const getStaticProps: GetStaticProps<ListPageProps> = async (
  context
) => {
  const listID = context.params.code as string;

  const snap = await firebase
    .database()
    .ref('lists')
    .child(listID)
    .once('value');

  if (!snap.exists()) {
    return {
      notFound: true,
    };
  }

  const { owner, name, desc } = snap.val() as List;

  return {
    props: {
      list: {
        owner,
        name,
        desc: desc || '',
        id: snap.key,
      },
    },
    revalidate: 300,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const snap = await firebase.database().ref('lists').once('value');

  return {
    paths: Object.keys(snap.val()).map((key) => ({ params: { code: key } })),
    fallback: 'blocking',
  };
};

export default ListPage;
