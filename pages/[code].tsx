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

import { useAuth } from '@hooks/useAuth';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  Close as CloseIcon,
  ExitToApp as ExitToAppIcon,
  DragHandle as DragHandleIcon,
  PersonAdd as PersonAddIcon,
} from '@material-ui/icons';
import LoadingSpinner from '@icons/Loading';
import copy from 'copy-to-clipboard';
import Head from 'next/head';
import {
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  ListItemText,
  Card,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
initializeFirebase();

type Waiter = {
  name: string;
  index: number;
  checked: boolean;
  banned: boolean;
  uid: string;
};

const useStyles = makeStyles({
  title: {
    position: 'relative',
    textAlign: 'center',
  },
  desc: {
    margin: '1.5rem',
    fontWeight: 400,
  },
  invite: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translate(100%, -50%)',
  },
  form: {
    display: 'flex',
    marginBottom: '1rem',
  },
  input: {
    flexGrow: 1,
    marginRight: 12,
  },
  submit: {
    fontSize: '1rem',
    minWidth: 0,
  },
  infos: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: '1.5rem',
    width: 450,
  },
  list: {
    transition: 'background-color 120ms',
  },
  drag: {
    marginRight: 12,
    cursor: 'grab',
  },
  check: {
    padding: 0,
    marginRight: 12,
  },
});

const ListPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = (
  props
) => {
  const styles = useStyles();
  const { uid } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Waiter[]>(null);

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
        } else {
          setData([]);
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
        <Typography variant={'h1'}>{props.list.name}</Typography>
        {props.list.owner === uid && (
          <div className={styles.invite}>
            <Tooltip title={'Inviter des personnes'}>
              <IconButton
                onClick={() => {
                  enqueueSnackbar(`Le lien d'accès la liste a été copié !`);
                  copy(process.env.NEXT_PUBLIC_HOSTNAME + props.list.id);
                }}>
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>

      <Typography variant={'h3'} className={styles.desc}>
        {props.list.desc}
      </Typography>

      {isLoading ? (
        <div>
          <LoadingSpinner />
        </div>
      ) : (
        <React.Fragment>
          {props.list.owner === uid ? (
            <div className={styles.infos}>
              {data &&
                data.length > 0 &&
                (uncheckedPeople.length > 0 ? (
                  <React.Fragment>
                    <Tooltip title={'Passer à la personne suivant'}>
                      <Button variant={'outlined'} onClick={handleNext}>
                        Au suivant !
                      </Button>
                    </Tooltip>
                    <Divider
                      orientation={'vertical'}
                      flexItem
                      style={{ margin: '0 1rem' }}
                    />
                    <Typography variant={'h4'}>
                      Personne suivante: {uncheckedPeople[0].name}{' '}
                    </Typography>
                  </React.Fragment>
                ) : (
                  <Typography variant={'h4'}>
                    Bravo, la liste est terminée !
                  </Typography>
                ))}
            </div>
          ) : !current ? (
            <form className={styles.form}>
              <TextField
                label={'Votre nom'}
                name={'name'}
                id={'name'}
                type={'text'}
                value={name}
                onChange={handleChange}
                className={styles.input}
                variant={'outlined'}
                required
              />
              <Button
                onClick={handleJoinWaiters}
                variant={'outlined'}
                className={styles.submit}>
                {formLoading ? (
                  <LoadingSpinner />
                ) : (
                  "Rejoindre la liste d'attente"
                )}
              </Button>
            </form>
          ) : (
            <Typography variant={'h5'} style={{ fontWeight: 600 }}>
              {current.checked
                ? 'Tu as réussi à passer, Bravo !'
                : beforePeople === 0
                ? `Tu y es presque, tu es le prochain sur la liste !`
                : `Attend encore un peu, il reste ${beforePeople} personne${
                    beforePeople > 1 ? 's' : ''
                  } devant toi !`}
            </Typography>
          )}

          {!data || data.length === 0 ? (
            <Typography variant={'h3'}>
              Il n'y a personne pour le moment..
            </Typography>
          ) : (
            <Card className={styles.card}>
              {props.list.owner === uid ? (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <List
                        className={styles.list}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver && 'lightblue',
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
                                    style={{
                                      ...provided.draggableProps.style,
                                      background: snapshot.isDragging
                                        ? 'lightgreen'
                                        : 'grey',
                                    }}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}>
                                    <ListItem>
                                      <ListItemIcon>
                                        <DragHandleIcon
                                          className={styles.drag}
                                        />
                                        <Checkbox
                                          className={styles.check}
                                          name={'checked'}
                                          value={''}
                                          checked={!!waiter.checked}
                                          onChange={handleCheckWaiter(
                                            waiter.uid
                                          )}
                                          color={'primary'}
                                        />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={waiter.name}
                                        style={{
                                          textDecoration:
                                            !!waiter.checked && 'line-through',
                                        }}
                                      />
                                      <ListItemSecondaryAction>
                                        {waiter.uid === uid && (
                                          <Tooltip
                                            title={
                                              "Quitter la liste d'attente"
                                            }>
                                            <IconButton
                                              onClick={handleLeaveWaiter()}>
                                              <ExitToAppIcon />
                                            </IconButton>
                                          </Tooltip>
                                        )}

                                        <Tooltip title={'Retirer de la liste'}>
                                          <IconButton
                                            onClick={handleLeaveWaiter(
                                              waiter.uid
                                            )}>
                                            <CloseIcon />
                                          </IconButton>
                                        </Tooltip>

                                        {/* TODO: Ban management /*/}
                                        {/*<button onClick={handleBanWaiter(key)}>*/}
                                        {/*  <MdBlock />*/}
                                        {/*</button>*/}
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  </div>
                                )}
                              </Draggable>
                            )
                        )}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <List className={styles.list}>
                  {Object.entries(data).map(
                    ([key, waiter]) =>
                      waiter.name &&
                      typeof waiter.index === 'number' && (
                        <ListItem key={key}>
                          <ListItemText
                            style={{
                              textDecoration: waiter.checked && 'line-through',
                            }}>
                            {waiter.name}
                          </ListItemText>
                          <ListItemSecondaryAction>
                            {waiter.uid === uid && (
                              <Tooltip title={"Quitter la liste d'attente"}>
                                <IconButton onClick={handleLeaveWaiter()}>
                                  <ExitToAppIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                      )
                  )}
                </List>
              )}
            </Card>
          )}
        </React.Fragment>
      )}
    </Layout>
  );
};

export type ListPageProps = {
  list: ListProps;
};

export type ListProps = {
  id: string;
  name: string;
  desc: string;
  owner: string;
};

export const getStaticProps: GetStaticProps<ListPageProps> = async (
  context
) => {
  const listID = context.params.code as string;

  if (!/^[a-zA-Z0-9]{5,7}$/.test(listID)) {
    return {
      notFound: true,
    };
  }

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

  const { owner, name, desc } = snap.val() as ListProps;

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
