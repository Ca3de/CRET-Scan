import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { editCretSession, deleteCretSession } from '../utils/cretUtils';
import toast from 'react-hot-toast';

export default function EditSessionModal({ session, onClose, onSave }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (session) {
      // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
      const startDate = new Date(session.start_time);
      setStartTime(formatDateTimeLocal(startDate));

      if (session.end_time) {
        const endDate = new Date(session.end_time);
        setEndTime(formatDateTimeLocal(endDate));
      }
    }
  }, [session]);

  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSave = async () => {
    if (!startTime) {
      toast.error('Start time is required');
      return;
    }

    // Validate end time is after start time
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        toast.error('End time must be after start time');
        return;
      }
    }

    setSaving(true);

    const { data, error } = await editCretSession(
      session.id,
      new Date(startTime).toISOString(),
      endTime ? new Date(endTime).toISOString() : null
    );

    setSaving(false);

    if (error) {
      toast.error('Failed to update session: ' + error.message);
      return;
    }

    toast.success('Session updated successfully!');
    onSave(data);
    onClose();
  };

  const handleDelete = async () => {
    setDeleting(true);

    const { error } = await deleteCretSession(session.id);

    setDeleting(false);

    if (error) {
      toast.error('Failed to delete session: ' + error.message);
      return;
    }

    toast.success('Session deleted successfully!');
    onSave(null); // Signal deletion
    onClose();
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const duration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Edit CRET Session</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-800">
            {session?.associate?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-600">
            {session?.associate?.login} • {session?.associate?.badge_id}
          </p>
        </div>

        {!showDeleteConfirm ? (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Time {session?.end_time ? '*' : '(Optional)'}
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for active (ongoing) sessions
                </p>
              </div>

              {duration && (
                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Duration:</strong> {duration}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <div className="flex space-x-3">
                <button onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 text-sm font-semibold py-2"
              >
                Delete Session
              </button>
            </div>
          </>
        ) : (
          <div className="animate-slide-up">
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-2">
                ⚠️ Are you sure you want to delete this session?
              </p>
              <p className="text-sm text-red-700">
                This action cannot be undone. All data for this session will be permanently deleted.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex-1"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
