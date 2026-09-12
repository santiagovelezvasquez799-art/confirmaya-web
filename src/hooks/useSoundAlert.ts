'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useSoundAlert() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Cargar y seleccionar la mejor voz natural en español
  const loadVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prioridad 1: Voces "Natural" o "Neural" de Microsoft / Google en español latino (Colombia/México/EEUU)
    const naturalSpanish = voices.find(
      (v) =>
        (v.lang.startsWith('es') || v.lang.includes('ES')) &&
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))
    );

    // Prioridad 2: Voces de Google (mucho más humanas que las de Windows antiguas)
    const googleSpanish = voices.find(
      (v) => (v.lang.startsWith('es') || v.lang.includes('ES')) && v.name.includes('Google')
    );

    // Prioridad 3: Cualquier voz en español de Colombia (es-CO)
    const colSpanish = voices.find((v) => v.lang === 'es-CO' || v.lang === 'es_CO');

    // Prioridad 4: Cualquier español latinoamericano
    const generalSpanish = voices.find((v) => v.lang.startsWith('es'));

    selectedVoiceRef.current = naturalSpanish || googleSpanish || colSpanish || generalSpanish || null;
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  // Inicializar audio con clic del usuario
  const enableAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    loadVoices();
    setAudioEnabled(true);
  }, [loadVoices]);

  // Sonido de campana electrónica de confirmación (acorde brillante)
  const playChime = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.4);
      });
    } catch (e) {}
  }, []);

  // Pronunciar en voz alta con entonación natural
  const speak = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-CO';
      utterance.rate = 1.0; // Cadencia natural humana
      utterance.pitch = 1.0;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const triggerAlert = useCallback(
    (amount: number, sender?: string, source: string = 'Nequi') => {
      playChime();

      const formattedAmount = new Intl.NumberFormat('es-CO').format(amount);
      let spokenText = `¡${source} confirmado! ${formattedAmount} pesos`;
      if (sender && sender !== 'Remitente no especificado') {
        spokenText += ` de ${sender}`;
      }

      setTimeout(() => {
        speak(spokenText);
      }, 350);
    },
    [playChime, speak]
  );

  return { audioEnabled, enableAudio, triggerAlert };
}
