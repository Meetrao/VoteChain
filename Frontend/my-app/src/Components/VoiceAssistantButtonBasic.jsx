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
        className="px-3 py-2 border rounded-full hover:bg-gray-100"
        aria-pressed={isListening}
      >
        {isListening ? "Stop Voice" : "Start Voice"}
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
