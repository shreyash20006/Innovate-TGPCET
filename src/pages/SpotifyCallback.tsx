import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, CheckCircle, XCircle } from 'lucide-react';

/**
 * SpotifyCallback — handles https://innovate-tgpcet.vercel.app/callback
 *
 * Spotify redirects here with ?code=... after the user authorises the app.
 * This page POSTs the code to /api/spotify/token, stores the returned
 * sessionId in sessionStorage, then navigates to /music-hub.
 */
export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Spotify…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code  = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      setStatus('error');
      setMessage(error === 'access_denied' ? 'You cancelled the login.' : 'Spotify authentication failed.');
      setTimeout(() => navigate('/music-hub', { replace: true }), 3000);
      return;
    }

    // Exchange code → session via backend
    fetch('/api/spotify/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.accessToken) {
          // Store the actual Spotify access token — sent as Bearer on all API calls
          sessionStorage.setItem('spotify_token', data.accessToken);
          sessionStorage.setItem('spotify_token_expires', String(Date.now() + (data.expiresIn || 3600) * 1000));
          window.dispatchEvent(new CustomEvent('spotify-session-ready', { detail: data.accessToken }));
          setStatus('success');
          setMessage('Connected! Redirecting…');
          setTimeout(() => navigate('/music-hub', { replace: true }), 1200);
        } else {
          throw new Error(data.error || 'No access token received');
        }
      })
      .catch(err => {
        console.error('Spotify callback error:', err);
        setStatus('error');
        setMessage('Could not connect to Spotify. Please try again.');
        setTimeout(() => navigate('/music-hub', { replace: true }), 3000);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 rounded-3xl max-w-sm w-full mx-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Spotify Logo */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: '#1DB954' }}>
          <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.214c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.856zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.97-.519.781.781 0 01.52-.971c3.632-1.102 8.147-.568 11.23 1.328a.78.78 0 01.257 1.071zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
          </svg>
        </div>

        {/* Status icon */}
        {status === 'loading' && (
          <div className="flex justify-center mb-4">
            {[0, 1, 2, 3].map(i => (
              <motion.div key={i}
                className="w-2 h-2 rounded-full mx-1"
                style={{ background: '#1DB954' }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
        {status === 'success' && <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-4" />}
        {status === 'error'   && <XCircle   className="w-10 h-10 text-red-400  mx-auto mb-4" />}

        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {status === 'loading' ? 'Connecting Spotify' : status === 'success' ? 'Connected!' : 'Connection Failed'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      </motion.div>
    </div>
  );
}
