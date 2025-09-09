import { useEffect } from 'react';
import { useVoiceCalculator } from '@/hooks/use-voice-calculator';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { VoiceStatus } from '@/components/ui/voice-status';
import { ErrorModal } from '@/components/ui/error-modal';
import { Settings, Mic } from 'lucide-react';

export default function Calculator() {
  const { state, actions } = useVoiceCalculator();

  // Keyboard support
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (!isNaN(Number(key))) {
        actions.handleNumber(key);
      } else if (key === '+') {
        actions.handleOperation('+');
      } else if (key === '-') {
        actions.handleOperation('-');
      } else if (key === '*') {
        actions.handleOperation('*');
      } else if (key === '/') {
        event.preventDefault();
        actions.handleOperation('/');
      } else if (key === '=' || key === 'Enter') {
        actions.handleEquals();
      } else if (key === '.' || key === ',') {
        actions.handleDecimal();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        actions.handleClear();
      } else if (key === 'Backspace') {
        actions.handleBackspace();
      } else if (key.toLowerCase() === 'v') {
        actions.handleVoiceInput();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [actions]);

  return (
    <div className="bg-slate-50 font-sans min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden min-h-screen md:min-h-0 md:my-8">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Voice Calculator</h1>
            <button 
              className="p-2 rounded-full hover:bg-blue-500 transition-colors duration-200" 
              aria-label="Settings"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Display Section */}
        <div className="px-6 py-8 bg-slate-800 text-white">
          <div className="text-right">
            {/* Expression Display */}
            <div 
              className="text-sm text-slate-400 mb-2 min-h-[20px] font-mono"
              data-testid="text-expression"
            >
              {state.expression}
            </div>
            
            {/* Main Result Display */}
            <div 
              className="text-4xl font-light mb-4 min-h-[48px] font-mono break-all"
              data-testid="text-result"
            >
              {state.result}
            </div>

            {/* Voice Status Indicator */}
            <VoiceStatus isListening={state.isListening} />
          </div>
        </div>

        {/* Button Grid */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-3">
            
            {/* Row 1: Clear, +/-, %, Divide */}
            <CalculatorButton 
              onClick={actions.handleClear} 
              variant="clear"
              data-testid="button-clear"
            >
              C
            </CalculatorButton>
            <CalculatorButton 
              onClick={actions.handleNegate} 
              variant="clear"
              data-testid="button-negate"
            >
              +/-
            </CalculatorButton>
            <CalculatorButton
              onClick={actions.handleBackspace}
              variant="clear"
              data-testid="button-backspace"
            >
              ⌫
            </CalculatorButton>
            <CalculatorButton
              onClick={() => actions.handleOperation('/')}
              variant="operator"
              data-testid="button-divide"
            >
              ÷
            </CalculatorButton>

            {/* Row 2: 7, 8, 9, Multiply */}
            <CalculatorButton
              onClick={() => actions.handleNumber('7')}
              data-testid="button-7"
            >
              7
            </CalculatorButton>
            <CalculatorButton
              onClick={() => actions.handleNumber('8')}
              data-testid="button-8"
            >
              8
            </CalculatorButton>
            <CalculatorButton
              onClick={() => actions.handleNumber('9')}
              data-testid="button-9"
            >
              9
            </CalculatorButton>
            <CalculatorButton
              onClick={() => actions.handleOperation('*')}
              variant="operator"
              data-testid="button-multiply"
            >
              ×
            </CalculatorButton>

            {/* Row 3: 4, 5, 6, Subtract */}
            <CalculatorButton 
              onClick={() => actions.handleNumber('4')}
              data-testid="button-4"
            >
              4
            </CalculatorButton>
            <CalculatorButton 
              onClick={() => actions.handleNumber('5')}
              data-testid="button-5"
            >
              5
            </CalculatorButton>
            <CalculatorButton 
              onClick={() => actions.handleNumber('6')}
              data-testid="button-6"
            >
              6
            </CalculatorButton>
            <CalculatorButton 
              onClick={() => actions.handleOperation('-')} 
              variant="operator"
              data-testid="button-subtract"
            >
              -
            </CalculatorButton>

            {/* Row 4: 1, 2, 3, Add */}
            <CalculatorButton 
              onClick={() => actions.handleNumber('1')}
              data-testid="button-1"
            >
              1
            </CalculatorButton>
            <CalculatorButton 
              onClick={() => actions.handleNumber('2')}
              data-testid="button-2"
            >
              2
            </CalculatorButton>
            <CalculatorButton 
              onClick={() => actions.handleNumber('3')}
              data-testid="button-3"
            >
              3
            </CalculatorButton>
            <CalculatorButton 
              onClick={() => actions.handleOperation('+')} 
              variant="operator"
              data-testid="button-add"
            >
              +
            </CalculatorButton>

            {/* Row 5: 0 (spans 2), ., Equals */}
            <CalculatorButton 
              onClick={() => actions.handleNumber('0')} 
              span={2}
              data-testid="button-0"
            >
              0
            </CalculatorButton>
            <CalculatorButton 
              onClick={actions.handleDecimal}
              data-testid="button-decimal"
            >
              .
            </CalculatorButton>
            <CalculatorButton 
              onClick={actions.handleEquals} 
              variant="equals"
              data-testid="button-equals"
            >
              =
            </CalculatorButton>
          </div>

          {/* Voice Input Button */}
          <div className="mt-6 flex justify-center">
            <button 
              className={`voice-btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                state.isListening ? 'listening' : ''
              }`}
              onClick={actions.handleVoiceInput}
              aria-label="Voice input"
              data-testid="button-voice"
            >
              <Mic className="w-8 h-8" />
            </button>
          </div>

          {/* Voice Instructions */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">Tap the microphone and say your calculation</p>
            <p className="text-xs text-slate-500 mt-1">Try: "What is 25 times 4 plus 10?"</p>
          </div>
        </div>

        {/* Error Modal */}
        <ErrorModal 
          isOpen={!!state.error}
          message={state.error || ''}
          onClose={() => actions.setError(null)}
        />
      </div>
    </div>
  );
}
