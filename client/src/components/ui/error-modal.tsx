import { AlertCircle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      data-testid="error-modal"
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-sm w-full transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calculation Error</h3>
          <p className="text-sm text-gray-500 mb-4" data-testid="error-message">
            {message}
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={onClose}
            data-testid="button-close-error"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
