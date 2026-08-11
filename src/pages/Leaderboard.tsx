import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Sparkles, Search, Filter, Flame, Zap, Award, 
  Crown, GraduationCap, Users, BookOpen, ChevronRight, 
  ArrowUpRight, Star, ShieldCheck, LayoutGrid, List, Activity, X
} from 'lucide-react';
import { leaderboardAPI } from '../services/api';

export interface LeaderboardMember {
  full_name: string;
  muid: string;
  karma: number;
  rank: number;
  level: number;
  join_date: string;
  last_karma_gained: number;
  graduation_year: string;
  department: string;
  is_alumni: boolean;
  ig_count: number;
  lc_count: number;
}

// Helper to extract student initials (e.g. Roshan Alexander -> RA)
const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
};

// Safe Karma Formatter to prevent unhandled TypeError crashes
const formatKarma = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return val.toLocaleString();
};

// Abbreviate long department names cleanly or return '' if no department is specified
const getDeptAbbreviation = (deptStr: string | null | undefined): string => {
  if (!deptStr || typeof deptStr !== 'string') return '';
  const str = deptStr.trim();
  const upper = str.toUpperCase();
  if (!str || str === '-' || upper === 'NONE' || upper === 'N/A' || upper === 'NULL' || upper === 'NO DEPARTMENT') {
    return '';
  }
  // Reject Level strings (e.g. "LVL3", "LVL5", "LEVEL 4") shifted from CSV columns
  if (upper.startsWith('LVL') || upper.startsWith('LEVEL') || /^LVL\d+/i.test(upper)) {
    return '';
  }

  if (upper.includes('ROBOTICS') || upper.includes('ARTIFICIAL INTELLIGENCE') || upper === 'RAI') return 'RAI';
  if (upper.includes('ELECTRICAL AND ELECTRONICS') || upper.includes('ELECTRICAL & ELECTRONICS') || upper === 'EEE' || upper.includes('ELECTRICAL')) return 'EEE';
  if (upper.includes('ELECTRONICS AND COMMUNICATION') || upper.includes('ELECTRONICS & COMMUNICATION') || upper === 'ECE' || upper.includes('ELECTRONICS')) return 'ECE';
  if (upper.includes('INFORMATION TECHNOLOGY') || upper === 'IT' || upper.includes('INFORMATION')) return 'IT';
  if (upper.includes('COMPUTER SCIENCE AND ENGINEERING') || upper.includes('COMPUTER SCIENCE & ENGINEERING') || upper.includes('COMPUTER SCIENCE') || upper === 'CSE' || upper.includes('COMPUTER')) return 'CSE';
  if (upper.includes('MECHANICAL ENGINEERING') || upper.includes('MECHANICAL') || upper === 'ME') return 'ME';
  
  if (['CSE', 'ECE', 'EEE', 'ME', 'RAI', 'IT'].includes(upper)) return upper;
  return '';
};

// Compute dynamic level based on Karma XP
const computeLevel = (karma: number | null | undefined, rawLevel?: number): number => {
  const k = typeof karma === 'number' && !isNaN(karma) ? karma : 0;
  if (k >= 25000) return 7;
  if (k >= 15000) return 6;
  if (k >= 10000) return 5;
  if (k >= 5000) return 4;
  if (k >= 2500) return 3;
  if (k >= 1000) return 2;
  if (typeof rawLevel === 'number' && rawLevel > 0) return rawLevel;
  return 1;
};

