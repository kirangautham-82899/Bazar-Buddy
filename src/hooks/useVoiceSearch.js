import { useCallback, useEffect, useRef, useState } from 'react';

const getRecognition = () =>
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

// Browser speech-to-text (Chrome/Edge/Android), tuned for Indian English.
export const useVoiceSearch = ({ onResult }) => {
  const Recognition = getRecognition();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const start = useCallback(() => {
    if (!Recognition) {
      setError('unsupported');
      return;
    }
    recognitionRef.current?.abort();
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      onResultRef.current(transcript.replace(/[.?!]+$/, '').trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') setError(event.error === 'not-allowed' ? 'denied' : 'failed');
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  }, [Recognition]);

  const stop = useCallback(() => recognitionRef.current?.stop(), []);

  return { supported: Boolean(Recognition), listening, error, start, stop };
};
