import { useState, useEffect } from 'react';
import { getAllCretSessions, formatHours } from '../utils/cretUtils';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    totalHours: 0,
  });

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, filterStatus]);

  const loadSessions = async () => {
    setLoading(true);
    const { data, error } = await getAllCretSessions(500);

    if (error) {
      toast.error('Failed to load history');
      setLoading(false);
      return;
    }

    setSessions(data);
    calculateStats(data);
    setLoading(false);
  };

  const calculateStats = (data) => {
    const completed = data.filter((s) => s.end_time);
    const totalHours = completed.reduce((sum, s) => sum + (parseFloat(s.hours_used) || 0), 0);

    setStats({
      total: data.length,
      completed: completed.length,
      totalHours,
    });
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.associate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.associate?.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.associate?.badge_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'completed') {
      filtered = filtered.filter((s) => s.end_time);
    } else if (filterStatus === 'active') {
      filtered = filtered.filter((s) => !s.end_time);
    }

    setFilteredSessions(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Login', 'Badge ID', 'Start Time', 'End Time', 'Hours', 'Day', 'Week Start'];
    const rows = filteredSessions.map((s) => [
      s.associate?.name || '',
      s.associate?.login || '',
      s.associate?.badge_id || '',
      format(new Date(s.start_time), 'yyyy-MM-dd HH:mm:ss'),
      s.end_time ? format(new Date(s.end_time), 'yyyy-MM-dd HH:mm:ss') : 'In Progress',
      s.hours_used || '',
      format(new Date(s.start_time), 'EEEE'),
      s.week_start || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cret-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('History exported to CSV');
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
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <p className="text-indigo-100 text-sm font-semibold mb-1">Total Sessions</p>
          <p className="text-4xl font-bold">{stats.total}</p>
        </div>
        <div className="card bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <p className="text-teal-100 text-sm font-semibold mb-1">Completed</p>
          <p className="text-4xl font-bold">{stats.completed}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-orange-100 text-sm font-semibold mb-1">Total Hours</p>
          <p className="text-4xl font-bold">{formatHours(stats.totalHours)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by name, login, or badge..."
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
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="all">All Sessions</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
            </select>

            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          All Sessions ({filteredSessions.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="pb-3">Associate</th>
                <th className="pb-3">Start Time</th>
                <th className="pb-3">End Time</th>
                <th className="pb-3">Hours</th>
                <th className="pb-3">Day</th>
                <th className="pb-3">Week</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No sessions found
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {session.associate?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.associate?.login} • {session.associate?.badge_id}
                        </p>
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
                        {session.hours_used ? formatHours(session.hours_used) : '—'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {format(new Date(session.start_time), 'EEEE')}
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {session.week_start
                        ? format(new Date(session.week_start), 'MMM d')
                        : '—'}
                    </td>
                    <td className="py-3">
                      {session.end_time ? (
                        <span className="badge-success">Completed</span>
                      ) : (
                        <span className="badge-info">In Progress</span>
                      )}
                      {session.override_warning && (
                        <span className="badge-warning ml-2" title={session.override_reason}>
                          Override
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
