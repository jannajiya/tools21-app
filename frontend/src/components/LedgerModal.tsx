import { useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ledger: string) => void;
}

export default function LedgerModal({ isOpen, onClose, onConfirm }: Props) {
  const [ledger, setLedger] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus input on modal open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-96 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Enter Ledger Name
        </h2>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter the same name as in Tally Ledger"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          value={ledger}
          onChange={(e) => setLedger(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (ledger.trim()) onConfirm(ledger.trim());
            }}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}