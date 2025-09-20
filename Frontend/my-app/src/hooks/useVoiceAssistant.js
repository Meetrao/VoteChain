// src/hooks/useVoiceAssistantBasic.js
import { useEffect, useRef, useState } from "react";

export default function useVoiceAssistantBasic() {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const recognitionRef = useRef(null);

  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const speak = (text, lang = 'en-US') => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('speak failed', e);
    }
  };

  // One-shot recognition (keeps previous behavior)
  const startListening = () => {
    if (!SpeechRecognition) return alert("SpeechRecognition not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => console.log(e);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript);
      speak(`You said: ${transcript}`);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Announce all buttons with data-command attribute
  const announceButtons = (lang = 'en-US') => {
    try {
      const buttons = Array.from(document.querySelectorAll("button[data-command]"));
      if (!buttons.length) {
        speak('No voice commands available on this page.', lang);
        return;
      }

      let text = 'You can say: ';
      buttons.forEach((btn, idx) => {
        const label = (btn.innerText || btn.getAttribute('aria-label') || btn.dataset.command).trim();
        const command = btn.dataset.command.trim();
        text += `${label}: say ${command}` + (idx < buttons.length - 1 ? ', ' : '. ');
      });

      speak(text, lang);
    } catch (e) {
      console.warn('announceButtons failed', e);
    }
  };

  // Continuous command listener that finds buttons by data-command and triggers click()
  const startCommandListening = (lang = 'en-US') => {
    if (!SpeechRecognition) return alert("SpeechRecognition not supported");

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onerror = (e) => console.log('recognition error', e);

      recognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const transcript = last[0].transcript || '';
        const cleaned = transcript.toLowerCase().trim();
        setLastTranscript(cleaned);

        // normalize simple phrases: take first word or full phrase
        const command = cleaned.replace(/[.?!]/g, '').trim();

        const btn = document.querySelector(`button[data-command='${command}']`);
        if (btn) {
          try {
            btn.click();
            speak(`Executing ${command}`, lang);
            if (navigator.vibrate) navigator.vibrate(50);
          } catch (e) {
            console.warn('button click failed', e);
            speak(`Could not execute ${command}`, lang);
          }
        } else {
          // try fuzzy match by checking if command contains the dataset value or vice versa
          const buttons = Array.from(document.querySelectorAll("button[data-command]"));
          const found = buttons.find(b => {
            const cmd = (b.dataset.command || '').toLowerCase();
            return command.includes(cmd) || cmd.includes(command);
          });

          if (found) {
            found.click();
            speak(`Executing ${found.dataset.command}`, lang);
            if (navigator.vibrate) navigator.vibrate(50);
          } else {
            speak(`Sorry, I did not understand ${transcript}`, lang);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('startCommandListening failed', e);
    }
  };

  const stopCommandListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    lastTranscript,
    startListening,
    stopListening,
    speak,
    announceButtons,
    startCommandListening,
    stopCommandListening,
  };
}