// High quality mock dataset based on exact CSV columns provided by user
const INITIAL_LEADERBOARD_DATA: LeaderboardMember[] = [
  {
    full_name: 'Albert George',
    muid: 'albertgeorge@mulearn',
    karma: 14850,
    rank: 1,
    level: 5,
    join_date: '2022-09-15',
    last_karma_gained: 850,
    graduation_year: '2025',
    department: 'CSE',
    is_alumni: false,
    ig_count: 8,
    lc_count: 5
  },
  {
    full_name: 'Rahul K',
    muid: 'rahulk@mulearn',
    karma: 12400,
    rank: 2,
    level: 5,
    join_date: '2022-10-01',
    last_karma_gained: 400,
    graduation_year: '2024',
    department: 'CSE',
    is_alumni: true,
    ig_count: 6,
    lc_count: 4
  },
  {
    full_name: 'Ananya S',
    muid: 'ananyas@mulearn',
    karma: 10950,
    rank: 3,
    level: 4,
    join_date: '2023-01-10',
    last_karma_gained: 650,
    graduation_year: '2025',
    department: 'ECE',
    is_alumni: false,
    ig_count: 5,
    lc_count: 3
  },
  {
    full_name: 'Vaisakh M',
    muid: 'vaisakhm@mulearn',
    karma: 9600,
    rank: 4,
    level: 4,
    join_date: '2023-02-14',
    last_karma_gained: 300,
    graduation_year: '2025',
    department: 'EEE',
    is_alumni: false,
    ig_count: 7,
    lc_count: 2
  },
  {
    full_name: 'Devika Nair',
    muid: 'devikanair@mulearn',
    karma: 8450,
    rank: 5,
    level: 4,
    join_date: '2023-03-01',
    last_karma_gained: 500,
    graduation_year: '2026',
    department: 'CSE',
    is_alumni: false,
    ig_count: 4,
    lc_count: 3
  },
  {
    full_name: 'Nidhin Joseph',
    muid: 'nidhinj@mulearn',
    karma: 7300,
    rank: 6,
    level: 3,
    join_date: '2023-04-12',
    last_karma_gained: 200,
    graduation_year: '2026',
    department: 'ME',
    is_alumni: false,
    ig_count: 3,
    lc_count: 2
  },
  {
    full_name: 'Avani R',
    muid: 'avanir@mulearn',
    karma: 6400,
    rank: 7,
    level: 3,
    join_date: '2023-05-20',
    last_karma_gained: 450,
    graduation_year: '2026',
    department: 'ECE',
    is_alumni: false,
    ig_count: 4,
    lc_count: 2
  },
  {
    full_name: 'Jeevan Prakash',
    muid: 'jeevanp@mulearn',
    karma: 5200,
    rank: 8,
    level: 3,
    join_date: '2023-07-05',
    last_karma_gained: 150,
    graduation_year: '2027',
    department: 'MR',
    is_alumni: false,
    ig_count: 2,
    lc_count: 1
  },
  {
    full_name: 'Anandhu V',
    muid: 'anandhuv@mulearn',
    karma: 4350,
    rank: 9,
    level: 2,
    join_date: '2023-08-11',
    last_karma_gained: 300,
    graduation_year: '2027',
    department: 'CSE',
    is_alumni: false,
    ig_count: 3,
    lc_count: 1
  },
  {
    full_name: 'Rejin Thomas',
    muid: 'rejint@mulearn',
    karma: 3600,
    rank: 10,
    level: 2,
    join_date: '2023-09-02',
    last_karma_gained: 100,
    graduation_year: '2027',
    department: 'EEE',
    is_alumni: false,
    ig_count: 2,
    lc_count: 1
  },
  {
    full_name: 'Shimna K',
    muid: 'shimnak@mulearn',
    karma: 2850,
    rank: 11,
    level: 2,
    join_date: '2023-10-15',
    last_karma_gained: 250,
    graduation_year: '2027',
    department: 'ME',
    is_alumni: false,
    ig_count: 2,
    lc_count: 1
  },
  {
    full_name: 'Nicho John',
    muid: 'nichoj@mulearn',
    karma: 1950,
    rank: 12,
    level: 1,
    join_date: '2023-11-20',
    last_karma_gained: 50,
    graduation_year: '2027',
    department: 'MR',
    is_alumni: false,
    ig_count: 1,
    lc_count: 1
  },
  {
    full_name: 'Ihsaan Ahmed',
    muid: 'ihsaana@mulearn',
    karma: 1200,
    rank: 13,
    level: 1,
    join_date: '2023-12-01',
    last_karma_gained: 100,
    graduation_year: '2027',
    department: 'CSE',
    is_alumni: false,
    ig_count: 1,
    lc_count: 0
  },
  {
    full_name: 'Navya Mariam John',
    muid: 'navyamj@mulearn',
    karma: 650,
    rank: 14,
    level: 1,
    join_date: '2024-01-10',
    last_karma_gained: 50,
    graduation_year: '2027',
    department: 'ECE',
    is_alumni: false,
    ig_count: 1,
    lc_count: 0
  }
];

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'EEE', 'ME', 'RAI'];

