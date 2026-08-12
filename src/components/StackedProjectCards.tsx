import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ProjectCard {
  id: string;
  number: string;
  meta: string;
  title: string;
  description: string;
  image: string;
  bgColor: string;
  darkBgColor: string;
  link: string;
}

const PROJECTS: ProjectCard[] = [
  {
    id: '1',
    number: '01',
    meta: '2026 • TECH • CAMPUS PLATFORM',
    title: 'µLearn GECI Campus Leaderboard & XP Engine',
    description: 'A real-time proof-of-work tracking platform that connects student commits, LinkedIn posts, and karma points into a interactive climbing ladder.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    bgColor: '#f8f9fa',
    darkBgColor: '#18181b',
    link: '/leaderboard'
  },
  {
    id: '2',
    number: '02',
    meta: '2026 • AI & INNOVATION • HACKATHON',
    title: 'Autonomous AI & Hardware Innovation Hub',
    description: 'Empowering Robotics, AI, and IoT student teams to engineer real-world hardware prototypes with industry mentors and peer code reviews.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    bgColor: '#f1f5f9',
    darkBgColor: '#1e293b',
    link: '/events'
  },
  {
    id: '3',
    number: '03',
    meta: '2026 • COMMUNITY • ALUMNI MENTORSHIP',
    title: 'Global Alumni & Industry Placement Network',
    description: 'Bridging current college engineering talents with graduated alumni leaders in top global tech firms for mock interviews and job referrals.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
    bgColor: '#f4f4f5',
    darkBgColor: '#27272a',
    link: '/alumni'
  },
  {
    id: '4',
    number: '04',
    meta: '2026 • BOOTCAMP • 60-DAY CHALLENGE',
    title: 'The 60-Day Full-Stack & Devops Challenge',
    description: 'A 60-day intensive building spree where students ship production code daily, build public streaks, and showcase projects to recruiters.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    bgColor: '#f8fafc',
    darkBgColor: '#0f172a',
    link: '/events'
  }
];

export const StackedProjectCards: React.FC = () => {
  const [cards, setCards] = useState<ProjectCard[]>(PROJECTS);

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

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Featured Initiatives</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Latest Projects & Labs
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              aria-label="Previous Project"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Project"
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stacked Cards Container */}
        <div className="relative h-[650px] md:h-[580px] w-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {cards.slice(0, 3).map((card, index) => {
              const isFront = index === 0;
              // Stack calculations: Background cards stack upwards (-30px) and scale down (1 - index * 0.05)
              const yOffset = -index * 28;
              const scale = 1 - index * 0.05;
              const zIndex = 30 - index * 10;

              return (
                <motion.div
                  key={card.id}
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
                  style={{
                    backgroundColor: card.bgColor,
                  }}
                  className={`absolute inset-x-0 mx-auto max-w-[1200px] h-[580px] md:h-[520px] rounded-3xl p-6 md:p-10 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden cursor-pointer dark:bg-gray-800 transition-colors duration-300 ${
                    isFront ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-8 items-center">
                    
                    {/* Left Half (Meta, Number, Content, Button) */}
                    <div className="lg:col-span-6 flex flex-col justify-between h-full py-2">
                      <div>
                        {/* Number Badge & Meta Tag */}
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 rounded-full border border-blue-600/30 text-blue-600 dark:text-blue-400 font-display font-bold text-sm flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
                            {card.number}
                          </div>
                          <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                            {card.meta}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
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
                          className="inline-flex items-center space-x-3 bg-gray-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 text-white dark:text-gray-900 dark:hover:text-white px-7 py-3.5 rounded-full font-medium text-sm transition-all duration-300 shadow-md group"
                        >
                          <span>Explore Case Study</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Half (Image & Abstract Glassmorphism Overlay) */}
                    <div className="lg:col-span-6 relative h-[240px] md:h-full rounded-2xl overflow-hidden group">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Glassmorphism Abstract Floating Shapes */}
                      <div className="absolute top-6 left-6 w-16 h-16 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border border-white/50 shadow-lg pointer-events-none transform -rotate-6" />
                      <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border border-white/40 shadow-lg pointer-events-none transform rotate-12" />
                      <div className="absolute top-1/2 right-12 w-12 h-12 rounded-full backdrop-blur-sm bg-blue-500/20 border border-white/30 shadow-md pointer-events-none" />
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
