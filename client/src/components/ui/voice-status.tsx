import React from "react";

interface VoiceStatusProps {
  isListening: boolean;
  keepMicOn?: boolean;
}

export function VoiceStatus({ isListening, keepMicOn }: VoiceStatusProps) {
  React.useEffect(() => {
    if (isListening && keepMicOn) {
      // Keep microphone on for next operation
      // No action needed here if microphone is managed externally
    }
  }, [isListening, keepMicOn]);

  return (
    <div className="flex items-center justify-end space-x-2" data-testid="voice-status">
      <div 
        className={`w-2 h-2 bg-green-500 rounded-full transition-opacity duration-300 ${
          isListening ? 'opacity-100 animate-pulse-soft' : 'opacity-0'
        }`} 
        data-testid="voice-indicator"
      />
      <span className="text-xs text-slate-400" data-testid="voice-text">
        {isListening ? 'Listening...' : 'Ready for voice input'}
      </span>
    </div>
  );
}
