import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, RefreshCw, Database, CheckCircle, AlertCircle, Users, Trophy } from 'lucide-react';
import { leaderboardAPI } from '../../services/api';
import { AdminLayout } from '../../components/AdminLayout';

function parseCSV(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

export function AdminLeaderboard() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({ totalStudents: 0, lastUpdated: '' });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await leaderboardAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setStats({
          totalStudents: res.data.length,
          lastUpdated: res.data[0]?.lastUpdated ? new Date(res.data[0].lastUpdated).toLocaleString() : 'Never'
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setSyncing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const students = parseCSV(text);
        const res = await leaderboardAPI.sync(students);
        if (res.success) {
          setMessage({ type: 'success', text: res.message || 'Leaderboard synced successfully!' });
          fetchStats();
        } else {
          setMessage({ type: 'error', text: res.message || 'Failed to sync leaderboard' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Error processing CSV upload' });
      } finally {
        setSyncing(false);
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Error reading CSV file' });
      setSyncing(false);
    };
    reader.readAsText(file);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2.5">
              <Trophy className="w-7 h-7 text-amber-500 flex-shrink-0" />
              <span>Leaderboard Data Sync & Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Automated daily sync runs at <span className="font-semibold text-gray-700 dark:text-gray-300">12:00 AM IST</span>. You can also upload a CSV manually below.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading || syncing}
            className="inline-flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-2xl text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Active Leaderboard Records</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white truncate">{stats.totalStudents} Students</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center space-x-4">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-4 rounded-2xl text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Database className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Last Database Sync</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{stats.lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* CSV File Dropzone */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
              <Upload className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload Campus CSV File</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Drag and drop the CSV file exported from <span className="font-mono text-blue-600 dark:text-blue-400">app.mulearn.org</span> or select it from your computer.
            </p>

            <label className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-lg shadow-blue-600/20">
              <Upload className="w-4 h-4" />
              <span>{syncing ? 'Processing CSV...' : 'Select CSV File'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={syncing}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