export function Leaderboard() {
  const [members, setMembers] = useState<LeaderboardMember[]>(INITIAL_LEADERBOARD_DATA);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState<'rope' | 'grid' | 'table'>('rope');
  const [selectedMember, setSelectedMember] = useState<LeaderboardMember | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await leaderboardAPI.getAll();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setMembers(res.data.map((m: LeaderboardMember) => ({
            ...m,
            department: getDeptAbbreviation(m.department),
            level: computeLevel(m.karma, m.level)
          })));
        }
      } catch (err) {
        console.error('Error fetching live leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Sorted list by karma descending with complete null safety
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (b?.karma || 0) - (a?.karma || 0));
  }, [members]);

  const maxKarma = sortedMembers[0]?.karma || 1;

  // Filtered members based on search and department with complete null safety
  const filteredMembers = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return sortedMembers.filter(m => {
      if (!m) return false;
      const dept = getDeptAbbreviation(m.department);
      const matchesDept = selectedDept === 'All' || (dept !== '' && dept === selectedDept);
      const name = (m.full_name || '').toLowerCase();
      const muid = (m.muid || '').toLowerCase();
      const matchesSearch = name.includes(term) || muid.includes(term) || dept.toLowerCase().includes(term);
      return matchesDept && matchesSearch;
    });
  }, [sortedMembers, selectedDept, searchTerm]);

  // Overall campus stats with complete null safety
  const totalKarma = sortedMembers.reduce((acc, curr) => acc + (curr?.karma || 0), 0);
  const avgKarma = sortedMembers.length > 0 ? Math.round(totalKarma / sortedMembers.length) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* ─── Hero Banner & Stats ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/10 dark:bg-blue-500/10 border border-white/20 dark:border-blue-500/30 px-4 py-1.5 rounded-full text-white dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>µLearn GECI Leaderboard & Arena</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            The Vertical <span className="text-amber-300 dark:text-blue-400">Karma Rope</span>
          </motion.h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-blue-100 dark:text-gray-300 mb-8 leading-relaxed">
            Climb the rope by building consistency, submitting proof-of-work, and earning Karma. 
            The higher your Karma, the closer you ascend to the top!
          </p>

          {/* Key Metrics Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/80 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-2 text-amber-300 dark:text-amber-400 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100 dark:text-gray-400">Pioneer</span>
              </div>
              <p className="text-lg font-bold text-white truncate">{sortedMembers[0]?.full_name || 'N/A'}</p>
              <p className="text-xs text-amber-300 dark:text-amber-400 font-semibold">{formatKarma(sortedMembers[0]?.karma)} Karma</p>
            </div>

            <div className="bg-white/10 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/80 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-2 text-blue-200 dark:text-blue-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100 dark:text-gray-400">Total Karma</span>
              </div>
              <p className="text-lg font-bold text-white">{formatKarma(totalKarma)} XP</p>
              <p className="text-xs text-blue-100 dark:text-gray-400">Across campus</p>
            </div>

            <div className="bg-white/10 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/80 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-2 text-indigo-200 dark:text-indigo-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100 dark:text-gray-400">Climbers</span>
              </div>
              <p className="text-lg font-bold text-white">{sortedMembers.length} Members</p>
              <p className="text-xs text-blue-100 dark:text-gray-400">Active learners</p>
            </div>

            <div className="bg-white/10 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/80 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-2 text-emerald-300 dark:text-emerald-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100 dark:text-gray-400">Average XP</span>
              </div>
              <p className="text-lg font-bold text-white">{formatKarma(avgKarma)}</p>
              <p className="text-xs text-blue-100 dark:text-gray-400">Points per student</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Search, Department Filters & View Switcher ─────────────────── */}
      <section className="sticky top-16 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search climber by name or µID..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Department Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setViewMode('rope')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'rope' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Karma Rope View"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Karma Rope 🪢</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid 🎴</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Classic Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table 📊</span>
            </button>
          </div>

        </div>
      </section>

      {/* ─── Main Content Area ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Climbers Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search query or department filter.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* VIEW 1: THE VERTICAL KARMA ROPE */}
            {viewMode === 'rope' && (
              <motion.div
                key="rope-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="relative py-8 sm:py-12 min-h-[600px] flex flex-col items-center overflow-hidden"
              >
                
                {/* Central / Left Glowing Energy Rope */}
                <div className="absolute top-0 bottom-0 left-6 sm:left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-amber-400 via-blue-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] z-0" />
                
                {/* Top Rope Crown Anchor */}
                <div className="relative z-10 bg-amber-500 text-gray-950 font-extrabold px-4 py-1.5 rounded-full shadow-lg flex items-center space-x-2 mb-8 sm:mb-12 -mt-4 text-center">
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs uppercase tracking-widest">Summit Peak • 100% Karma</span>
                </div>

                {/* Rope Nodes Stack */}
                <div className="w-full max-w-4xl space-y-6 sm:space-y-12 relative z-10">
                  {filteredMembers.map((member, index) => {
                    const isEven = index % 2 === 0;
                    
                    return (
                      <motion.div
                        key={member.muid}
                        initial={{ opacity: 0, x: isEven ? -35 : 35 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
                        className="relative flex items-center w-full"
                      >
                        {/* Rope Node Indicator */}
                        <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 bg-white dark:bg-gray-900 flex items-center justify-center shadow-md transition-transform hover:scale-125 ${
                            member.rank === 1 ? 'border-amber-400 text-amber-500 shadow-amber-400/30' :
                            member.rank === 2 ? 'border-slate-400 text-slate-500' :
                            member.rank === 3 ? 'border-amber-700 text-amber-700' :
                            'border-blue-500 text-blue-600 dark:text-blue-400'
                          }`}>
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                        </div>

                        {/* Member Card Box */}
                        <div className={`w-full pl-12 sm:pl-0 sm:w-1/2 ${isEven ? 'sm:pr-8 sm:text-right sm:ml-0' : 'sm:pl-8 sm:text-left sm:ml-auto'}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setSelectedMember(member)}
                            className="w-full bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 hover:border-blue-500/80 dark:hover:border-blue-500/80 rounded-2xl p-3.5 sm:p-4 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 group hover:-translate-y-1"
                          >
                            <div className={`flex items-center space-x-3 ${isEven ? 'sm:flex-row-reverse sm:space-x-reverse' : 'flex-row'}`}>
                              
                              {/* Avatar Badge with Name Initials */}
                              <div className="relative flex-shrink-0">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-xs sm:text-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md ${
                                  member.rank === 1 ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
                                  member.rank === 2 ? 'border-slate-400' :
                                  member.rank === 3 ? 'border-amber-600' :
                                  'border-blue-500/40'
                                }`}>
                                  <span>{getInitials(member.full_name)}</span>
                                </div>
                                
                                {/* Rank Tag */}
                                <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold shadow-sm ${
                                  member.rank === 1 ? 'bg-amber-400 text-gray-950' :
                                  member.rank === 2 ? 'bg-slate-300 text-gray-950' :
                                  member.rank === 3 ? 'bg-amber-700 text-white' :
                                  'bg-blue-600 text-white'
                                }`}>
                                  #{member.rank}
                                </span>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className={`flex items-center space-x-2 ${isEven ? 'sm:justify-end' : 'justify-start'}`}>
                                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {member.full_name}
                                  </h3>
                                  {member.is_alumni && (
                                    <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                                      Alumni
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">{member.muid}</p>
                                
                                <div className={`flex flex-wrap items-center gap-1.5 mt-2 ${isEven ? 'sm:justify-end' : 'justify-start'}`}>
                                  <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                                    {formatKarma(member.karma)} XP
                                  </span>
                                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                    Lvl {member.level}
                                  </span>
                                  {getDeptAbbreviation(member.department) ? (
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium">
                                      {getDeptAbbreviation(member.department)}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Rope Base Camp Anchor */}
                <div className="relative z-10 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-xs uppercase tracking-widest mt-12 shadow-sm">
                  <span>Base Camp • Start of Journey</span>
                </div>

              </motion.div>
            )}

            {/* VIEW 2: CARDS GRID */}
            {viewMode === 'grid' && (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredMembers.map((member) => (
                  <div
                    key={member.muid}
                    onClick={() => setSelectedMember(member)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500/80 rounded-2xl p-4 sm:p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        member.rank === 1 ? 'bg-amber-400 text-gray-950' :
                        member.rank === 2 ? 'bg-slate-300 text-gray-950' :
                        member.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                      }`}>
                        Rank #{member.rank}
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                        Lvl {member.level}
                      </span>
                    </div>

                    <div className="text-center mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-blue-500/40 mx-auto mb-3 flex items-center justify-center font-extrabold text-lg sm:text-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                        <span>{getInitials(member.full_name)}</span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {member.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">{member.muid}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Karma XP</p>
                        <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{formatKarma(member.karma)}</p>
                      </div>
                      {getDeptAbbreviation(member.department) ? (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Dept</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{getDeptAbbreviation(member.department)}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIEW 3: CLASSIC TABLE */}
            {viewMode === 'table' && (
              <motion.div
                key="table-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 uppercase text-[11px] font-bold tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Rank</th>
                        <th className="py-3.5 px-4 sm:px-6">Student</th>
                        <th className="py-3.5 px-4 sm:px-6">Karma XP</th>
                        <th className="py-3.5 px-4 sm:px-6">Level</th>
                        <th className="py-3.5 px-4 sm:px-6">Dept</th>
                        <th className="py-3.5 px-4 sm:px-6">IGs & Circles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                      {filteredMembers.map((member) => (
                        <tr
                          key={member.muid}
                          onClick={() => setSelectedMember(member)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 sm:px-6 font-extrabold text-gray-900 dark:text-white">
                            <span className={`px-2.5 py-1 rounded-full text-xs ${
                              member.rank === 1 ? 'bg-amber-400 text-gray-950' :
                              member.rank === 2 ? 'bg-slate-300 text-gray-950' :
                              member.rank === 3 ? 'bg-amber-700 text-white' :
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              #{member.rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-extrabold text-xs text-white flex-shrink-0 shadow-sm">
                                <span>{getInitials(member.full_name)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">{member.full_name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{member.muid}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 font-extrabold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {formatKarma(member.karma)} XP
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                              Lvl {member.level}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {getDeptAbbreviation(member.department) || '—'}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{member.ig_count}</span> IGs • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{member.lc_count}</span> Circles
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ─── Student RPG Character Card Modal ─────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-gray-900 dark:text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-700/60 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Character Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center font-extrabold text-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-shrink-0 shadow-md">
                  <span>{getInitials(selectedMember.full_name)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMember.full_name}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">{selectedMember.muid}</p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="bg-blue-100 dark:bg-blue-600/30 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                      Rank #{selectedMember.rank}
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                      Level {selectedMember.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Karma Points</span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{formatKarma(selectedMember.karma)} XP</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Recent Boost</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">+{selectedMember.last_karma_gained} XP</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Interest Groups</span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{selectedMember.ig_count} Groups</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Learning Circles</span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{selectedMember.lc_count} Circles</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs border-t border-gray-200 dark:border-gray-700 pt-4">
                {getDeptAbbreviation(selectedMember.department) ? (
                  <div className="flex justify-between py-1 text-gray-500 dark:text-gray-400">
                    <span>Department</span>
                    <span className="text-gray-900 dark:text-white font-bold">{getDeptAbbreviation(selectedMember.department)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between py-1 text-gray-500 dark:text-gray-400">
                  <span>Graduation Year</span>
                  <span className="text-gray-900 dark:text-white font-bold">{selectedMember.graduation_year}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-500 dark:text-gray-400">
                  <span>Status</span>
                  <span className="text-gray-900 dark:text-white font-bold">{selectedMember.is_alumni ? 'Alumni' : 'Active Student'}</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
