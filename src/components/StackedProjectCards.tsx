import React, { useState, useEffect } from 'react';
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

  // Stacked card navigation — cycle cards like a deck
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
    if (info.offset.x < -80) {
      handleNext();
    } else if (info.offset.x > 80) {
      handlePrev();
    }
  };

  const bringToFront = (index: number) => {
    if (index === 0) return;
    setCards((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // Find position of front card in the full deck for counter
  const frontCardIndex = allCards.findIndex(c => c.id === cards[0]?.id);

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Featured Initiatives</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Community Highlights
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-lg">
              Drag cards or use arrows to explore — {allCards.length} highlight cards from the µLearn GECI community
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 mr-2 tabular-nums">
              {(frontCardIndex >= 0 ? frontCardIndex + 1 : 1).toString().padStart(2, '0')} / {allCards.length.toString().padStart(2, '0')}
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

        {/* Stacked Cards Container */}
        <div className="relative h-[620px] md:h-[540px] w-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {cards.slice(0, 4).map((card, index) => {
              const isFront = index === 0;
              const yOffset = -index * 24;
              const scale = 1 - index * 0.045;
              const zIndex = 40 - index * 10;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ scale: 0.9, y: 50, opacity: 0 }}
                  animate={{
                    scale,
                    y: yOffset,
                    opacity: 1 - index * 0.12,
                    zIndex
                  }}
                  exit={{ scale: 0.85, y: -80, opacity: 0 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  onClick={() => bringToFront(index)}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={isFront ? handleDragEnd : undefined}
                  className={`absolute inset-x-0 mx-auto max-w-[1200px] h-[560px] md:h-[480px] rounded-3xl p-6 md:p-10 border shadow-2xl overflow-hidden transition-colors duration-300 ${
                    isFront
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing'
                      : 'bg-gray-50 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 cursor-pointer'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-6 md:gap-8 items-center">
                    
                    {/* Left Half — Content */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full py-2">
                      <div>
                        {/* Number Badge & Meta */}
                        <div className="flex items-center space-x-3 mb-5">
                          <div className="w-10 h-10 rounded-full border border-blue-500/30 text-blue-600 dark:text-blue-400 font-display font-bold text-xs flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
                            {card.number}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
                            {card.meta}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                          {card.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3">
                          {card.description}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6">
                        <Link
                          to={card.link}
                          className="inline-flex items-center space-x-2.5 bg-gray-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 text-white dark:text-gray-900 dark:hover:text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-md group/cta"
                        >
                          <span>{card.ctaText || 'Explore'}</span>
                          <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Half — Image */}
                    <div className="lg:col-span-7 relative h-[200px] md:h-full rounded-2xl overflow-hidden group/img">
                      <img
                        src={getImageUrl(card.image) || PROJECTS[(parseInt(card.number) - 1) % PROJECTS.length]?.image}
                        alt={card.title}
                        className="w-full h-full object-cover rounded-2xl group-hover/img:scale-105 transition-transform duration-700"
                      />

                      {/* Glassmorphism floating shapes */}
                      <div className="absolute top-6 left-6 w-14 h-14 rounded-2xl backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border border-white/40 shadow-lg pointer-events-none -rotate-6" />
                      <div className="absolute bottom-6 right-6 w-16 h-16 rounded-full backdrop-blur-md bg-white/25 dark:bg-gray-900/25 border border-white/30 shadow-lg pointer-events-none rotate-12" />
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Card indicator dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {allCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => {
                const idx = cards.findIndex(c => c.id === card.id);
                if (idx >= 0) bringToFront(idx);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                cards[0]?.id === card.id
                  ? 'bg-blue-600 dark:bg-blue-400 scale-125'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
