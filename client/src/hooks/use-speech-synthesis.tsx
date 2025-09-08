import { useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const synthesis = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synthesis.current = window.speechSynthesis;
  }

  const speak = useCallback((text: string) => {
    if (!synthesis.current) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    if (synthesis.current.speaking) {
      synthesis.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    synthesis.current.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (synthesis.current?.speaking) {
      synthesis.current.cancel();
    }
  }, []);

  return { speak, cancel };
}
