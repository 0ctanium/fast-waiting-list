import styles from './Footer.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import { MdPerson } from 'react-icons/md';
import { useAuth } from '@hooks/useAuth';
import copy from 'copy-to-clipboard';
import Tooltip from '@components/Tooltip/Tooltip';
import { useNotifications } from '@hooks/useNotifications';

const Footer: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(null);
  const { uid } = useAuth();
  const { notify } = useNotifications();

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
    notify({ text: 'Votre identifiant a été copié !' });
    copy(uid);
  }, [notify, uid]);

  return (
    <footer className={styles.footer}>
      <Tooltip
        text={`Votre identifiant est: ${uid}`}
        direction={{ vertical: 'top', horizontal: 'left' }}>
        <button onClick={copyUID} className={styles.uid}>
          <MdPerson />
        </button>
      </Tooltip>
      <div className={styles.credit}>
        <a
          href="https://github.com/0ctanium"
          target="_blank"
          rel="noopener noreferrer">
          Créé par <span style={{ color: '#0070f3' }}>Octanium</span>
        </a>
      </div>
      <button onClick={handleTheme}>
        {theme === 'dark' ? 'Theme clair' : 'Theme sombre'}
      </button>
    </footer>
  );
};

export default Footer;
