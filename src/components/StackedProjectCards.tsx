import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
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
  const [allCards, setAllCards] = useState<ProjectCard[]>(PROJECTS);
  const [cards, setCards] = useState<ProjectCard[]>(PROJECTS);

  // Mobile/touch detection for disabling expensive animations
  const isMobile = useMemo(() => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768), []);

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
        setAllCards(formatted);
        setCards(formatted);
        return true;
      }
      return false;
    };

    const loadCustomConfig = async () => {
      try {
        const res = await homepageAPI.getConfig();
        if (res.success && res.data && res.data.cards && Array.isArray(res.data.cards) && res.data.cards.length > 0) {
          applyCardsFromObj(res.data.cards);
          return;
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local storage cache:', err);
      }

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

  /* ── Stacked deck navigation ─────────────────────────────── */

  const handleNext = () => {
    setCards((prev) => {
      const copy = [...prev];
      const first = copy.shift();
      if (first) copy.push(first);
      return copy;
    });
  };

  const handlePrev = () => {
    setCards((prev) => {
      const copy = [...prev];
      const last = copy.pop();
      if (last) copy.unshift(last);
      return copy;
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) handleNext();
    else if (info.offset.x > 80) handlePrev();
  };

  const bringToFront = (index: number) => {
    if (index === 0) return;
    setCards((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const frontCardIndex = allCards.findIndex(c => c.id === cards[0]?.id);

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <section className="py-12 md:py-32 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* ── Section Header ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-4 md:gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Featured Initiatives</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Latest Projects & Labs
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            {/* Card counter */}
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 mr-1 tabular-nums select-none">
              {(frontCardIndex >= 0 ? frontCardIndex + 1 : 1).toString().padStart(2, '0')}&nbsp;/&nbsp;{allCards.length.toString().padStart(2, '0')}
            </span>
            <button
              onClick={handlePrev}
              aria-label="Previous Project"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Project"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Stacked Cards Container ─────────────────────── */}
        <div className="relative h-[440px] sm:h-[460px] md:h-[480px] lg:h-[500px] w-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {cards.slice(0, isMobile ? 1 : 3).map((card, index) => {
              const isFront = index === 0;
              // Stack downwards behind front card to prevent overlapping section header
              const yOffset = index * 14;
              const scale = 1 - index * 0.04;
              const zIndex = 30 - index * 10;

              return (
                <motion.div
                  key={card.id}
                  {...(!isMobile && { layout: true })}
                  initial={{ scale: 0.9, y: 30, opacity: 0 }}
                  animate={{
                    scale,
                    y: yOffset,
                    opacity: 1 - index * 0.15,
                    zIndex,
                  }}
                  exit={{ scale: 0.8, y: -60, opacity: 0 }}
                  transition={{
                    duration: isMobile ? 0.35 : 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => bringToFront(index)}
                  drag={isFront && !isMobile ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={isFront && !isMobile ? handleDragEnd : undefined}
                  className={`absolute inset-x-0 mx-auto max-w-[1200px] w-full h-[380px] sm:h-[400px] md:h-[440px] lg:h-[460px] rounded-3xl p-5 sm:p-6 md:p-8 lg:p-9 border shadow-2xl overflow-hidden transition-colors duration-300 ${
                    isFront
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing'
                      : 'bg-gray-50 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700/60 cursor-pointer'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 h-full w-full gap-4 sm:gap-6 md:gap-8 items-center">
                    
                    {/* ─ Left Half: Content ─────────────── */}
                    <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between h-full w-full py-1">
                      <div>
                        {/* Number Badge & Meta Tag */}
                        <div className="flex items-center space-x-3 md:space-x-4 mb-2 sm:mb-3 md:mb-4">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full border border-blue-600/30 text-blue-600 dark:text-blue-400 font-display font-bold text-xs md:text-sm flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
                            {card.number}
                          </div>
                          <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                            {card.meta}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3 leading-tight">
                          {card.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
                          {card.description}
                        </p>
                      </div>

                      {/* ── CTA Button (vibrant gradient) ─ */}
                      <div className="pt-2 sm:pt-3 md:pt-5">
                        <Link
                          to={card.link}
                          className="inline-flex items-center space-x-2 md:space-x-2.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-7 md:py-3.5 rounded-full font-bold text-xs md:text-sm transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 group/cta border border-blue-400/20"
                        >
                          <span className="tracking-wide">{card.ctaText || 'Explore'}</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/cta:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* ─ Right Half: Image & Glass Shapes ─ */}
                    <div className="md:col-span-6 lg:col-span-5 relative w-full h-[150px] sm:h-[180px] md:h-full rounded-2xl overflow-hidden group/img">
                      <img
                        src={getImageUrl(card.image) || PROJECTS[(parseInt(card.number) - 1) % PROJECTS.length]?.image}
                        alt={card.title}
                        className="w-full h-full object-cover object-center rounded-2xl group-hover/img:scale-105 transition-transform duration-700"
                      />

                      {/* Clean Sparkles badge on top-left of image */}
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl backdrop-blur-md bg-black/40 border border-white/20 shadow-lg flex items-center justify-center pointer-events-none">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Card indicator dots ─────────────────────────── */}
        <div className="flex justify-center mt-8 space-x-2.5">
          {allCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => {
                const idx = cards.findIndex(c => c.id === card.id);
                if (idx >= 0) bringToFront(idx);
              }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                cards[0]?.id === card.id
                  ? 'w-8 h-2.5 bg-blue-600 dark:bg-blue-400'
                  : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
