import { useEffect, useState } from 'react';

const installButtonStyles = {
  padding: '10px 18px',
  borderRadius: '999px',
  border: 'none',
  background: 'linear-gradient(145deg, #ff7eb3, #ff758c)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
  alignSelf: 'flex-start'
};

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Captura el evento antes de que el navegador muestre su prompt nativo.
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsVisible(true);
    };

    // Oculta el botón si la app ya se instaló o si el usuario la instala desde el prompt.
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      console.log('[PWA] Aplicación instalada');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Muestra el prompt custom del navegador.
    deferredPrompt.prompt();

    try {
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Resultado del prompt: ${outcome}`);
    } catch (error) {
      console.error('[PWA] Error al solicitar la instalación', error);
    } finally {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <button type="button" onClick={handleInstallClick} className="pwa-install-btn" style={installButtonStyles}>
      Instalar app
    </button>
  );
};

export default InstallPWAButton;
