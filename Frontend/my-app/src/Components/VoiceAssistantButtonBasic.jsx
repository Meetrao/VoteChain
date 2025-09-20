import React from "react";
import useVoiceAssistantBasic from "../hooks/useVoiceAssistant";

export default function VoiceAssistantButtonBasic() {
  const { isListening, lastTranscript, speak, announceButtons, startCommandListening, stopCommandListening } = useVoiceAssistantBasic();

  const handleToggle = () => {
    if (isListening) {
      stopCommandListening();
      speak('Stopped listening');
    } else {
      // Announce available commands then start continuous listening
      announceButtons();
      // small delay so announcement begins before listening
      setTimeout(() => startCommandListening(), 800);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`px-3 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white border hover:bg-gray-50'}`}
        aria-pressed={isListening}
        title={isListening ? 'Stop voice listening' : 'Start voice listening'}
      >
        {isListening ? (
          <>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
            Listening...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M12 1v11" /><path d="M19 11a7 7 0 0 1-14 0" /></svg>
            Start Voice
          </>
        )}
      </button>

      <button
        onClick={() => speak(lastTranscript || "Hello")}
        className="px-3 py-2 border rounded-full hover:bg-gray-100"
      >
        Speak
      </button>

      <div className="text-sm text-gray-600 max-w-xs truncate" aria-live="polite">
        {lastTranscript ? `Heard: ${lastTranscript}` : "No transcript yet"}
      </div>
    </div>
  );
}
