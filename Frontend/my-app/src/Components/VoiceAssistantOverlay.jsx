import React, { useEffect, useState } from 'react';

export default function VoiceAssistantOverlay() {
  const [lastTranscript, setLastTranscript] = useState('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const d = e.detail || {};
      if (d.lastTranscript !== undefined) setLastTranscript(d.lastTranscript);
      if (d.awaitingConfirmation !== undefined) setAwaitingConfirmation(d.awaitingConfirmation);
    };
    window.addEventListener('voice-assistant:update', handler);
    return () => window.removeEventListener('voice-assistant:update', handler);
  }, []);

  if (!lastTranscript && !awaitingConfirmation) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white border shadow-lg p-3 rounded-xl w-80 text-sm">
        <div className="font-semibold mb-1">Voice Assistant</div>
        {awaitingConfirmation && (
          <div className="mb-2 text-yellow-700">Awaiting confirmation: {awaitingConfirmation.action}</div>
        )}
        <div className="text-gray-700">Last: <span className="font-medium">{lastTranscript}</span></div>
      </div>
    </div>
  );
}
