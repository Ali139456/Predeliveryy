'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

type Props = {
  onAppend: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

/** Browser speech-to-text (Chrome / Edge / Safari). Appends transcribed phrases to notes. */
export default function VoiceNotesButton({ onAppend, disabled, className = '' }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (typeof window === 'undefined' || disabled) return;
    const w = window as unknown as {
      SpeechRecognition?: new () => Record<string, unknown>;
      webkitSpeechRecognition?: new () => Record<string, unknown>;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR() as {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: ((e: unknown) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
    };

    recognition.lang = 'en-AU';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: unknown) => {
      const ev = event as {
        resultIndex: number;
        results: Array<{ isFinal: boolean; 0: { transcript: string } }>;
      };
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (!ev.results[i].isFinal) continue;
        const phrase = ev.results[i][0].transcript.trim();
        if (phrase) onAppend(phrase.endsWith('.') || phrase.endsWith('!') ? `${phrase} ` : `${phrase}. `);
      }
    };

    recognition.onerror = () => {
      stop();
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [disabled, onAppend, stop]);

  useEffect(() => () => stop(), [stop]);

  if (!supported) {
    return (
      <span className={`text-xs text-gray-500 ${className}`} title="Voice input requires Chrome, Edge, or Safari">
        Voice notes unavailable
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => (listening ? stop() : start())}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
        listening
          ? 'bg-red-600 text-white border-red-700 animate-pulse'
          : 'bg-white text-[#0033FF] border-[#0033FF]/40 hover:bg-[#0033FF]/5'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={listening ? 'Stop recording' : 'Speak to add text to notes (e.g. damage rear bumper)'}
    >
      {listening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
      {listening ? 'Stop' : 'Voice to notes'}
    </button>
  );
}
