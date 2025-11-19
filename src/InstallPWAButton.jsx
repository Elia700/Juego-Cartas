import { useEffect, useState } from 'react';

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Guarda el evento para lanzarlo manualmente más adelante.
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      console.log('[PWA] Evento beforeinstallprompt capturado');
    };

    // Limpia el estado si la app se instaló fuera del botón.
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      console.log('[PWA] Aplicación instalada desde el navegador');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showManualInstallInstructions = () => {
    alert(
      [
        'Si ya instalaste la app, búscala en tu escritorio o menú de aplicaciones.',
        '',
        'Si aún no la instalaste:',
        '- En PC/Android: abre el menú del navegador y elige "Instalar app" o "Añadir a pantalla de inicio".',
        '- En iPhone: usa el botón Compartir y luego "Añadir a pantalla de inicio".'
      ].join('\n')
    );
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      try {
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Resultado del prompt: ${outcome}`);
      } catch (error) {
        console.error('[PWA] Error al lanzar el prompt de instalación', error);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      // Fallback con instrucciones claras para instalar manualmente.
      showManualInstallInstructions();
    }
  };

  return (
    <button type="button" onClick={handleInstallClick} className="install-btn">
      📲 Instalar app
    </button>
  );
};

export default InstallPWAButton;
