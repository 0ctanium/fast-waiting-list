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
import { AppError } from '@errors/AppError';

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
  const [dataMap, setDataMap] = useState(null);
  const [dataState, setDataState] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const data = useMemo<Waiter[]>(
    () =>
      dataMap && dataState
        ? Object.keys(dataMap).reduce((acc, key) => {
            if (typeof dataState[key]?.index === 'number') {
              acc[dataState[key].index] = {
                ...dataState[key],
                ...dataMap[key],
                uid: key,
              };
            }

            return acc;
          }, [])
        : null,
    [dataMap, dataState]
  );
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
          audio.src = '/static/audio/notification.mp3';
          audio.play();
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

      const newItems: Waiter[] = items.filter(Boolean);

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

    const dataRef = listRef.child('data');
    const stateRef = listRef.child('dataState');

    // TODO: User blacklist
    // listRef
    //   .child('blacklist')
    //   .child(uid)
    //   .on('value', (snapshot) => {
    //     setBan((snapshot.exists() && snapshot.val()) || false);
    //   });

    dataRef.on('child_added', (snapshot) => {
      setDataMap((prevState) => ({
        ...prevState,
        [snapshot.key]: snapshot.val(),
      }));
    });

    dataRef.on('child_changed', (snapshot) => {
      setDataMap(({ ...prevState }) => ({
        ...prevState,
        [snapshot.key]: snapshot.val(),
      }));
    });

    dataRef.on('child_removed', (snapshot) => {
      setDataMap(({ ...prevState }) => {
        delete prevState[snapshot.key];

        return prevState;
      });
    });

    dataRef.once('value').then((snapshot) => {
      if (snapshot.exists()) {
        setDataMap(
          Object.entries(snapshot.val()).reduce(
            (acc, [key, val]) => ({
              ...acc,
              [key]: val,
            }),
            {}
          )
        );
      }
    });

    stateRef.on('child_added', (snapshot) => {
      setDataState((prevState) => ({
        ...prevState,
        [snapshot.key]: snapshot.val(),
      }));
    });

    stateRef.on('child_changed', (snapshot) => {
      setDataState(({ ...prevState }) => ({
        ...prevState,
        [snapshot.key]: snapshot.val(),
      }));
    });

    stateRef.on('child_removed', (snapshot) => {
      setDataState(({ ...prevState }) => {
        delete prevState[snapshot.key];

        return prevState;
      });
    });

    stateRef.once('value').then((snapshot) => {
      if (snapshot.exists()) {
        setDataState(
          Object.entries(snapshot.val()).reduce(
            (acc, [key, val]) => ({
              ...acc,
              [key]: val,
            }),
            {}
          )
        );
      }
    });

    return function cleanup() {
      dataRef.off();
      stateRef.off();
      listRef.off();
    };
  }, [props.list.id, uid]);

  return (
    <Layout>
      <div className={styles.title}>
        <h1>{props.list.name}</h1>
        <div className={styles.invite}>
          <Tooltip text={'Inviter des personnes'}>
            <button
              onClick={() => {
                copy(props.list.id);
              }}>
              <MdPersonAdd />
            </button>
          </Tooltip>
        </div>
      </div>

      <p className={styles.description}>{props.list.desc}</p>

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
            {formLoading ? <LoadingSpinner /> : "Rejoindre la liste d'attente"}
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
                      borderRadius: 12,
                      boxShadow: '0 0 6px 3px rgba(0, 0, 0, 0.3)',
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
                                  style={{ marginRight: 12, cursor: 'grab' }}>
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
                                      onClick={handleLeaveWaiter(waiter.uid)}>
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

  if (!snap.exists()) throw new AppError(404, `La liste n'existe pas`);

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
