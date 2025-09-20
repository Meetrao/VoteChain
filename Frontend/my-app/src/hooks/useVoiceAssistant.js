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
        const transcript = (last[0].transcript || '').toLowerCase().trim();
        const cleaned = transcript.replace(/[.?!]/g, '').trim();
        setLastTranscript(cleaned);
        try { window.dispatchEvent(new CustomEvent('voice-assistant:update', { detail: { lastTranscript: cleaned } })); } catch (e) { }

        // If awaiting confirmation, handle yes/no
        if (awaitingConfirmationRef.current) {
          const ac = awaitingConfirmationRef.current;
          if (/^(yes|y|yep|yeah|yup|sure|ok|okay|confirm|submit|login|log me in|do it)$/.test(cleaned)) {
            try {
              if (ac.action === 'click' && ac.selector) {
                const el = document.querySelector(ac.selector);
                if (el) el.click();
              }
              speak('Confirmed. Executing now.', lang);
            } catch (e) {
              console.warn('confirm action failed', e);
              speak('Could not complete the action.', lang);
            }
            awaitingConfirmationRef.current = null;
            return;
          }
          if (/^(no|cancel|stop|never|don't|do not)$/.test(cleaned)) {
            speak('Cancelled.');
            awaitingConfirmationRef.current = null;
            return;
          }
        }

        // If wake-word is enabled, require prefix "hey vote" or "hey vote," before processing
        if (wakeWordEnabledRef.current) {
          const ww = cleaned.match(/^(hey vote[,\s]+)(.+)$/);
          if (!ww) {
            // ignore non-wakeword phrases
            return;
          }
          const cmd = ww[2].trim();
          handleParsedCommand(cmd, lang);
        } else {
          handleParsedCommand(cleaned, lang);
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

  // Awaiting confirmation state
  const awaitingConfirmationRef = useRef(null);
  // Wake-word toggle
  const wakeWordEnabledRef = useRef(false);
  // Keep last actions for undo
  const lastActionsRef = useRef([]);

  // Helpers: normalize email and phone from spoken text
  const normalizeEmail = (spoken) => {
    return spoken
      .replace(/\s+at\s+/g, '@')
      .replace(/\s+dot\s+/g, '.')
      .replace(/\s+dot$/g, '.')
      .replace(/\s+/g, '')
      .replace(/^mailto:/, '');
  };

  const wordsToDigits = (text) => {
    const map = {
      zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9'
    };
    return text.split(/\s+/).map(w => map[w] ?? w).join('');
  };

  const normalizeString = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  // simple levenshtein distance for fuzzy matching small strings
  const levenshtein = (a = '', b = '') => {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  };

  const fuzzyFindButton = (cleaned) => {
    const buttons = Array.from(document.querySelectorAll('button[data-command], button'));
    const target = normalizeString(cleaned);
    // first try exact dataset match
    const exact = buttons.find(b => (b.dataset && b.dataset.command && normalizeString(b.dataset.command) === target));
    if (exact) return exact;
    // try substring matches
    const substring = buttons.find(b => normalizeString(b.dataset?.command || b.innerText || '').includes(target) || target.includes(normalizeString(b.dataset?.command || b.innerText || '')));
    if (substring) return substring;
    // finally fuzzy on innerText or data-command
    let best = null; let bestScore = Infinity;
    buttons.forEach(b => {
      const key = normalizeString(b.dataset?.command || b.innerText || '');
      if (!key) return;
      const score = levenshtein(target, key);
      if (score < bestScore) { bestScore = score; best = b; }
    });
    if (bestScore <= 2) return best;
    return null;
  };

  // Parse spelled letters like: "A R Y A N space S I N G H" => "ARYAN SINGH"
  const parseSpelledLetters = (value) => {
    const tokens = value.trim().toLowerCase().split(/\s+/);
    // detect if mostly single letters or the word 'space'
    const isSpelled = tokens.length > 1 && tokens.every(t => t === 'space' || /^[a-z]$/.test(t));
    if (!isSpelled) return null;
    let out = '';
    tokens.forEach(t => {
      if (t === 'space') out += ' ';
      else out += t.toUpperCase();
    });
    // collapse multiple spaces
    return out.replace(/\s+/g, ' ').trim();
  };

  const normalizePhone = (spoken) => {
    let s = spoken.replace(/[^a-z0-9\s]/gi, ' ').toLowerCase();
    // Convert common words to digits
    s = wordsToDigits(s);
    // Strip non-digits
    const digits = s.replace(/\D/g, '');
    if (!digits) return '';
    // assume Indian +91 if length 10
    if (digits.length === 10) return `+91 ${digits}`;
    return `+${digits}`;
  };

  // Primary command parser/handler
  const handleParsedCommand = (cleaned, lang = 'en-US') => {
    // Basic patterns
    if (/^(start voice|start listening|start)$/.test(cleaned)) {
      announceButtons(lang);
      setTimeout(() => startCommandListening(lang), 700);
      return;
    }
    if (/^(stop voice|stop listening|stop)$/.test(cleaned)) {
      stopCommandListening();
      speak('Stopped listening', lang);
      return;
    }
    if (/^announce commands$/.test(cleaned) || /^what can i say$/.test(cleaned) || /^help$/.test(cleaned)) {
      announceButtons(lang);
      return;
    }

    // connect wallet
    if (/connect wallet|connect metamask|connect meta mask/.test(cleaned)) {
      const btn = document.querySelector("button[data-command='connect wallet'], button[data-command='connect-wallet']");
      if (btn) { btn.click(); speak('Connecting wallet', lang); } else speak('Connect wallet button not found', lang);
      return;
    }

    // capture face
    if (/capture face|capture photo|take photo|capture image/.test(cleaned)) {
      const btn = document.querySelector("button[data-command='capture face'], button[data-command='capture-face']");
      if (btn) { btn.click(); speak('Opening face capture', lang); } else speak('Face capture button not found', lang);
      return;
    }

    // navigate to login page (click public Login button/link)
    if (/^login$|^open login$|^go to login$|^go to login page$|^open login page$/.test(cleaned)) {
      // If we're already on a login form, give guidance instead of auto-submitting
      const onLoginForm = document.querySelector("input[name='voter_id']") || document.querySelector("button[data-command='login submit']") || document.querySelector("form button[type='submit']");
      if (onLoginForm) {
        speak('You are on the login form. Say "login submit" to submit immediately, or say "log me in" to confirm before submitting.', lang);
        return;
      }
      const btn = document.querySelector("button[data-command='login']");
      if (btn) { btn.click(); speak('Opening login page', lang); return; }
      const link = document.querySelector("a[href*='/login'], a[href$='/login']");
      if (link) { link.click(); speak('Opening login page', lang); return; }
      speak('Login control not found', lang);
      return;
    }

    // navigate to register page (click public Register button/link)
    if (/^register$|^open register$|^go to register$|^go to register page$|^open register page$/.test(cleaned)) {
      const btn = document.querySelector("button[data-command='register']");
      if (btn) { btn.click(); speak('Opening register page', lang); return; }
      const link = document.querySelector("a[href*='/register'], a[href$='/register']");
      if (link) { link.click(); speak('Opening register page', lang); return; }
      speak('Register control not found', lang);
      return;
    }

    // switch login method: password or face
    if (/^(use|switch to|select)\s+(password|face)$/.test(cleaned) || /^(password|face)\s+login$/.test(cleaned)) {
      const m = cleaned.match(/(password|face)/);
      const method = m ? m[1] : null;
      if (!method) { speak('Which method? password or face?', lang); return; }
      // try to find a button with data-command 'use password' or 'use face'
      const cmd = `use ${method}`;
      const btn = document.querySelector(`button[data-command='${cmd}']`) || fuzzyFindButton(cmd) || Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').toLowerCase().includes(method));
      if (btn) { btn.click(); speak(`Switched to ${method} login`, lang); return; }
      speak(`Could not switch to ${method}`, lang);
      return;
    }

    // verify voter <id>
    const verifyMatch = cleaned.match(/verify (?:voter )?([a-z0-9\s]+)/);
    if (verifyMatch) {
      const id = verifyMatch[1].replace(/\s+/g, '').toUpperCase();
      // fill voter input and click verify
      const input = document.querySelector('input[name="voter_id"]');
      if (input) input.value = id, input.dispatchEvent(new Event('input', { bubbles: true }));
      const verifyBtn = Array.from(document.querySelectorAll('button')).find(b => /verify/i.test(b.innerText));
      if (verifyBtn) { verifyBtn.click(); speak(`Verifying voter ${id}`, lang); } else speak('Verify button not found', lang);
      return;
    }

    // spell-only commands (e.g. "spell A B C 1 2 3") -> default to voter_id on login
    const spellOnlyMatch = cleaned.match(/^spell\s+(.+)$/);
    if (spellOnlyMatch) {
      const raw = spellOnlyMatch[1].trim();
      const spelled = parseSpelledLetters(raw);
      let value = spelled || wordsToDigits(raw).replace(/\s+/g, '');
      // try fill voter_id if present
      const input = document.querySelector("input[name='voter_id']");
      if (input) {
        input.value = value.toUpperCase();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        try { input.focus(); setTimeout(() => input.blur(), 120); } catch (e) { }
        lastActionsRef.current.push({ type: 'fill', field: 'voter_id', previousValue: input.value });
        speak(`Filled voter id`, lang);
      } else {
        speak('Voter ID input not found', lang);
      }
      return;
    }

    // fill/set commands: fill name <value>, set email to <value>
    const fillMatch = cleaned.match(/^(?:fill|set|spell)\s+(name|email|phone|phone number|password|voter id|voter_id|wallet)\s*(?:to|as)?\s*(.+)$/);
    if (fillMatch) {
      const rawField = fillMatch[1].toLowerCase().trim();
      const synonyms = {
        name: 'name',
        email: 'email',
        phone: 'phone_number',
        'phone number': 'phone_number',
        password: 'password',
        'voter id': 'voter_id',
        voter_id: 'voter_id',
        wallet: 'userWalletAddress',
      };
      const field = synonyms[rawField] || rawField.replace(/\s+/g, '_');
      let value = fillMatch[2].trim();

      // If the target is wallet, prompt to connect instead of filling
      if (field === 'userWalletAddress') {
        speak('Please use connect wallet to populate your wallet address', lang);
        return;
      }

      // Enforce wallet connection before allowing fills when on registration form
      const walletInput = document.querySelector("input[name='userWalletAddress']");
      if (walletInput && !walletInput.value) {
        speak('Please connect your wallet first', lang);
        return;
      }

      // save previous value for undo
      const inputBefore = document.querySelector(`input[name='${field}']`);
      const previousValue = inputBefore ? inputBefore.value : null;

      // If value is spelled letters, parse them
      const spelled = parseSpelledLetters(value);
      if (spelled) value = spelled;
      // Convert digit-words to digits for voter_id (e.g. "nine eight seven")
      if (field === 'voter_id') {
        value = wordsToDigits(value).replace(/\s+/g, '');
        value = value.toUpperCase();
      }
      if (/email/.test(field)) value = normalizeEmail(value);
      if (/phone/.test(field)) value = normalizePhone(value);
      if (/voter/.test(field) && field !== 'voter_id') value = value.replace(/\s+/g, '');
      // find input by name
      const input = document.querySelector(`input[name='${field}']`);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        // some React components listen to change as well
        input.dispatchEvent(new Event('change', { bubbles: true }));
        try { input.focus(); setTimeout(() => input.blur(), 120); } catch (e) { }
        // record action for undo
        lastActionsRef.current.push({ type: 'fill', field, previousValue });
        speak(`Filled ${rawField}`, lang);
      } else {
        speak(`${rawField} input not found`, lang);
      }
      return;
    }

    // clear <field>
    const clearMatch = cleaned.match(/^(?:clear|reset)\s+(name|email|phone|phone number|password|voter id|wallet)$/);
    if (clearMatch) {
      const raw = clearMatch[1].toLowerCase();
      const clearMap = { 'phone number': 'phone_number', 'voter id': 'voter_id', wallet: 'userWalletAddress' };
      const field = (clearMap[raw] || raw).replace(/\s+/g, '_');
      const input = document.querySelector(`input[name='${field}']`);
      if (input) {
        const prev = input.value;
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        lastActionsRef.current.push({ type: 'clear', field, previousValue: prev });
        speak(`${raw} cleared`, lang);
      } else speak(`${raw} not found`, lang);
      return;
    }

    // read field <field>
    const readMatch = cleaned.match(/^read field\s+(name|email|phone|phone number|voter id|wallet)$/);
    if (readMatch) {
      const raw = readMatch[1].toLowerCase();
      const readMap = { 'phone number': 'phone_number', 'voter id': 'voter_id', wallet: 'userWalletAddress' };
      const field = (readMap[raw] || raw).replace(/\s+/g, '_');
      const input = document.querySelector(`input[name='${field}']`);
      if (input) speak(`${raw} is ${input.value}`, lang); else speak(`${raw} not found`, lang);
      return;
    }

    // submit registration (ask confirmation)
    if (/submit registration|submit form|register me|submit$/.test(cleaned)) {
      // Summarize a few fields
      const nameInput = document.querySelector("input[name='name']");
      const emailInput = document.querySelector("input[name='email']");
      const voterInput = document.querySelector("input[name='voter_id']");
      const summary = `You are registering as ${nameInput?.value || 'unknown'}, email ${emailInput?.value || 'unknown'}, voter id ${voterInput?.value || 'unknown'}. Say yes to confirm or no to cancel.`;
      speak(summary, lang);
      // set awaiting confirmation with the submit button selector
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))[0];
      if (submitBtn) {
        awaitingConfirmationRef.current = { action: 'click', selector: 'button[type="submit"]' };
        try {
          window.dispatchEvent(new CustomEvent('voice-assistant:update', { detail: { awaitingConfirmation: awaitingConfirmationRef.current, lastTranscript: cleaned } }));
        } catch (e) { }
      }
      return;
    }

    // login submit - immediate submit when user says 'login submit' or 'submit login'
    if (/^login submit$|^submit login$/.test(cleaned)) {
      const loginBtn = Array.from(document.querySelectorAll('button[type="submit"]'))[0];
      if (loginBtn) {
        try { loginBtn.click(); speak('Submitting login', lang); } catch (e) { console.warn('login submit click failed', e); speak('Could not click the login button', lang); }
      } else speak('Login button not found', lang);
      return;
    }

    // 'log me in' or similar phrases will ask for confirmation before submitting
    if (/^log me in$|^log me in please$|^please log me in$|^confirm login$/.test(cleaned)) {
      const voterInput = document.querySelector("input[name='voter_id']");
      const summary = `Logging in with voter id ${voterInput?.value || 'unknown'}. Say yes to confirm or no to cancel.`;
      speak(summary, lang);
      const loginBtn = Array.from(document.querySelectorAll('button[type="submit"]'))[0];
      if (loginBtn) {
        awaitingConfirmationRef.current = { action: 'click', selector: 'button[type="submit"]' };
        try { window.dispatchEvent(new CustomEvent('voice-assistant:update', { detail: { awaitingConfirmation: awaitingConfirmationRef.current, lastTranscript: cleaned } })); } catch (e) { }
      }
      return;
    }

    // undo last fill/clear
    if (/^undo$|^undo last$|^restore last$|^revert last$/.test(cleaned)) {
      const last = lastActionsRef.current.pop();
      if (!last) { speak('Nothing to undo', lang); return; }
      const input = document.querySelector(`input[name='${last.field}']`);
      if (input) {
        input.value = last.previousValue ?? '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        speak(`Restored ${last.field}`, lang);
      } else {
        speak('Could not restore the previous value', lang);
      }
      return;
    }

    // wake-word toggle
    if (/enable wake word|turn on wake word|enable wakeword/.test(cleaned)) {
      wakeWordEnabledRef.current = true; speak('Wake word enabled. You can say Hey Vote before commands.', lang); return;
    }
    if (/disable wake word|turn off wake word|disable wakeword/.test(cleaned)) {
      wakeWordEnabledRef.current = false; speak('Wake word disabled.', lang); return;
    }

    // fallback: try to click matching data-command
    // fallback: try to fuzzy-find a button and click it
    const btn = fuzzyFindButton(cleaned);
    if (btn) { btn.click(); speak(`Executing ${btn.dataset?.command || btn.innerText}`, lang); return; }

    speak(`Sorry, I did not understand ${cleaned}. Say help for examples.`, lang);
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
