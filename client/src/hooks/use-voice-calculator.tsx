import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechSynthesis } from './use-speech-synthesis';

// TypeScript definitions for Speech Recognition API
interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: any;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceCalculatorState {
  expression: string;
  result: string;
  isListening: boolean;
  operator: string | null;
  operand: number | null;
  waitingForOperand: boolean;
  error: string | null;
}

export function useVoiceCalculator() {
  const [state, setState] = useState<VoiceCalculatorState>({
    expression: '',
    result: '0',
    isListening: false,
    operator: null,
    operand: null,
    waitingForOperand: false,
    error: null
  });

  const recognition = useRef<SpeechRecognition | null>(null);
  const { speak } = useSpeechSynthesis();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true; // Continuous listening
        recognition.current.interimResults = false; // Only final results
        recognition.current.lang = 'en-US';
        recognition.current.maxAlternatives = 1;
      }
    }
  }, []);

  const calculate = useCallback((expression: string): number => {
    try {
      // Clean and validate expression
      let cleanExpression = expression
        .replace(/\^/g, '**')
        .replace(/x/g, '*')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/(). ]/g, '');

      // Prevent dangerous eval by checking for valid mathematical expression
      if (!/^[0-9+\-*/.() ]+$/.test(cleanExpression)) {
        throw new Error('Invalid characters in expression');
      }

      const result = Function('"use strict"; return (' + cleanExpression + ')')();

      if (!isFinite(result)) {
        throw new Error('Result is not a finite number');
      }

      return parseFloat(parseFloat(result.toString()).toFixed(10));
    } catch (error) {
      throw new Error('Invalid mathematical expression');
    }
  }, []);

  // Helper function to format numbers for voice output (rounded)
  const formatForVoice = useCallback((num: number): string => {
    // Round to 4 decimal places for voice output
    const rounded = parseFloat(num.toFixed(4));

    // If it's a whole number, return as integer
    if (rounded % 1 === 0) {
      return rounded.toString();
    }

    // Remove trailing zeros
    return rounded.toString().replace(/\.?0+$/, '');
  }, []);

    const processVoiceCommand = useCallback((command: string): number => {
      console.log('Processing voice command:', command);
      
      // Convert speech to mathematical expression
      let expression = command.toLowerCase()
        .replace(/what is|calculate|compute|equals?/g, '')
        .replace(/plus|add|\band\b/g, ' + ')
        .replace(/minus|subtract|less|take away/g, ' - ')
        .replace(/\bx\b|\btimes\b|\bmultiply\b|\bmultiplied by\b|\bstar\b|\basterisk\b/g, ' *')
        .replace(/divided by|\bdivide\b|\bover\b|\bdivided\b/g, ' / ')
        .replace(/to the power of|power|raised to/g, ' ^ ')
        .replace(/point|dot/g, '.')
        .replace(/zero/g, '0')
        .replace(/one/g, '1')
        .replace(/two/g, '2')
        .replace(/three|free/g, '3')
        .replace(/four|for/g, '4')
        .replace(/five/g, '5')
        .replace(/six/g, '6')
        .replace(/seven/g, '7')
        .replace(/eight/g, '8')
        .replace(/nine/g, '9')
        .replace(/ten/g, '10')
        .replace(/twenty/g, '20')
        .replace(/thirty/g, '30')
        .replace(/forty/g, '40')
        .replace(/fifty/g, '50')
        .replace(/sixty/g, '60')
        .replace(/seventy/g, '70')
        .replace(/eighty/g, '80')
        .replace(/ninety/g, '90')
        .replace(/hundred/g, '100')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('Converted expression:', expression);
      
      // Remove non-mathematical characters
      expression = expression.replace(/[^0-9+\-*/().^ ]/g, '');
      
      console.log('Cleaned expression:', expression);

      if (!expression || expression.length === 0) {
        throw new Error('Could not understand the mathematical expression');
      }

      return calculate(expression);
    }, [calculate]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const handleClear = useCallback(() => {
    setState(prev => ({
      ...prev,
      expression: '',
      result: '0',
      operator: null,
      operand: null,
      waitingForOperand: false,
      error: null
    }));
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleNumber = useCallback((value: string) => {
    setState(prev => {
      let newResult: string;
      let newExpression: string;
      
      if (prev.waitingForOperand) {
        newResult = value;
        newExpression = prev.expression + value;
      } else {
        newResult = prev.result === '0' ? value : prev.result + value;
        newExpression = prev.expression + value;
      }
      
      return {
        ...prev,
        result: newResult,
        expression: newExpression,
        waitingForOperand: false,
        error: null
      };
    });
  }, []);

  const handleOperation = useCallback((operator: string) => {
    setState(prev => {
      const inputValue = parseFloat(prev.result);

      if (prev.operator && prev.waitingForOperand) {
        return {
          ...prev,
          operator,
          expression: prev.expression.slice(0, -3) + ` ${operator} `
        };
      }

      let newOperand = prev.operand;
      let newResult = prev.result;

      if (prev.operand === null) {
        newOperand = inputValue;
      } else if (prev.operator) {
        try {
          const currentValue = prev.operand || 0;
          const calculatedValue = calculate(`${currentValue} ${prev.operator} ${inputValue}`);
          newResult = String(calculatedValue);
          newOperand = calculatedValue;
        } catch (error) {
          return {
            ...prev,
            error: 'Calculation error'
          };
        }
      }

      return {
        ...prev,
        result: newResult,
        operand: newOperand,
        operator,
        waitingForOperand: true,
        expression: prev.expression + ` ${operator} `,
        error: null
      };
    });
  }, [calculate]);

  const handleEquals = useCallback(() => {
    setState(prev => {
      const inputValue = parseFloat(prev.result);

      if (prev.operator && prev.operand !== null) {
        try {
          const newValue = calculate(`${prev.operand} ${prev.operator} ${inputValue}`);
          const result = String(newValue);
          
          // Speak result (rounded for voice output)
          speak(`The result is ${formatForVoice(newValue)}`);
          
          return {
            ...prev,
            result,
            operand: null,
            operator: null,
            waitingForOperand: true,
            expression: '',
            error: null
          };
        } catch (error) {
          return {
            ...prev,
            error: 'Calculation error'
          };
        }
      }
      
      return prev;
    });
  }, [calculate, speak, formatForVoice]);

  const handleDecimal = useCallback(() => {
    setState(prev => {
      let newResult: string;
      let newExpression: string;
      
      if (prev.waitingForOperand) {
        newResult = '0.';
        newExpression = prev.expression + '0.';
      } else if (prev.result.indexOf('.') === -1) {
        newResult = prev.result + '.';
        newExpression = prev.expression + '.';
      } else {
        return prev; // Already has decimal point
      }
      
      return {
        ...prev,
        result: newResult,
        expression: newExpression,
        waitingForOperand: false,
        error: null
      };
    });
  }, []);

  const handleNegate = useCallback(() => {
    setState(prev => {
      const value = parseFloat(prev.result);
      const newResult = String(value * -1);

      return {
        ...prev,
        result: newResult,
        error: null
      };
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setState(prev => {
      let newResult: string;
      let newExpression: string;

      // Remove last character from expression string
      if (prev.expression.length === 0) {
        return prev;
      }

      // Remove last character from expression
      newExpression = prev.expression.slice(0, -1);

      // Remove trailing spaces
      newExpression = newExpression.trimEnd();

      // If last character removed was an operator (space before it), remove that too
      if (newExpression.endsWith('+') || newExpression.endsWith('-') || newExpression.endsWith('*') || newExpression.endsWith('/')) {
        newExpression = newExpression.slice(0, -1).trimEnd();
      }

      // Extract last number from newExpression to update result
      const match = newExpression.match(/(\d+\.?\d*)$/);
      if (match) {
        newResult = match[1];
      } else {
        newResult = '0';
      }

      // If result becomes '0', reset all calculator state for clean slate
      if (newResult === '0') {
        return {
          ...prev,
          result: '0',
          expression: '',
          operator: null,
          operand: null,
          waitingForOperand: false,
          error: null
        };
      }

      return {
        ...prev,
        result: newResult,
        expression: newExpression,
        waitingForOperand: false,
        error: null
      };
    });
  }, []);

  const handleVoiceInput = useCallback(async () => {
    if (!recognition.current) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (state.isListening) {
      recognition.current.stop();
      return;
    }

    // Check microphone permissions
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
    } catch (error) {
      console.error('Microphone access denied:', error);
      setError('Microphone access is required for voice input');
      return;
    }

    setState(prev => ({ ...prev, isListening: true, error: null }));
    speak('Listening for your calculation');

    recognition.current.onresult = (event: SpeechRecognitionEvent) => {
      console.log('Speech recognition result event fired');
      console.log('Results length:', event.results.length);

      // Process only the latest final result to avoid reprocessing previous commands
      const lastIndex = event.results.length - 1;
      if (event.results[lastIndex].isFinal) {
        const transcript = event.results[lastIndex][0].transcript;
        console.log('Voice input received:', transcript);
        console.log('Confidence:', event.results[lastIndex][0].confidence);

        // Check for stop command
        if (transcript.toLowerCase().includes('calculations') || transcript.toLowerCase().includes('stop')) {
          if (recognition.current) {
            recognition.current.stop();
          }
          setState(prev => ({ ...prev, isListening: false }));
          speak('Stopping voice input');
          return;
        }

        try {
          const processedExpression = transcript.toLowerCase()
            .replace(/what is|calculate|compute|equals?/g, '')
            .replace(/plus|add|\band\b/g, ' + ')
            .replace(/minus|subtract|less|take away/g, ' - ')
            .replace(/\bx\b|\btimes\b|\bmultiply\b|\bmultiplied by\b|\bstar\b|\basterisk\b/g, ' * ')
            .replace(/divided by|\bdivide\b|\bover\b|\bdivided\b/g, ' / ')
            .replace(/to the power of|power|raised to/g, ' ^ ')
            .replace(/point|dot/g, '.')
            .replace(/zero/g, '0')
            .replace(/one/g, '1')
            .replace(/two/g, '2')
            .replace(/three|free/g, '3')
            .replace(/four|for/g, '4')
            .replace(/five/g, '5')
            .replace(/six/g, '6')
            .replace(/seven/g, '7')
            .replace(/eight/g, '8')
            .replace(/nine/g, '9')
            .replace(/ten/g, '10')
            .replace(/twenty/g, '20')
            .replace(/thirty/g, '30')
            .replace(/forty/g, '40')
            .replace(/fifty/g, '50')
            .replace(/sixty/g, '60')
            .replace(/seventy/g, '70')
            .replace(/eighty/g, '80')
            .replace(/ninety/g, '90')
            .replace(/hundred/g, '100')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[^0-9+\-*/().^ ]/g, '');
          const result = processVoiceCommand(transcript);
          setState(prev => ({
            ...prev,
            result: String(result),
            expression: `${processedExpression} = ${result}`,
            error: null,
            operator: null,
            operand: null,
            waitingForOperand: true
          }));
          speak(`The result is ${formatForVoice(result)}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Calculation error';
          console.log('Processing error:', errorMessage);
          setState(prev => ({
            ...prev,
            error: errorMessage
          }));
          speak('Sorry, I could not calculate that expression');
        }
      }
    };

    recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Could not understand speech. Please try again.';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking louder.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      setState(prev => ({
        ...prev,
        isListening: false,
        error: errorMessage
      }));
      speak(errorMessage);
    };

    recognition.current.onstart = () => {
      console.log('Speech recognition started - speak now');
    };

    recognition.current.onend = () => {
      console.log('Speech recognition ended');
      setState(prev => ({ ...prev, isListening: false }));
    };


    try {
      recognition.current.start();
      console.log('Starting speech recognition...');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setState(prev => ({ ...prev, isListening: false, error: 'Failed to start voice input' }));
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, [state.isListening, setError, speak, processVoiceCommand, formatForVoice]);

  return {
    state,
    actions: {
      handleClear,
      handleNumber,
      handleOperation,
      handleEquals,
      handleDecimal,
      handleNegate,
      handleBackspace,
      handleVoiceInput,
      setError
    }
  };
}
