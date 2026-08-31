"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IconButton, Tooltip } from "@radix-ui/themes";

/* Minimal Web Speech API typings — the API is not part of TS's lib.dom. */
interface SpeechRecognitionResultChunk {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: { length: number; [index: number]: SpeechRecognitionResultChunk };
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/* API support never changes within a session: expose it as a static
   external store so the server renders "unsupported" and the client
   corrects it without a state update in an effect. */
const emptySubscribe = () => () => {};
const supportedSnapshot = () => !!getSpeechRecognition();
const supportedServerSnapshot = () => false;

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <rect x="9" y="2.5" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* Dictation into a composer via the browser's Web Speech API. While
   listening, final and interim transcripts are appended to whatever was
   in the box when dictation started, so speaking and typing can mix.
   Renders nothing in browsers without the API. */
export function VoiceInputButton({ value, onValueChange }: { value: string; onValueChange: (next: string) => void }) {
  const [listening, setListening] = useState(false);
  const supported = useSyncExternalStore(emptySubscribe, supportedSnapshot, supportedServerSnapshot);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // The recognition callbacks read the composer text through refs so a
  // keystroke mid-dictation doesn't restart the session.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const baseRef = useRef("");

  useEffect(() => () => recognitionRef.current?.stop(), []);

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    baseRef.current = valueRef.current ? `${valueRef.current.trimEnd()} ` : "";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      onValueChange(baseRef.current + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  if (!supported) return null;
  return (
    <Tooltip content={listening ? "Stop dictation" : "Dictate instead of typing"}>
      <IconButton
        size="2"
        radius="full"
        variant={listening ? "solid" : "ghost"}
        color={listening ? "red" : "gray"}
        className={listening ? "mic-live" : undefined}
        onClick={toggle}
        aria-pressed={listening}
        aria-label={listening ? "Stop dictation" : "Start dictation"}
      >
        <MicIcon />
      </IconButton>
    </Tooltip>
  );
}
