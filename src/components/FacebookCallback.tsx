// src/components/FacebookCallback.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFacebook } from '../lib/hooks';

type Props = {
  onDone: () => void;
  onError?: () => void;
};

function readParamsOnce() {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get('code') || '',
    state: params.get('state') || '',
    error: params.get('error') || '',
    errorDescription: params.get('error_description') || '',
  };
}

export function FacebookCallback({ onDone, onError }: Props) {
  const navigate = useNavigate();
  const { completeConnect } = useFacebook();
  const [message, setMessage] = useState('Connecting your Facebook Page...');

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const { code, state, error, errorDescription } = readParamsOnce();

        window.history.replaceState({}, '', window.location.pathname);

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Missing OAuth parameters. Please try connecting again.');
        }

        await completeConnect({ code, state });
        if (cancelled) return;

        setMessage('Connected! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
          onDone();
        }, 1000);
      } catch (e: any) {
        if (cancelled) return;
        setMessage(e?.message || 'Failed to connect Facebook. Please try again.');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
          onError?.();
        }, 2000);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [completeConnect, navigate, onDone, onError]);

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
