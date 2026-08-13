import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Award } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyCardsFromObj = (cardsArr: any[]) => {
      if (cardsArr && Array.isArray(cardsArr) && cardsArr.length > 0) {
        const formatted = cardsArr.map((c: any, i: number) => ({
          id: c.id || String(i + 1),
          number: c.number || String(i + 1).padStart(2, '0'),
          meta: c.meta !== undefined && c.meta !== null ? c.meta : 'CAMPUS SHOWCASE',
          title: c.title !== undefined && c.title !== null ? c.title : `Showcase Card #${i + 1}`,
          description: c.description !== undefined && c.description !== null ? c.description : 'Discover campus initiatives at µLearn GECI.',
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
      // 1. Always fetch fresh live data from backend database first
      try {
        const res = await homepageAPI.getConfig();
        if (res.success && res.data && res.data.cards && Array.isArray(res.data.cards) && res.data.cards.length > 0) {
          applyCardsFromObj(res.data.cards);
          return;
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local storage cache:', err);
      }

      // 2. Fallback to local storage cache only if API request fails
      try {
        const saved = localStorage.getItem('mulearn_homepage_custom_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.cards && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
            applyCardsFromObj(parsed.cards);
          }
        }
      } catch (e) {}
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white transition-colors duration-300 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-extrabold text-blue-400 mb-3 bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-800/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campus Highlights • {cards.length} Total Cards</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Community Highlights & Stories
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium">
              Swipe horizontally or click arrows to explore all {cards.length} landscape highlight cards
            </p>
          </div>

          {/* Controls: Mode Toggle & Scroll Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex items-center space-x-1 shadow-md">
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Landscape Carousel
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

            {viewMode === 'carousel' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={scrollLeft}
                  aria-label="Scroll Left"
                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  aria-label="Scroll Right"
                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODE 1: SMOOTH HORIZONTAL SCROLL-SNAP CAROUSEL */}
        {viewMode === 'carousel' ? (
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto flex gap-6 pb-8 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="w-[85vw] sm:w-[420px] md:w-[540px] lg:w-[600px] shrink-0 snap-center rounded-3xl bg-slate-800/90 border border-slate-700/80 p-6 md:p-8 shadow-2xl flex flex-col justify-between group hover:border-blue-500/50 transition-all duration-300"
              >
                <div>
                  {/* Card Meta Tag & Number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400 bg-blue-950/90 px-3.5 py-1 rounded-full border border-blue-800/50">
                      {card.meta}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                      #{card.number || String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Cinematic Landscape Image (16:9 Aspect Ratio) */}
                  <div className="relative w-full aspect-video md:h-64 rounded-2xl overflow-hidden mb-6 border border-slate-700/80">
                    <img
                      src={getImageUrl(card.image) || PROJECTS[index % PROJECTS.length]?.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl backdrop-blur-md bg-slate-900/70 border border-slate-700 flex items-center justify-center text-blue-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full backdrop-blur-md bg-slate-900/70 border border-slate-700 flex items-center justify-center text-amber-400">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card Title & Description */}
                  <h3 className="font-display text-xl md:text-2xl font-extrabold text-white mb-3 leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                {/* Footer CTA Button */}
                <div className="pt-6 mt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <Link
                    to={card.link}
                    className="inline-flex items-center space-x-2.5 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-xs md:text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 group/btn"
                  >
                    <span>{card.ctaText || 'Explore Feature'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  <span className="text-[11px] font-bold text-slate-400">
                    Card {index + 1} of {cards.length}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* MODE 2: ALL CARDS GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700 shadow-2xl flex flex-col justify-between group hover:border-blue-500/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/80">
                    <img
                      src={getImageUrl(card.image) || PROJECTS[index % PROJECTS.length]?.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                      #{card.number || String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-400 block">
                    {card.meta}
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-white leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="pt-5">
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
        )}

      </div>
    </section>
  );
};
