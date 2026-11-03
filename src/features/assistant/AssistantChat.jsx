import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCrosshairs, FaPaperPlane, FaRedo, FaTimes } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { t } from '../../content/strings';
import { askAssistant } from '../../services/assistantService';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { currentPosition, findPlace } from '../../services/marketService';
import ChatText from './ChatText';
import { OPEN_ASSISTANT_EVENT } from './openAssistant';
import './assistant.css';

const STORAGE_KEY = 'bazarBuddy.assistant';
const SUGGESTIONS = ['suggestOpenNow', 'suggestTomatoes', 'suggestPrices', 'suggestTrack'];

// The conversation survives page changes within the tab, not across visits.
const load = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) || { messages: [], location: null };
  } catch {
    return { messages: [], location: null };
  }
};

const save = (state) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: the chat still works for this page.
  }
};

const errorText = (err) => {
  if (err.code === 'not_configured') return t('assistantNotSetUp');
  if (err.code === 'busy') return t('assistantBusy');
  return t('assistantError');
};

// Chat panel on every shop screen. Opened from the side navbar (desktop and the
// phone menu) or, on phones, a floating button.
const AssistantChat = () => {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [{ messages, location }, setState] = useState(load);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => save({ messages, location }), [messages, location]);

  // Opened from the side navbar or the phone menu.
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_ASSISTANT_EVENT, show);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages, pending, error, open]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || pending) return;
    const next = [...messages, { role: 'user', content }];
    setState((s) => ({ ...s, messages: next }));
    setDraft('');
    setError('');
    setPending(true);
    try {
      const { reply } = await askAssistant({ messages: next, location });
      setState((s) => ({ ...s, messages: [...next, { role: 'assistant', content: reply }] }));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  };

  const shareLocation = async () => {
    setLocating(true);
    setError('');
    try {
      const point = await currentPosition();
      const area = await findPlace(point).catch(() => null);
      setState((s) => ({ ...s, location: { lat: point.lat, lng: point.lng, label: area?.label || '' } }));
    } catch (err) {
      setError(err.message === 'denied' ? t('errLocationDenied') : t('errLocationUnavailable'));
    } finally {
      setLocating(false);
    }
  };

  const reset = () => {
    setState({ messages: [], location });
    setError('');
  };

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-label={t('assistantTitle')}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="assistant-head">
            <span className="assistant-avatar" aria-hidden="true"><HiSparkles /></span>
            <div>
              <h2>{t('assistantTitle')}</h2>
              <p className="small">{t('assistantTagline')}</p>
            </div>
            {messages.length > 0 && (
              <button type="button" className="icon-btn" onClick={reset} aria-label={t('assistantNewChat')} title={t('assistantNewChat')}>
                <FaRedo aria-hidden="true" />
              </button>
            )}
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t('close')}>
              <FaTimes aria-hidden="true" />
            </button>
          </header>

          <div className="assistant-body" aria-live="polite">
            {!messages.length && (
              <div className="assistant-welcome">
                <p>{t('assistantWelcome')}</p>
                <div className="assistant-suggestions">
                  {SUGGESTIONS.map((key) => (
                    <button key={key} type="button" className="chip" onClick={() => send(t(key))}>
                      <span className="chip-label">{t(key)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`assistant-msg ${m.role}`}>
                {m.role === 'assistant' ? <ChatText text={m.content} onNavigate={() => setOpen(false)} /> : <p>{m.content}</p>}
              </div>
            ))}
            {pending && (
              <div className="assistant-msg assistant typing" role="status" aria-label={t('assistantThinking')}>
                <span /><span /><span />
              </div>
            )}
            {error && <p className="assistant-error" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>

          <footer className="assistant-foot">
            <button type="button" className={`assistant-location small ${location ? 'shared' : ''}`} onClick={shareLocation} disabled={locating}>
              <FaCrosshairs aria-hidden="true" />{' '}
              {locating ? t('locating') : location ? t('assistantLocationShared', { place: location.label || t('yourLocation') }) : t('assistantShareLocation')}
            </button>
            <form
              className="assistant-form"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <label htmlFor="assistant-input" className="visually-hidden">{t('assistantInputLabel')}</label>
              <input
                id="assistant-input"
                ref={inputRef}
                className="input"
                maxLength={1000}
                autoComplete="off"
                placeholder={t('assistantPlaceholder')}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="btn assistant-send" disabled={pending || !draft.trim()} aria-label={t('assistantSend')}>
                <FaPaperPlane aria-hidden="true" />
              </button>
            </form>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {!open && !isDesktop && (
        <motion.button
          type="button"
          className="assistant-fab"
          aria-label={t('assistantAsk')}
          onClick={() => setOpen(true)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiSparkles aria-hidden="true" /> <span>{t('assistantAsk')}</span>
        </motion.button>
      )}
      {createPortal(panel, document.body)}
    </>
  );
};

export default AssistantChat;
