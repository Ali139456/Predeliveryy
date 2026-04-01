'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';

type Props = {
  onAppend: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

/** Browser speech-to-text (Chrome / Edge / Safari). Phrases are polished via API when logged in (AI if OPENAI_API_KEY is set). */
export default function VoiceNotesButton({ onAppend, disabled, className = '' }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const polishInFlightRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const appendSentence = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    onAppend(/[.!?]$/.test(t) ? `${t} ` : `${t}. `);
  }, [onAppend]);

  const polishAndAppend = useCallback(
    (phrase: string) => {
      const raw = phrase.trim();
      if (!raw) return;
      polishInFlightRef.current += 1;
      if (polishInFlightRef.current === 1) setPolishing(true);
      void (async () => {
        try {
          const res = await fetch('/api/inspections/polish-voice-note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ raw }),
          });
          if (res.ok) {
            const data = (await res.json()) as { polished?: string };
            if (typeof data.polished === 'string' && data.polished.trim()) {
              appendSentence(data.polished);
              return;
            }
          }
          appendSentence(raw);
        } catch {
          appendSentence(raw);
        } finally {
          polishInFlightRef.current -= 1;
          if (polishInFlightRef.current <= 0) {
            polishInFlightRef.current = 0;
            setPolishing(false);
          }
        }
      })();
    },
    [appendSentence]
  );

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
        if (phrase) polishAndAppend(phrase);
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
  }, [disabled, polishAndAppend, stop]);

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
      title={
        listening
          ? 'Stop recording'
          : polishing
            ? 'Turning speech into report wording…'
            : 'Speak to add notes (e.g. damage rear bumper); wording is polished for the report'
      }
    >
      {listening ? (
        <Square className="w-3.5 h-3.5 fill-current" />
      ) : polishing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Mic className="w-3.5 h-3.5" />
      )}
      {listening ? 'Stop' : polishing ? 'Wording…' : 'Voice to notes'}
    </button>
  );
}
