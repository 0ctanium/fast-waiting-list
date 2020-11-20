import styles from './Footer.module.css';
import React, { useCallback, useEffect, useState } from 'react';

const Footer: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(null);

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

  return (
    <footer className={styles.footer}>
      <a
        href="https://github.com/0ctanium"
        target="_blank"
        rel="noopener noreferrer">
        <p>
          Créé par <span style={{ color: '#0070f3' }}>Octanium</span>
        </p>
      </a>
      <button onClick={handleTheme}>
        {theme === 'dark' ? 'Theme clair' : 'Theme sombre'}
      </button>
    </footer>
  );
};

export default Footer;
