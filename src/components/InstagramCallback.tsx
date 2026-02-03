// src/components/InstagramCallback.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  onDone: () => void;
  onError?: () => void;
};

export function InstagramCallback({ onDone, onError }: Props) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Redirecting to dashboard...');

  // Prevent double-run in React 18 dev (StrictMode) + rerenders
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        // This route is no longer used as an OAuth redirect target.
        // OAuth callback now lands on the backend for security.
        window.history.replaceState({}, '', window.location.pathname);
        if (cancelled) return;
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
          onDone();
        }, 0);
      } catch (e: any) {
        if (cancelled) return;
        setMessage(e?.message || 'Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
          onError?.();
        }, 0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, onDone, onError]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-2xl font-semibold text-gray-900">Wallinst</div>
        <div className="mt-4 text-gray-600">{message}</div>
        <div className="mt-6 text-sm text-gray-400">You can close this tab after it finishes.</div>
      </div>
    </div>
  );
}