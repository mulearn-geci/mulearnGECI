import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Sparkles, Search, Filter, Flame, Zap, Award, 
  Crown, GraduationCap, Users, BookOpen, ChevronRight, 
  ArrowUpRight, Star, ShieldCheck, LayoutGrid, List, Activity, X
} from 'lucide-react';

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
  avatar?: string;
}

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
    lc_count: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
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
    lc_count: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
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
    lc_count: 3,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
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
    lc_count: 2,
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
    lc_count: 3,
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
    lc_count: 2,
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
    lc_count: 2,
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
    lc_count: 1,
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
    lc_count: 1,
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
    lc_count: 1,
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
    lc_count: 1,
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
    lc_count: 1,
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
    lc_count: 0,
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
    lc_count: 0,
  }
];

const DEPARTMENTS = ['All', 'CSE', 'ECE', 'EEE', 'ME', 'MR'];

export function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState<'rope' | 'grid' | 'table'>('rope');
  const [selectedMember, setSelectedMember] = useState<LeaderboardMember | null>(null);

  // Sorted list by karma descending
  const sortedMembers = useMemo(() => {
    return [...INITIAL_LEADERBOARD_DATA].sort((a, b) => b.karma - a.karma);
  }, []);

  const maxKarma = sortedMembers[0]?.karma || 1;

  // Filtered members based on search and department
  const filteredMembers = useMemo(() => {
    return sortedMembers.filter(m => {
      const matchesDept = selectedDept === 'All' || m.department === selectedDept;
      const matchesSearch = 
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.muid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [sortedMembers, selectedDept, searchTerm]);

  // Overall campus stats
  const totalKarma = sortedMembers.reduce((acc, curr) => acc + curr.karma, 0);
  const avgKarma = Math.round(totalKarma / sortedMembers.length);

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-blue-600 selection:text-white transition-colors duration-300">
      
      {/* ─── Hero Banner & Stats ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-gray-900 to-gray-950 border-b border-gray-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>µLearn GECI Karma Arena</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4"
          >
            The Vertical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">Karma Rope</span>
          </motion.h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 mb-8">
            Climb the rope by building consistency, committing code, and earning Karma. 
            The higher your Karma, the closer you ascend to the top!
          </p>

          {/* Key Metrics Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-3 text-amber-400 mb-1">
                <Crown className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pioneer</span>
              </div>
              <p className="text-lg font-bold text-white truncate">{sortedMembers[0]?.full_name || 'N/A'}</p>
              <p className="text-xs text-amber-400 font-semibold">{sortedMembers[0]?.karma.toLocaleString()} Karma</p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-3 text-blue-400 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Karma</span>
              </div>
              <p className="text-lg font-bold text-white">{totalKarma.toLocaleString()} XP</p>
              <p className="text-xs text-gray-400">Across campus</p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-3 text-indigo-400 mb-1">
                <Users className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Climbers</span>
              </div>
              <p className="text-lg font-bold text-white">{sortedMembers.length} Members</p>
              <p className="text-xs text-gray-400">Active learners</p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-3 text-emerald-400 mb-1">
                <Activity className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Average XP</span>
              </div>
              <p className="text-lg font-bold text-white">{avgKarma.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Points per student</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Search, Department Filters & View Switcher ─────────────────── */}
      <section className="sticky top-16 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search climber by name or µID..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Department Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('rope')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'rope' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Karma Rope View"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Karma Rope 🪢</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid 🎴</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Climbers Found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search query or department filter.</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: THE VERTICAL KARMA ROPE */}
            {viewMode === 'rope' && (
              <div className="relative py-12 min-h-[900px] flex flex-col items-center">
                
                {/* Central Glowing Energy Rope */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-amber-400 via-blue-500 to-indigo-700 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-0" />
                
                {/* Top Rope Crown Anchor */}
                <div className="relative z-10 bg-amber-500 text-gray-950 font-extrabold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)] flex items-center space-x-2 mb-12 -mt-4">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest">Summit Peak • 100% Karma</span>
                </div>

                {/* Rope Nodes Stack */}
                <div className="w-full max-w-4xl space-y-12 relative z-10">
                  {filteredMembers.map((member, index) => {
                    const isEven = index % 2 === 0;
                    const relativeOffset = maxKarma > 0 ? (member.karma / maxKarma) : 0;
                    
                    return (
                      <motion.div
                        key={member.muid}
                        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`flex items-center w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        {/* Member Card Box */}
                        <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                          <div
                            onClick={() => setSelectedMember(member)}
                            className="inline-block bg-gray-900/90 border border-gray-800 hover:border-blue-500/80 rounded-2xl p-4 shadow-xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-300 group hover:-translate-y-1"
                          >
                            <div className={`flex items-center space-x-3 ${isEven ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                              
                              {/* Avatar / Badge */}
                              <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center font-bold text-sm bg-gray-800 text-white ${
                                  member.rank === 1 ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]' :
                                  member.rank === 2 ? 'border-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.5)]' :
                                  member.rank === 3 ? 'border-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.5)]' :
                                  'border-blue-500/40'
                                }`}>
                                  {member.avatar ? (
                                    <img src={member.avatar} alt={member.full_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{member.full_name.slice(0, 2).toUpperCase()}</span>
                                  )}
                                </div>
                                
                                {/* Rank Tag */}
                                <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  member.rank === 1 ? 'bg-amber-400 text-gray-950' :
                                  member.rank === 2 ? 'bg-slate-300 text-gray-950' :
                                  member.rank === 3 ? 'bg-amber-700 text-white' :
                                  'bg-blue-600 text-white'
                                }`}>
                                  #{member.rank}
                                </span>
                              </div>

                              {/* Info */}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                                    {member.full_name}
                                  </h3>
                                  {member.is_alumni && (
                                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-1.5 py-0.5 rounded">
                                      Alumni
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{member.muid}</p>
                                
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {member.karma.toLocaleString()} XP
                                  </span>
                                  <span className="bg-gray-800 text-gray-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                    Lvl {member.level}
                                  </span>
                                  <span className="bg-gray-800 text-gray-400 text-[11px] px-2 py-0.5 rounded-full">
                                    {member.department}
                                  </span>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>

                        {/* Central Node Indicator on Rope */}
                        <div className="relative z-20 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full border-2 bg-gray-950 flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                            member.rank === 1 ? 'border-amber-400 text-amber-400 shadow-amber-400/40' :
                            member.rank === 2 ? 'border-slate-300 text-slate-300' :
                            member.rank === 3 ? 'border-amber-600 text-amber-600' :
                            'border-blue-500 text-blue-400'
                          }`}>
                            <Zap className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Spacer for Alternate Side */}
                        <div className="w-1/2" />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Rope Base Camp Anchor */}
                <div className="relative z-10 bg-gray-800 text-gray-400 font-bold px-4 py-1.5 rounded-full border border-gray-700 text-xs uppercase tracking-widest mt-12">
                  <span>Base Camp • Start of Journey</span>
                </div>

              </div>
            )}

            {/* VIEW 2: CARDS GRID */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.muid}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedMember(member)}
                    className="bg-gray-900/90 border border-gray-800 hover:border-blue-500/80 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        member.rank === 1 ? 'bg-amber-400 text-gray-950' :
                        member.rank === 2 ? 'bg-slate-300 text-gray-950' :
                        member.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                      }`}>
                        Rank #{member.rank}
                      </span>
                      <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                        Lvl {member.level}
                      </span>
                    </div>

                    <div className="text-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/40 mx-auto mb-3 flex items-center justify-center font-bold text-lg bg-gray-800 text-white">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{member.full_name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors">
                        {member.full_name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{member.muid}</p>
                    </div>

                    <div className="bg-gray-950/60 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Karma XP</p>
                        <p className="text-sm font-extrabold text-blue-400">{member.karma.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dept</p>
                        <p className="text-sm font-bold text-gray-300">{member.department}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* VIEW 3: CLASSIC TABLE */}
            {viewMode === 'table' && (
              <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-950 text-gray-400 uppercase text-[11px] font-bold tracking-wider border-b border-gray-800">
                      <tr>
                        <th className="py-4 px-6">Rank</th>
                        <th className="py-4 px-6">Student</th>
                        <th className="py-4 px-6">Karma XP</th>
                        <th className="py-4 px-6">Level</th>
                        <th className="py-4 px-6">Dept</th>
                        <th className="py-4 px-6">IGs & Circles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredMembers.map((member) => (
                        <tr
                          key={member.muid}
                          onClick={() => setSelectedMember(member)}
                          className="hover:bg-gray-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-6 font-extrabold text-white">
                            <span className={`px-2.5 py-1 rounded-full text-xs ${
                              member.rank === 1 ? 'bg-amber-400 text-gray-950' :
                              member.rank === 2 ? 'bg-slate-300 text-gray-950' :
                              member.rank === 3 ? 'bg-amber-700 text-white' :
                              'text-gray-400'
                            }`}>
                              #{member.rank}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                                {member.avatar ? (
                                  <img src={member.avatar} alt={member.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{member.full_name.slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-white hover:text-blue-400 transition-colors">{member.full_name}</p>
                                <p className="text-xs text-gray-500 font-mono">{member.muid}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-extrabold text-blue-400">
                            {member.karma.toLocaleString()} XP
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                              Lvl {member.level}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-300">
                            {member.department}
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-400">
                            <span className="text-indigo-400 font-bold">{member.ig_count}</span> IGs • <span className="text-emerald-400 font-bold">{member.lc_count}</span> Circles
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Student RPG Character Card Modal ─────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/60 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Character Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 flex items-center justify-center font-bold text-xl bg-gray-800 text-white flex-shrink-0">
                  {selectedMember.avatar ? (
                    <img src={selectedMember.avatar} alt={selectedMember.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedMember.full_name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedMember.full_name}</h3>
                  <p className="text-xs text-blue-400 font-mono">{selectedMember.muid}</p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                      Rank #{selectedMember.rank}
                    </span>
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                      Level {selectedMember.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Karma Points</span>
                  <span className="text-lg font-extrabold text-blue-400">{selectedMember.karma.toLocaleString()} XP</span>
                </div>
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Recent Boost</span>
                  <span className="text-lg font-extrabold text-emerald-400">+{selectedMember.last_karma_gained} XP</span>
                </div>
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Interest Groups</span>
                  <span className="text-lg font-extrabold text-indigo-400">{selectedMember.ig_count} Groups</span>
                </div>
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Learning Circles</span>
                  <span className="text-lg font-extrabold text-amber-400">{selectedMember.lc_count} Circles</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs border-t border-gray-800 pt-4">
                <div className="flex justify-between py-1 text-gray-400">
                  <span>Department</span>
                  <span className="text-white font-bold">{selectedMember.department}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-400">
                  <span>Graduation Year</span>
                  <span className="text-white font-bold">{selectedMember.graduation_year}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-400">
                  <span>Status</span>
                  <span className="text-white font-bold">{selectedMember.is_alumni ? 'Alumni' : 'Active Student'}</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
