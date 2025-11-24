import { useState } from 'react';

export default function WarningModal({ data, onOverride, onCancel }) {
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleOverride = () => {
    if (!reason.trim()) {
      setShowReasonInput(true);
      return;
    }
    onOverride(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
          <svg
            className="w-8 h-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          ⚠️ High CRET Hours Warning
        </h3>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>{data?.associate?.name}</strong> has already used{' '}
            <strong className="text-yellow-700">{data?.totalHours?.toFixed(2)} hours</strong> in
            CRET in the past 7 days.
          </p>
          <p className="text-sm text-gray-600">
            Sending them to CRET again exceeds the 5-hour threshold.
          </p>
        </div>

        {showReasonInput && (
          <div className="mb-4 animate-slide-up">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Override Reason (required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
              rows="3"
              placeholder="Explain why you're overriding this warning..."
              autoFocus
            />
          </div>
        )}

        <div className="flex space-x-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleOverride}
            className="btn-danger flex-1"
          >
            {showReasonInput ? 'Confirm Override' : 'Override Warning'}
          </button>
        </div>

        {!showReasonInput && (
          <p className="text-xs text-gray-500 text-center mt-4">
            You can override this warning if necessary
          </p>
        )}
      </div>
    </div>
  );
}
