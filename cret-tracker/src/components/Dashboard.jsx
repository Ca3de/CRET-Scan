import { useState, useEffect } from 'react';
import { getActiveCretSessions, getAllCretSessions, formatHours, autoCloseOldSessions } from '../utils/cretUtils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    totalThisWeek: 0,
    activeNow: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Auto-close sessions older than 11 hours
      const autoCloseResult = await autoCloseOldSessions();
      if (autoCloseResult.closedCount > 0) {
        toast.success(`Auto-closed ${autoCloseResult.closedCount} session(s) older than 11 hours (set to 10 hours)`);
      }

      const [activeResult, recentResult] = await Promise.all([
        getActiveCretSessions(),
        getAllCretSessions(50),
      ]);

      if (activeResult.data) {
        setActiveSessions(activeResult.data);
      }

      if (recentResult.data) {
        setRecentSessions(recentResult.data);
        calculateStats(recentResult.data);
      }

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const calculateStats = (sessions) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const todaySessions = sessions.filter(
      (s) => new Date(s.start_time) >= todayStart && s.hours_used
    );
    const weekSessions = sessions.filter(
      (s) => new Date(s.start_time) >= weekStart && s.hours_used
    );

    setStats({
      totalToday: todaySessions.reduce((sum, s) => sum + (parseFloat(s.hours_used) || 0), 0),
      totalThisWeek: weekSessions.reduce((sum, s) => sum + (parseFloat(s.hours_used) || 0), 0),
      activeNow: activeSessions.length,
    });
  };

  const getElapsedTime = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const hours = (now - start) / (1000 * 60 * 60);
    return formatHours(hours);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">Active Now</p>
              <p className="text-3xl font-bold">{activeSessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold mb-1">Today's Total</p>
              <p className="text-3xl font-bold">{formatHours(stats.totalToday)}</p>
            </div>
            <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold mb-1">This Week</p>
              <p className="text-3xl font-bold">{formatHours(stats.totalThisWeek)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 bg-opacity-30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse-soft"></span>
            Currently in CRET ({activeSessions.length})
          </h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {session.associate?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.associate?.login} • Started{' '}
                    {format(new Date(session.start_time), 'h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">
                    {getElapsedTime(session.start_time)}
                  </p>
                  <p className="text-xs text-gray-600">elapsed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
          <button
            onClick={loadData}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="pb-3">Associate</th>
                <th className="pb-3">Start Time</th>
                <th className="pb-3">End Time</th>
                <th className="pb-3">Hours</th>
                <th className="pb-3">Day</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSessions.slice(0, 10).map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {session.associate?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">{session.associate?.login}</p>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-700">
                    {format(new Date(session.start_time), 'MMM d, h:mm a')}
                  </td>
                  <td className="py-3 text-sm text-gray-700">
                    {session.end_time
                      ? format(new Date(session.end_time), 'MMM d, h:mm a')
                      : '—'}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-800">
                      {session.hours_used
                        ? formatHours(session.hours_used)
                        : getElapsedTime(session.start_time)}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-700">
                    {format(new Date(session.start_time), 'EEEE')}
                  </td>
                  <td className="py-3">
                    {session.end_time ? (
                      <span className="badge-success">Completed</span>
                    ) : (
                      <span className="badge-info">In Progress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
