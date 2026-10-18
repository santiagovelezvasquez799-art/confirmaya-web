'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceStyle = 'comercial' | 'corto' | 'formal';

export function useSoundAlert() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [voiceStyle, setVoiceStyleState] = useState<VoiceStyle>('comercial');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStyle = localStorage.getItem('confirmaya_voice_style') as VoiceStyle;
      if (savedStyle && ['comercial', 'corto', 'formal'].includes(savedStyle)) {
        setVoiceStyleState(savedStyle);
      }
    }
  }, []);

  const setVoiceStyle = useCallback((style: VoiceStyle) => {
    setVoiceStyleState(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem('confirmaya_voice_style', style);
    }
  }, []);

  // Cargar y seleccionar la mejor voz natural en español
  const loadVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prioridad 1: Voces "Natural" o "Neural" de Microsoft / Google en español latino
    const naturalSpanish = voices.find(
      (v) =>
        (v.lang.startsWith('es') || v.lang.includes('ES')) &&
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))
    );

    // Prioridad 2: Voces de Google (mucho más humanas)
    const googleSpanish = voices.find(
      (v) => (v.lang.startsWith('es') || v.lang.includes('ES')) && v.name.includes('Google')
    );

    // Prioridad 3: Cualquier voz en español de Colombia (es-CO)
    const colSpanish = voices.find((v) => v.lang === 'es-CO' || v.lang === 'es_CO');

    // Prioridad 4: Cualquier español
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

  // Efecto de Sonido "Ka-Ching!" de Caja Registradora
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

      const now = ctx.currentTime;

      // 1. Golpe metálico inicial (Ka-): Ruido blanco modulado
      const bufferSize = ctx.sampleRate * 0.05;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(3000, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      // 2. Timbre brillante de caja (-Ching!): Campana armónica brillante
      const notes = [987.77, 1318.51, 1975.53, 2637.02]; // B5, E6, B6, E7 (Armónico resplandeciente)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.04);

        gain.gain.setValueAtTime(0.22 / (idx + 1), now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.04);
        osc.stop(now + 0.04 + 0.65);
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
      utterance.rate = 1.05; // Cadencia dinámica y comercial
      utterance.pitch = 1.0;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const triggerAlert = useCallback(
    (amount: number, sender?: string, source: string = 'Nequi', customStyle?: VoiceStyle) => {
      playChime();

      const activeStyle = customStyle || voiceStyle;
      const formattedAmount = new Intl.NumberFormat('es-CO').format(amount);
      const cleanSender = (sender && sender !== 'Remitente no especificado') ? sender : '';

      let spokenText = '';
      if (activeStyle === 'corto') {
        // Estilo rápido para cajeros ocupados
        spokenText = `${source}: ${formattedAmount} pesos${cleanSender ? ` de ${cleanSender}` : ''}`;
      } else if (activeStyle === 'formal') {
        // Estilo institucional
        spokenText = `Transferencia verificada con éxito. Recibidos ${formattedAmount} pesos por ${source}${cleanSender ? ` de ${cleanSender}` : ''}`;
      } else {
        // Estilo comercial llamativo (por defecto)
        spokenText = `¡Plata en mano! ${source} confirmado de ${formattedAmount} pesos${cleanSender ? ` de ${cleanSender}` : ''}`;
      }

      setTimeout(() => {
        speak(spokenText);
      }, 350);
    },
    [playChime, speak, voiceStyle]
  );

  return { audioEnabled, enableAudio, triggerAlert, voiceStyle, setVoiceStyle };
}
