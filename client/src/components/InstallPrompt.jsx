import { useState, useEffect } from 'react';
import { Icon } from './Icon';

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  useEffect(() => {
    if (isInStandaloneMode) return;
    if (localStorage.getItem('waaah_install_dismissed')) return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIOS) {
      const t = setTimeout(() => setShow(true), 30000);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isInStandaloneMode, isIOS]);

  const handleDismiss = () => {
    localStorage.setItem('waaah_install_dismissed', 'true');
    setShow(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted install');
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 88, left: 16, right: 16,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      padding: '20px 20px 16px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.9)',
      zIndex: 999,
      animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src="/icons/icon-72.png" alt="Waaah"
            style={{ width: 44, height: 44, borderRadius: 12 }} />
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16, letterSpacing: 1,
              textTransform: 'uppercase', color: '#1a1a1a',
            }}>
              ADD TO HOME SCREEN
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400, fontSize: 12,
              color: 'rgba(0,0,0,0.45)', marginTop: 2,
            }}>
              Use Waaah like a native app
            </div>
          </div>
        </div>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none',
          cursor: 'pointer', padding: 4,
          color: 'rgba(0,0,0,0.3)',
        }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      {isIOS ? (
        <div style={{
          background: 'rgba(0,0,0,0.04)',
          borderRadius: 14, padding: '12px 14px',
          fontFamily: 'var(--font-body)',
          fontSize: 13, color: 'rgba(0,0,0,0.6)',
          lineHeight: 1.6,
        }}>
          Tap the <strong>Share button</strong> in Safari,
          then tap <strong>"Add to Home Screen"</strong>
        </div>
      ) : (
        <button onClick={handleInstall} style={{
          width: '100%',
          background: '#FF6B6B',
          border: 'none', borderRadius: 14,
          padding: '13px 0', cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: 15, letterSpacing: 2,
          textTransform: 'uppercase', color: 'white',
        }}>
          INSTALL APP
        </button>
      )}
    </div>
  );
}
