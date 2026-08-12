import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Award, Users, BookOpen, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { homepageAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

export interface ProjectCard {
  id: string;
  number: string;
  meta: string;
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText: string;
}

const PROJECTS: ProjectCard[] = [
  {
    id: '1',
    number: '01',
    meta: 'µLEARN GECI • CAMPUS LEADERBOARD',
    title: 'Live Campus Karma XP & Streak Ranking System',
    description: 'Track daily GitHub commits, LinkedIn proof-of-work posts, and karma points earned across all GECI engineering departments in real time.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    link: '/leaderboard',
    ctaText: 'View Leaderboard'
  },
  {
    id: '2',
    number: '02',
    meta: 'LEADERSHIP & ARCHITECTURE • EXECOM',
    title: 'Meet the Executive Board & Domain Leads',
    description: 'Our student office bearers and domain mentors coordinate technical interest groups, coding bootcamps, and hackathons year-round.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop',
    link: '/execom',
    ctaText: 'Meet Execom Board'
  },
  {
    id: '3',
    number: '03',
    meta: 'EVENTS & HACKATHONS • WORKSHOPS',
    title: 'Hands-On Bootcamps & 24-Hour Hackathons',
    description: 'Join campus workshops on Full-Stack Web Dev, AI/ML, Cloud DevOps, and Robotics engineered to turn theory into working code.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop',
    link: '/events',
    ctaText: 'Explore Events'
  },
  {
    id: '4',
    number: '04',
    meta: 'ALUMNI & CAREERS • PLACEMENT NETWORK',
    title: 'Global Alumni Mentorship & Job Referral Hub',
    description: 'Connect directly with graduated seniors working at top global tech firms for mock technical interviews, project guidance, and referrals.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2070&auto=format&fit=crop',
    link: '/alumni',
    ctaText: 'Connect with Alumni'
  }
];

export const StackedProjectCards: React.FC = () => {
  const [cards, setCards] = useState<ProjectCard[]>(PROJECTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');

  useEffect(() => {
    const applyCardsFromObj = (cardsArr: any[]) => {
      if (cardsArr && Array.isArray(cardsArr) && cardsArr.length > 0) {
        const formatted = cardsArr.map((c: any, i: number) => ({
          id: c.id || String(i + 1),
          number: c.number || String(i + 1).padStart(2, '0'),
          meta: c.meta || 'CAMPUS SHOWCASE',
          title: c.title || `Showcase Card #${i + 1}`,
          description: c.description || 'Discover campus initiatives, community achievements, and student projects at µLearn GECI.',
          image: c.image && c.image.trim() !== '' ? c.image : PROJECTS[i % PROJECTS.length].image,
          link: c.link || '/events',
          ctaText: c.ctaText || 'Learn More'
        }));
        setCards(formatted);
        return true;
      }
      return false;
    };

    const loadCustomConfig = async () => {
      let localData: any = null;

      // 1. Check local storage cache first for instant update
      try {
        const saved = localStorage.getItem('mulearn_homepage_custom_config');
        if (saved) {
          localData = JSON.parse(saved);
          if (localData.cards && Array.isArray(localData.cards) && localData.cards.length > 0) {
            applyCardsFromObj(localData.cards);
          }
        }
      } catch (e) {}

      // 2. Fetch from backend API
      try {
        const res = await homepageAPI.getConfig();
        if (res.success && res.data && res.data.cards) {
          const localCount = localData?.cards?.length || 0;
          const serverCount = res.data?.cards?.length || 0;

          if (!localData || serverCount >= localCount) {
            applyCardsFromObj(res.data.cards);
          }
        }
      } catch (err) {}
    };

    loadCustomConfig();

    window.addEventListener('mulearn_config_updated', loadCustomConfig);
    window.addEventListener('storage', loadCustomConfig);

    let bc: any = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('mulearn_config_channel');
      bc.onmessage = () => loadCustomConfig();
    }

    return () => {
      window.removeEventListener('mulearn_config_updated', loadCustomConfig);
      window.removeEventListener('storage', loadCustomConfig);
      if (bc) bc.close();
    };
  }, []);

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goToCard = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const currentCard = cards[activeIndex] || cards[0] || PROJECTS[0];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <section className="py-20 md:py-28 bg-slate-900 text-white transition-colors duration-300 overflow-hidden relative">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-blue-400 mb-3 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campus Highlights • {cards.length} Active Cards</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Community Highlights & Stories
            </h2>
          </div>

          {/* Controls: View Mode Toggle & Next/Prev */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700 flex items-center space-x-1 shadow-lg">
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'stacked'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Carousel View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Cards Grid ({cards.length})
              </button>
            </div>

            {viewMode === 'stacked' && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                  Card {activeIndex + 1} of {cards.length}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Highlight"
                    className="w-11 h-11 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Highlight"
                    className="w-11 h-11 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODE 1: ALL CARDS GRID VIEW */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <motion.div
                key={card.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col justify-between group hover:border-blue-500/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="h-52 rounded-2xl overflow-hidden relative border border-slate-700">
                    <img
                      src={getImageUrl(card.image) || PROJECTS[index % PROJECTS.length]?.image}
                      alt={card.title}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                      #{card.number || String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-400 block">
                    {card.meta}
                  </span>
                  <h3 className="font-display text-xl font-extrabold text-white leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    to={card.link}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold text-xs transition-colors shadow-md group/btn"
                  >
                    <span>{card.ctaText || 'Learn More'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* MODE 2: SMOOTH CAROUSEL SHOWCASE VIEW */
          <div>
            <div className="relative min-h-[500px] w-full flex items-center justify-center">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentCard.id || activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full max-w-[1250px] bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden backdrop-blur-xl"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Details */}
                    <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
                      <div>
                        <div className="flex items-center space-x-4 mb-5">
                          <div className="w-12 h-12 rounded-2xl border border-blue-500/40 text-white font-display font-extrabold text-base flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-600/30">
                            {currentCard.number || String(activeIndex + 1).padStart(2, '0')}
                          </div>
                          <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400 bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-800/50">
                            {currentCard.meta}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                          {currentCard.title}
                        </h3>

                        <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                          {currentCard.description}
                        </p>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-4">
                        <Link
                          to={currentCard.link}
                          className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-600/30 group"
                        >
                          <span>{currentCard.ctaText || 'Explore Feature'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                          <span>Card {activeIndex + 1} of {cards.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Image */}
                    <div className="lg:col-span-6 relative h-[280px] md:h-[380px] rounded-2xl overflow-hidden border border-slate-700/80 group">
                      <img
                        src={getImageUrl(currentCard.image) || PROJECTS[activeIndex % PROJECTS.length]?.image}
                        alt={currentCard.title}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                      />

                      <div className="absolute top-4 left-4 w-14 h-14 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-700 shadow-lg pointer-events-none flex items-center justify-center text-blue-400">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full backdrop-blur-md bg-slate-900/60 border border-slate-700 shadow-lg pointer-events-none flex items-center justify-center text-amber-400">
                        <Award className="w-7 h-7" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quick Interactive Card Switcher Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {cards.map((card, idx) => (
                <button
                  key={card.id || idx}
                  onClick={() => goToCard(idx)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    idx === activeIndex
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  #{card.number || String(idx + 1).padStart(2, '0')} {card.title.slice(0, 20)}...
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
