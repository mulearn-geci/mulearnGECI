import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Linkedin, Github, Mail, Instagram,
  Briefcase, GraduationCap, Award, Building2,
  Filter, ChevronDown, Check, Sparkles,
  Globe, TrendingUp, HeartHandshake, Rocket, Loader2
} from 'lucide-react';
import { alumniAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

interface AlumniMember {
  _id: string;
  name: string;
  pastRole: string;
  graduationYear: string;
  currentCompany?: string;
  currentRole?: string;
  domain?: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  instagram?: string;
  order?: number;
}

const legacyItems = [
  {
    icon: TrendingUp,
    title: 'Industry Impact',
    description: 'Our alumni are driving innovation at top-tier companies, startups, and research labs across the globe.',
  },
  {
    icon: HeartHandshake,
    title: 'Community Roots',
    description: 'From founding µLearn GECI to mentoring the next batch — their contributions live on in our culture.',
  },
  {
    icon: Rocket,
    title: 'Inspiring the Next Generation',
    description: 'Their journeys serve as a roadmap for current members to dream bigger and work smarter.',
  },
];

export function Alumni() {
  const [alumni, setAlumni] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const res = await alumniAPI.getAll();
      if (res.success && res.data) {
        setAlumni(res.data);
      }
    } catch (err) {
      console.error('Error fetching alumni:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const uniqueYears = Array.from(
    new Set(alumni.map((a) => a.graduationYear).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const filteredAlumni = alumni.filter((member) => {
    const matchesYear = selectedYear === 'all' || member.graduationYear === selectedYear;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      member.name.toLowerCase().includes(search) ||
      member.pastRole.toLowerCase().includes(search) ||
      (member.currentCompany && member.currentCompany.toLowerCase().includes(search)) ||
      (member.currentRole && member.currentRole.toLowerCase().includes(search)) ||
      (member.domain && member.domain.toLowerCase().includes(search));
    return matchesYear && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Alumni Network & Directory
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Celebrating the pioneers, past Execom leads, and community graduates who built µLearn GECI and are now shaping the future of technology across top companies worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Legacy & Impact Section ───────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Their Legacy Lives On
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Every alumnus carries the spirit of µLearn GECI — curiosity, collaboration, and relentless pursuit of excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {legacyItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Alumni Directory Section ──────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center space-x-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Globe className="h-4 w-4" />
              <span>Graduates & Former Members</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Alumni
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From our halls to the global stage — these are the µLearn GECI graduates making their mark.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-10">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, company, role, domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 w-full border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  selectedYear !== 'all'
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>{selectedYear === 'all' ? 'Filter Batch' : `Batch ${selectedYear}`}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20"
                    >
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                        <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-blue-500" /> Select Batch Year
                      </div>
                      <button
                        onClick={() => { setSelectedYear('all'); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                          selectedYear === 'all'
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>All Batches</span>
                        {selectedYear === 'all' && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      </button>
                      {uniqueYears.map((year) => (
                        <button
                          key={year}
                          onClick={() => { setSelectedYear(year); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                            selectedYear === year
                              ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span>Batch {year}</span>
                          {selectedYear === year && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <GraduationCap className="h-14 w-14 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Alumni Found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Try adjusting your search query or batch filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredAlumni.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo */}
                  <div>
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={
                          member.image
                            ? getImageUrl(member.image)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=400`
                        }
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=400`;
                        }}
                      />
                      {/* Batch Badge */}
                      {member.graduationYear && (
                        <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center space-x-1">
                          <Sparkles className="h-3 w-3" />
                          <span>Batch '{member.graduationYear.slice(-2)}</span>
                        </div>
                      )}
                      {/* Domain Badge */}
                      {member.domain && (
                        <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          {member.domain}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {member.name}
                      </h3>

                      {/* Past µLearn Role */}
                      <div className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800/60 px-2.5 py-1 rounded-lg mb-3">
                        <Award className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                        <span>{member.pastRole}</span>
                      </div>

                      {/* Current Role & Company */}
                      {(member.currentCompany || member.currentRole) && (
                        <div className="bg-gray-50 dark:bg-gray-700/60 p-3 rounded-xl border border-gray-200 dark:border-gray-600/70 mb-3 transition-colors">
                          <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-1">
                            <Building2 className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                            <span>Current Role</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {member.currentRole || 'Tech Professional'}
                            {member.currentCompany && (
                              <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                                {' '}@ {member.currentCompany}
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Bio */}
                      {member.bio && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 italic">
                          "{member.bio}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Social Links */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="LinkedIn">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.github && (
                        <a href={member.github} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="GitHub">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}
                          className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Email">
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors" aria-label="Instagram">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Stay Connected CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-blue-600 dark:bg-gray-900 text-white dark:text-blue-100 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Are You a µLearn GECI Alumnus?</h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 leading-relaxed">
              Join the alumni network, share your story, and inspire the next generation of µLearn leaders.
            </p>
            <a
              href="/contact"
              className="bg-white dark:bg-blue-600 text-blue-600 dark:text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors duration-200 inline-block"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default Alumni;
