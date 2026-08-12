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

  useEffect(() => {
    const applyCardsFromObj = (cardsArr: any[]) => {
      if (cardsArr && cardsArr.length > 0) {
        const formatted = cardsArr.map((c: any, i: number) => ({
          id: c.id || String(i + 1),
          number: String(i + 1).padStart(2, '0'),
          meta: c.meta || 'SHOWCASE',
          title: c.title,
          description: c.description,
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
          if (localData.cards) applyCardsFromObj(localData.cards);
        }
      } catch (e) {}

      // 2. Fetch from backend API
      try {
        const res = await homepageAPI.getConfig();
        if (res.success && res.data && res.data.cards) {
          const localTime = localData?.updatedAt ? new Date(localData.updatedAt).getTime() : 0;
          const serverTime = res.data?.updatedAt ? new Date(res.data.updatedAt).getTime() : 0;

          if (!localData || serverTime > localTime) {
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

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
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

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Campus Highlights</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Community Highlights & Stories
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              aria-label="Previous Highlight"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Highlight"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stacked Cards Container */}
        <div className="relative h-[650px] md:h-[540px] w-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {cards.slice(0, 3).map((card, index) => {
              const isFront = index === 0;
              const yOffset = -index * 28;
              const scale = 1 - index * 0.05;
              const zIndex = 30 - index * 10;

              return (
                <motion.div
                  key={`${card.id}-${card.title.slice(0, 15)}-${index}`}
                  layout
                  initial={{ scale: 0.9, y: 50, opacity: 0 }}
                  animate={{
                    scale,
                    y: yOffset,
                    opacity: 1 - index * 0.15,
                    zIndex
                  }}
                  exit={{ scale: 0.8, y: -100, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  onClick={() => bringToFront(index)}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={isFront ? handleDragEnd : undefined}
                  className={`absolute inset-x-0 mx-auto max-w-[1200px] h-[580px] md:h-[500px] rounded-3xl p-6 md:p-10 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden cursor-pointer bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white transition-colors duration-300 ${
                    isFront ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-8 items-center">
                    
                    {/* Left Half (Meta, Number, High Contrast Text, Button) */}
                    <div className="lg:col-span-6 flex flex-col justify-between h-full py-2">
                      <div>
                        {/* Number Badge & Meta Tag */}
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 rounded-full border border-blue-600/30 text-white font-display font-bold text-sm flex items-center justify-center bg-blue-600 shadow-md">
                            {card.number}
                          </div>
                          <span className="text-xs uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                            {card.meta}
                          </span>
                        </div>

                        {/* Title - CRISP HIGH CONTRAST */}
                        <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                          {card.title}
                        </h3>

                        {/* Description - CRISP HIGH CONTRAST */}
                        <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base font-medium leading-relaxed line-clamp-3">
                          {card.description}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6">
                        <Link
                          to={card.link}
                          className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 group"
                        >
                          <span>{card.ctaText}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Half (Real µLearn Group Image & Glass Overlay) */}
                    <div className="lg:col-span-6 relative h-[240px] md:h-full rounded-2xl overflow-hidden group">
                      <img
                        src={getImageUrl(card.image) || PROJECTS[index % PROJECTS.length]?.image}
                        alt={card.title}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Glassmorphism Abstract Floating Shapes */}
                      <div className="absolute top-6 left-6 w-16 h-16 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border border-white/50 shadow-lg pointer-events-none transform -rotate-6 flex items-center justify-center text-blue-600">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border border-white/40 shadow-lg pointer-events-none transform rotate-12 flex items-center justify-center text-amber-400">
                        <Award className="w-8 h-8" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
