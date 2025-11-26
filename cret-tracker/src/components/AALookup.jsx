import { useState, useEffect } from 'react';
import { getAllAssociates, getAssociateCretHistory, formatHours } from '../utils/cretUtils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AALookup() {
  const [associates, setAssociates] = useState([]);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [groupedSessions, setGroupedSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    totalDays: 0,
  });

  useEffect(() => {
    loadAssociates();
  }, []);

  useEffect(() => {
    if (selectedAssociate) {
      loadAssociateSessions(selectedAssociate.id);
    }
  }, [selectedAssociate]);

  const loadAssociates = async () => {
    setLoading(true);
    const { data, error } = await getAllAssociates();

    if (error) {
      toast.error('Failed to load associates');
      setLoading(false);
      return;
    }

    setAssociates(data);
    setLoading(false);
  };

  const loadAssociateSessions = async (associateId) => {
    const { data, error } = await getAssociateCretHistory(associateId);

    if (error) {
      toast.error('Failed to load sessions');
      return;
    }

    setSessions(data);
    groupSessionsByDate(data);
    calculateStats(data);
  };

  const groupSessionsByDate = (sessions) => {
    const grouped = {};

    sessions.forEach((session) => {
      if (!session.end_time || !session.hours_used) return; // Skip incomplete sessions

      const date = format(new Date(session.start_time), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = {
          date,
          sessions: [],
          totalHours: 0,
        };
      }

      grouped[date].sessions.push(session);
      grouped[date].totalHours += parseFloat(session.hours_used) || 0;
    });

    setGroupedSessions(grouped);
  };

  const calculateStats = (data) => {
    const completedSessions = data.filter((s) => s.end_time && s.hours_used);
    const totalHours = completedSessions.reduce(
      (sum, s) => sum + (parseFloat(s.hours_used) || 0),
      0
    );
    const uniqueDates = new Set(
      completedSessions.map((s) => format(new Date(s.start_time), 'yyyy-MM-dd'))
    );

    setStats({
      totalSessions: completedSessions.length,
      totalHours,
      totalDays: uniqueDates.size,
    });
  };

  const filteredAssociates = associates.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      (a.name && a.name.toLowerCase().includes(search)) ||
      a.login.toLowerCase().includes(search) ||
      a.badge_id.toLowerCase().includes(search)
    );
  });

  const sortedDates = Object.keys(groupedSessions).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search/Select Associate */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 AA Lookup</h2>
        <p className="text-gray-600 mb-4">
          Search for an associate to view their complete CRET history grouped by date
        </p>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name, login, or badge ID..."
            autoFocus
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {searchTerm && filteredAssociates.length > 0 && (
          <div className="mt-3 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg">
            {filteredAssociates.slice(0, 10).map((associate) => (
              <button
                key={associate.id}
                onClick={() => {
                  setSelectedAssociate(associate);
                  setSearchTerm('');
                }}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <p className="font-semibold text-gray-800">
                  {associate.name || 'No name set'}
                </p>
                <p className="text-sm text-gray-600">
                  {associate.login} • {associate.badge_id}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Associate Info & Stats */}
      {selectedAssociate && (
        <>
          <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">{selectedAssociate.name}</h3>
                <p className="text-primary-100">
                  {selectedAssociate.login} • Badge: {selectedAssociate.badge_id}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssociate(null);
                  setSessions([]);
                  setGroupedSessions({});
                }}
                className="text-white hover:bg-primary-700 p-2 rounded-lg transition-colors"
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
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <p className="text-blue-100 text-sm font-semibold mb-1">Total Sessions</p>
              <p className="text-4xl font-bold">{stats.totalSessions}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <p className="text-green-100 text-sm font-semibold mb-1">Total Hours</p>
              <p className="text-4xl font-bold">{formatHours(stats.totalHours)}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <p className="text-purple-100 text-sm font-semibold mb-1">Days in CRET</p>
              <p className="text-4xl font-bold">{stats.totalDays}</p>
            </div>
          </div>

          {/* Sessions Grouped by Date */}
          {sortedDates.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No completed CRET sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map((dateKey) => {
                const dateData = groupedSessions[dateKey];
                return (
                  <div key={dateKey} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {dateData.sessions.length} session{dateData.sessions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {formatHours(dateData.totalHours)}
                        </p>
                        <p className="text-sm text-gray-600">total</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="pb-2">Start Time</th>
                            <th className="pb-2">End Time</th>
                            <th className="pb-2">Duration</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {dateData.sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50">
                              <td className="py-2 text-sm text-gray-700">
                                {format(new Date(session.start_time), 'h:mm a')}
                              </td>
                              <td className="py-2 text-sm text-gray-700">
                                {session.end_time
                                  ? format(new Date(session.end_time), 'h:mm a')
                                  : '—'}
                              </td>
                              <td className="py-2">
                                <span className="font-semibold text-gray-800">
                                  {session.hours_used ? formatHours(session.hours_used) : '—'}
                                </span>
                              </td>
                              <td className="py-2">
                                <div>
                                  {session.end_time ? (
                                    <span className="badge-success">Completed</span>
                                  ) : (
                                    <span className="badge-info">In Progress</span>
                                  )}
                                  {session.override_warning && (
                                    <span className="badge-warning ml-2">
                                      Override
                                    </span>
                                  )}
                                </div>
                                {session.override_warning && session.override_reason && (
                                  <p className="text-xs text-amber-700 mt-1 italic">
                                    "{session.override_reason}"
                                  </p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* No Associate Selected */}
      {!selectedAssociate && (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg">Search for an associate to view their CRET history</p>
        </div>
      )}
    </div>
  );
}
