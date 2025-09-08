# TODO: Fix Calculator Issues

## Tasks
- [x] Fix multiplication and division operations in calculate function
- [x] Modify microphone button to wait for next command instead of auto-restarting
- [x] Implement continuous microphone listening until "calculations" command
- [x] Test the fixes
- [x] Reorder replacements in calculate function: ^ first, then x, then ×, then ÷
- [x] Update removal regex in calculate to exclude ^

## Details
- Fix order of replacements in calculate function in use-voice-calculator.tsx
- Remove setTimeout auto-restart in handleVoiceInput function
- Modify handleVoiceInput to keep listening continuously until stop command
- Fix onresult to process only the latest final result
