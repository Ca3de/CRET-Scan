import { useState } from 'react';

export default function NamePromptModal({ identifier, onSubmit, onCancel }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          New Associate Detected
        </h3>

        <p className="text-sm text-gray-600 text-center mb-4">
          Badge/Login: <strong className="text-gray-800">{identifier}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Associate Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter full name..."
              autoFocus
              required
            />
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!name.trim()}>
              Continue
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          This name will be saved for future scans
        </p>
      </div>
    </div>
  );
}
