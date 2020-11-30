import React, { useCallback, useEffect, useState } from 'react';
import { Person as PersonIcon } from '@material-ui/icons';
import { useAuth } from '@hooks/useAuth';
import copy from 'copy-to-clipboard';
import {
  Button,
  IconButton,
  makeStyles,
  Tooltip,
  Link as MuiLink,
  Theme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderTop: '1px solid #eaeaea',
  },
  credit: {
    flexGrow: 1,
    textAlign: 'center',
  },
  theme: {
    background: 'none',
    '&:hover': {
      color: theme.palette.primary.main,
      background: 'none',
    },
  },
}));

const Footer: React.FC = () => {
  const styles = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [theme, setTheme] = useState<'light' | 'dark'>(null);
  const { uid } = useAuth();

  useEffect(() => {
    let theme = localStorage.getItem('theme');

    if (!theme) {
      theme =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

      localStorage.setItem('theme', theme);
    }

    setTheme(theme as 'light' | 'dark');

    function handleThemeChange(event?: StorageEvent) {
      let newTheme: string;
      if (event && event.key && event.key === 'theme' && event.newValue) {
        newTheme = event.newValue;
      }
      if (!newTheme) {
        newTheme = window.localStorage.getItem('theme');
      }

      if (newTheme) {
        setTheme(newTheme as 'light' | 'dark');
      }
    }

    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('theme', theme || 'light');
  }, [theme]);

  const handleTheme = useCallback(() => {
    setTheme((prevState) => {
      const newTheme = prevState === 'light' ? 'dark' : 'light';

      localStorage.setItem('theme', newTheme);

      const event = document.createEvent('StorageEvent');
      // @ts-ignore
      event.initStorageEvent(
        'storage',
        false,
        false,
        'key',
        prevState,
        newTheme,
        process.env.HOSTNAME,
        window.localStorage
      );
      window.dispatchEvent(event);

      return newTheme;
    });
  }, []);

  const copyUID = useCallback(() => {
    enqueueSnackbar('Votre identifiant a été copié !');
    copy(uid);
  }, [enqueueSnackbar, uid]);

  return (
    <footer className={styles.root}>
      <Tooltip title={`Votre identifiant est: ${uid}`}>
        <IconButton onClick={copyUID}>
          <PersonIcon />
        </IconButton>
      </Tooltip>
      <div className={styles.credit}>
        <MuiLink
          href="https://github.com/0ctanium"
          target="_blank"
          rel="noopener noreferrer">
          Créé par <span style={{ color: '#0070f3' }}>Octanium</span>
        </MuiLink>
      </div>
      <Button onClick={handleTheme} variant={'text'} className={styles.theme}>
        {theme === 'dark' ? 'Theme clair' : 'Theme sombre'}
      </Button>
    </footer>
  );
};

export default Footer;
