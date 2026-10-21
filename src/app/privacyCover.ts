import { useEffect, useState } from 'react';

const STORAGE_KEY = 'progreso-sobrio:hide-on-leave';

function getHideOnLeave(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Pantalla de privacidad (el ojo tachado): tapa toda la app con una pantalla
 * neutra. Con "tapar al salir", se tapa sola cada vez que la app pasa a
 * segundo plano, y también arranca tapada. La preferencia vive en
 * localStorage, como el tema: se lee sin esperar a la base, así la app no
 * alcanza a mostrarse antes de taparse.
 */
export function usePrivacyCover() {
  const [hideOnLeave, setHideOnLeave] = useState(getHideOnLeave);
  const [covered, setCovered] = useState(getHideOnLeave);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(hideOnLeave));
  }, [hideOnLeave]);

  useEffect(() => {
    if (!hideOnLeave) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') setCovered(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hideOnLeave]);

  return {
    covered,
    cover: () => setCovered(true),
    uncover: () => setCovered(false),
    hideOnLeave,
    setHideOnLeave,
  };
}
