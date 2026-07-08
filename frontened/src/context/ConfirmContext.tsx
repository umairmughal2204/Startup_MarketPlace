import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
          onClick={() => handleClose(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  state.variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#0066cc]'
                }`}
              >
                {state.variant === 'danger' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <HelpCircle className="w-5 h-5" />
                )}
              </div>
              <div className="pt-1">
                <h3 className="text-base font-semibold text-gray-900">{state.title || 'Please confirm'}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 ml-[52px]">{state.description}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {state.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => handleClose(true)}
                autoFocus
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                  state.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#0066cc] hover:bg-[#004080]'
                }`}
              >
                {state.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
