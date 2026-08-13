import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Award, Layers } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');

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

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goToCard = (index: number) => {
    setActiveIndex(index);
  };

  // Build the stacked cards deck (top card + 2 stacked cards behind)
  const renderStackedDeck = () => {
    const total = cards.length;
    if (total === 0) return null;

    // Show 3 cards in stack: top card (0), second card (1), third card (2)
    const stackIndices = [0, 1, 2].map(offset => (activeIndex + offset) % total);

    return (
      <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto h-[500px] md:h-[540px] flex items-center justify-center select-none" style={{ touchAction: 'none' }}>
        {stackIndices.map((cardIndex, stackOffset) => {
          const card = cards[cardIndex];
          const isTop = stackOffset === 0;

          // Visual stacking offsets:
          // Top card: scale 1, y: 0, zIndex: 30
          // 2nd card: scale 0.94, y: 16, zIndex: 20
          // 3rd card: scale 0.88, y: 32, zIndex: 10
          const scale = 1 - stackOffset * 0.06;
          const yOffset = stackOffset * 16;
          const zIndex = 30 - stackOffset * 10;
          const opacity = 1 - stackOffset * 0.2;

          return (
            <FlashcardItem
              key={`${card.id || cardIndex}-${cardIndex}`}
              card={card}
              isTop={isTop}
              scale={scale}
              yOffset={yOffset}
              zIndex={zIndex}
              opacity={opacity}
              onSwipeRight={handleNext}
              onSwipeLeft={handleNext}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white transition-colors duration-300 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-blue-400 mb-3 bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-800/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campus Highlights • {cards.length} Cards</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Community Highlights & Stories
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium">
              Drag or swipe flashcards left/right to browse campus initiatives
            </p>
          </div>

          {/* Controls: View Mode Toggle & Next/Prev */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex items-center space-x-1 shadow-md">
              <button
                onClick={() => setViewMode('stacked')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'stacked'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Flashcard Deck
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous Flashcard"
                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-700 min-w-[90px] text-center">
                  {activeIndex + 1} / {cards.length}
                </span>
                <button
                  onClick={handleNext}
                  aria-label="Next Flashcard"
                  className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODE 1: FLASHCARD DECK VIEW */}
        {viewMode === 'stacked' ? (
          <div>
            {renderStackedDeck()}

            {/* Quick Interactive Card Switcher Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              {cards.map((card, idx) => (
                <button
                  key={card.id || idx}
                  onClick={() => goToCard(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    idx === activeIndex
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  #{card.number || String(idx + 1).padStart(2, '0')} {card.title.slice(0, 16)}...
                </button>
              ))}
            </div>
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
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700/80">
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

// Sub-component for individual draggable flashcard item
interface FlashcardItemProps {
  card: ProjectCard;
  isTop: boolean;
  scale: number;
  yOffset: number;
  zIndex: number;
  opacity: number;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({
  card,
  isTop,
  scale,
  yOffset,
  zIndex,
  opacity,
  onSwipeRight,
  onSwipeLeft,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > threshold || velocity > 400) {
      onSwipeRight();
    } else if (offset < -threshold || velocity < -400) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex,
        touchAction: 'none',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
      animate={{
        scale,
        y: yOffset,
        opacity,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`absolute inset-0 w-full h-full rounded-3xl bg-slate-800 border border-slate-700/80 shadow-2xl p-5 md:p-7 flex flex-col justify-between ${
        isTop ? 'cursor-grab active:cursor-grabbing border-blue-500/40 shadow-blue-900/20' : 'pointer-events-none'
      }`}
    >
      {/* Top Badge & Number */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400 bg-blue-950/90 px-3 py-1 rounded-full border border-blue-800/50">
            {card.meta}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
            {card.number}
          </div>
        </div>

        {/* Card Image */}
        <div className="relative h-44 md:h-52 rounded-2xl overflow-hidden border border-slate-700/80 mb-4 group">
          <img
            src={getImageUrl(card.image)}
            alt={card.title}
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute top-3 left-3 w-9 h-9 rounded-xl backdrop-blur-md bg-slate-900/70 border border-slate-700 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full backdrop-blur-md bg-slate-900/70 border border-slate-700 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-display text-lg md:text-xl font-extrabold text-white mb-2 leading-snug line-clamp-2">
          {card.title}
        </h3>

        <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed line-clamp-3">
          {card.description}
        </p>
      </div>

      {/* Footer CTA & Swipe Hint */}
      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
        <Link
          to={card.link}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-bold text-xs transition-colors shadow-md group"
          onClick={(e) => isTop && e.stopPropagation()}
        >
          <span>{card.ctaText || 'Learn More'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {isTop && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-blue-400" />
            <span>Drag to swipe</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};
