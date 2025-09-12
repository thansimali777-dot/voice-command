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

  // Number words mapping for parsing spoken numbers
  const numberWords: { [key: string]: number } = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100, 'thousand': 1000, 'million': 1000000
  };

  // Function to convert spoken number words to numeric value
  const wordsToNumber = useCallback((words: string): number => {
    const tokens = words.toLowerCase().split(/\s+/);
    let total = 0;
    let current = 0;
    for (const token of tokens) {
      const value = numberWords[token];
      if (value !== undefined) {
        if (value >= 100) {
          current *= value;
          if (value >= 1000) {
            total += current;
            current = 0;
          }
        } else {
          current += value;
        }
      }
    }
    return total + current;
  }, []);

  // Function to parse voice command into mathematical expression
  const parseVoiceCommand = useCallback((command: string): string => {
    let words = command.toLowerCase().split(/\s+/);
    let parsedWords = [];
    let i = 0;
    while (i < words.length) {
      if (numberWords[words[i]]) {
        let numWords = [];
        while (i < words.length && numberWords[words[i]]) {
          numWords.push(words[i]);
          i++;
        }
        const num = wordsToNumber(numWords.join(' '));
        parsedWords.push(num.toString());
      } else {
        parsedWords.push(words[i]);
        i++;
      }
    }
    let expression = parsedWords.join(' ');
    // Replace operators
    expression = expression
      .replace(/what is|calculate|compute|equals?/g, '')
      .replace(/plus|add|\band\b/g, ' + ')
      .replace(/minus|subtract|less|take away/g, ' - ')
      .replace(/\bx\b|\btimes\b|\bmultiply\b|\bmultiplied by\b|\bstar\b|\basterisk\b/g, ' * ')
      .replace(/divided by|\bdivide\b|\bover\b|\bdivided\b/g, ' / ')
      .replace(/to the power of|power|raised to/g, ' ^ ')
      .replace(/point|dot/g, '.')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^0-9+\-*/().^ ]/g, '');
    return expression;
  }, [wordsToNumber]);

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
    const rounded = parseFloat(num.toFixed(3));

    // If it's a whole number, return as integer
    if (rounded % 1 === 0) {
      return rounded.toString();
    }

    // Remove trailing zeros
    return rounded.toString().replace(/\.?0+$/, '');
  }, []);

    const processVoiceCommand = useCallback((command: string): number => {
      console.log('Processing voice command:', command);

      const expression = parseVoiceCommand(command);

      console.log('Parsed expression:', expression);

      if (!expression || expression.length === 0) {
        throw new Error('Could not understand the mathematical expression');
      }

      return calculate(expression);
    }, [calculate, parseVoiceCommand]);

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
          const processedExpression = parseVoiceCommand(transcript);
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
  }, [state.isListening, setError, speak, processVoiceCommand, formatForVoice, parseVoiceCommand]);

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
