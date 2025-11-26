import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  getOrCreateAssociate,
  createAssociate,
  updateAssociateName,
  startCretSession,
  endCretSession,
  getCretHoursLastWeek,
  getCompletedSessionsToday,
  overrideWarning,
} from '../utils/cretUtils';
import WarningModal from './WarningModal';
import NamePromptModal from './NamePromptModal';
import SameDayConfirmModal from './SameDayConfirmModal';

export default function Scanner() {
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showSameDayConfirm, setShowSameDayConfirm] = useState(false);
  const [warningData, setWarningData] = useState(null);
  const [sameDayData, setSameDayData] = useState(null);
  const [pendingAssociate, setPendingAssociate] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const inputRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const { user } = useAuth();

  // Auto-focus input for barcode scanner
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !showWarning && !showNamePrompt && !showSameDayConfirm) {
        inputRef.current.focus();
      }
    };

    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, [showWarning, showNamePrompt, showSameDayConfirm]);

  // Handle barcode scanner input (detects rapid keyboard input)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setScanInput(value);

    // Clear existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // If input is long enough, assume it's from a scanner and auto-submit
    if (value.length >= 5) {
      scanTimeoutRef.current = setTimeout(() => {
        handleScan(value);
      }, 100);
    }
  };

  const handleScan = async (identifier = scanInput) => {
    if (!identifier || identifier.trim() === '') {
      toast.error('Please enter a badge ID or login');
      return;
    }

    setIsScanning(true);

    try {
      // Get or find associate
      const { data: associate, error } = await getOrCreateAssociate(identifier.trim());

      if (error) {
        toast.error('Error finding associate: ' + error.message);
        setIsScanning(false);
        return;
      }

      if (!associate) {
        // Associate doesn't exist - prompt for name
        setPendingAssociate({ identifier: identifier.trim() });
        setShowNamePrompt(true);
        setIsScanning(false);
        return;
      }

      // If associate has no name, prompt for it
      if (!associate.name) {
        setPendingAssociate(associate);
        setShowNamePrompt(true);
        setIsScanning(false);
        return;
      }

      // Process the scan
      await processScan(associate);
    } catch (error) {
      toast.error('Scan failed: ' + error.message);
      setIsScanning(false);
    }

    setScanInput('');
  };

  const processScan = async (associate) => {
    try {
      // Try to end an active session first
      const { data: endedSession, error: endError } = await endCretSession(associate.id);

      if (endedSession) {
        // Successfully ended session
        const hours = endedSession.hours_used || 0;
        setLastScan({
          associate,
          action: 'return',
          hours,
          timestamp: new Date(),
        });
        toast.success(
          `${associate.name} returned from CRET (${hours.toFixed(2)} hours)`,
          { duration: 4000 }
        );
        setIsScanning(false);
        return;
      }

      // No active session, so start a new one
      // First check if they've already been to CRET today
      const todaySessionsResult = await getCompletedSessionsToday(associate.id);

      if (todaySessionsResult.count > 0) {
        // Show same-day confirmation modal
        setSameDayData({
          associate,
          count: todaySessionsResult.count,
          totalHours: todaySessionsResult.totalHours,
        });
        setPendingAction({ type: 'start', associate });
        setShowSameDayConfirm(true);
        setIsScanning(false);
        return;
      }

      // Check if they have >5 hours in the past week
      const { totalHours } = await getCretHoursLastWeek(associate.id);

      if (totalHours >= 5) {
        // Show warning modal
        setWarningData({
          associate,
          totalHours,
          action: 'start',
        });
        setPendingAction({ type: 'start', associate });
        setShowWarning(true);
        setIsScanning(false);
        return;
      }

      // Start the session
      await startSession(associate);
    } catch (error) {
      toast.error('Error processing scan: ' + error.message);
      setIsScanning(false);
    }
  };

  const startSession = async (associate) => {
    const { data: session, error } = await startCretSession(associate.id, user.username);

    if (error) {
      toast.error(error.message);
      setIsScanning(false);
      return;
    }

    setLastScan({
      associate,
      action: 'start',
      timestamp: new Date(),
    });
    toast.success(`${associate.name} sent to CRET`, { duration: 4000 });
    setIsScanning(false);
  };

  const handleWarningOverride = async (reason) => {
    setShowWarning(false);
    if (pendingAction?.type === 'start') {
      // Start the session first
      const { data: session, error } = await startCretSession(pendingAction.associate.id, user.username);

      if (error) {
        toast.error(error.message);
        setIsScanning(false);
        setPendingAction(null);
        return;
      }

      // Save the override reason to the session
      const overrideResult = await overrideWarning(session.id, reason);

      if (overrideResult.error) {
        toast.error('Failed to save override reason');
      }

      setLastScan({
        associate: pendingAction.associate,
        action: 'start',
        timestamp: new Date(),
      });
      toast.success(`${pendingAction.associate.name} sent to CRET (override: ${reason})`, { duration: 4000 });
    }
    setPendingAction(null);
    setIsScanning(false);
  };

  const handleSameDayConfirm = async () => {
    setShowSameDayConfirm(false);
    if (pendingAction?.type === 'start') {
      // Check 5-hour warning still applies
      const { totalHours } = await getCretHoursLastWeek(pendingAction.associate.id);
      if (totalHours >= 5) {
        setWarningData({
          associate: pendingAction.associate,
          totalHours,
          action: 'start',
        });
        setShowWarning(true);
        return;
      }
      await startSession(pendingAction.associate);
    }
    setPendingAction(null);
  };

  const handleNameSubmit = async (name) => {
    setShowNamePrompt(false);

    if (pendingAssociate.id) {
      // Update existing associate
      const { data, error } = await updateAssociateName(pendingAssociate.id, name);
      if (!error) {
        await processScan({ ...pendingAssociate, name });
      } else {
        toast.error('Failed to update name');
      }
    } else {
      // Create new associate
      const { data, error } = await createAssociate(
        pendingAssociate.identifier,
        pendingAssociate.identifier,
        name
      );
      if (!error) {
        await processScan(data);
      } else {
        toast.error('Failed to create associate: ' + error.message);
      }
    }

    setPendingAssociate(null);
    setIsScanning(false);
  };

  return (
    <>
      <div className="card max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Scan Badge</h2>
          <p className="text-gray-600">
            Scan badge or enter login to track CRET hours
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="scan" className="block text-sm font-semibold text-gray-700 mb-2">
              Badge ID / Login
            </label>
            <input
              ref={inputRef}
              id="scan"
              type="text"
              value={scanInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScan();
                }
              }}
              className="input-field text-lg"
              placeholder="Scan badge or type login..."
              disabled={isScanning}
            />
          </div>

          <button
            onClick={() => handleScan()}
            className="btn-primary w-full"
            disabled={isScanning || !scanInput}
          >
            {isScanning ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </div>

        {lastScan && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg animate-slide-up">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-green-800">
                  {lastScan.action === 'start' ? '🚀 Sent to CRET' : '✅ Returned from CRET'}
                </p>
                <p className="text-sm text-green-700">
                  {lastScan.associate.name} ({lastScan.associate.login})
                  {lastScan.action === 'return' && ` - ${lastScan.hours.toFixed(2)} hours`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-5 h-5 mr-2 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Tip:</strong> Keep this field focused for barcode scanning
            </span>
          </div>
        </div>
      </div>

      {showWarning && (
        <WarningModal
          data={warningData}
          onOverride={handleWarningOverride}
          onCancel={() => {
            setShowWarning(false);
            setPendingAction(null);
            setIsScanning(false);
          }}
        />
      )}

      {showNamePrompt && (
        <NamePromptModal
          identifier={pendingAssociate?.identifier || pendingAssociate?.login}
          onSubmit={handleNameSubmit}
          onCancel={() => {
            setShowNamePrompt(false);
            setPendingAssociate(null);
            setIsScanning(false);
          }}
        />
      )}

      {showSameDayConfirm && sameDayData && (
        <SameDayConfirmModal
          associate={sameDayData.associate}
          todayData={{
            count: sameDayData.count,
            totalHours: sameDayData.totalHours,
          }}
          onConfirm={handleSameDayConfirm}
          onCancel={() => {
            setShowSameDayConfirm(false);
            setPendingAction(null);
            setIsScanning(false);
          }}
        />
      )}
    </>
  );
}
