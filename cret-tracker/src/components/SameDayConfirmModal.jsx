import { formatHours } from '../utils/cretUtils';

export default function SameDayConfirmModal({ associate, todayData, onConfirm, onCancel }) {
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
          Already Sent to CRET Today
        </h3>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            {associate?.name || 'This associate'} has already been to CRET today:
          </p>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <strong>Sessions today:</strong> {todayData.count}
            </p>
            <p>
              <strong>Total hours today:</strong> {formatHours(todayData.totalHours)}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mb-6">
          Do you want to send them to CRET again?
        </p>

        <div className="flex space-x-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-primary flex-1">
            Yes, Send Again
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          This will create a new CRET session for today
        </p>
      </div>
    </div>
  );
}
