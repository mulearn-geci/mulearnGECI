import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Trophy, Calendar, Users, GraduationCap, ChevronDown, 
  ArrowUp, Sparkles, Star, Code2, ShieldCheck, Smartphone, Palette,
  Gamepad2, Rocket, Video, BookOpen, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroShaderCanvas } from '../components/HeroShaderCanvas';
import { StackedProjectCards } from '../components/StackedProjectCards';
import { execomAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

import RejinImg from '../img/Rejin.jpg';
import NidhinImg from '../img/Nidhin.jpg';

// Section 4.2 Website Feature Navigation Boxes
const WEBSITE_PAGES = [
  {
    icon: Trophy,
    title: 'Karma XP Leaderboard',
    description: 'Track live Karma points, daily commit streaks, and department rankings across CSE, IT, ECE, EEE, ME, and RAI.',
    link: '/leaderboard'
  },
  {
    icon: Calendar,
    title: 'Events & Workshops',
    description: 'Discover upcoming campus hackathons, 24-hour coding sprints, technical workshops, and hands-on bootcamps.',
    link: '/events'
  },
  {
    icon: Users,
    title: 'Execom Board',
    description: 'Meet our dedicated student office bearers, domain leads, and mentors leading µLearn GECI initiatives.',
    link: '/execom'
  },
  {
    icon: GraduationCap,
    title: 'Alumni Network',
    description: 'Connect with graduated seniors working at top global tech companies for career guidance, mock interviews, and referrals.',
    link: '/alumni'
  }
];

// Section 4.5 Official Execom Leadership Team
const DEFAULT_EXECOM_SLOTS = [
  {
    name: 'Prof. Rejin R',
    role: 'Campus Enabler',
    department: 'Engineering',
    image: RejinImg
  },
  {
    name: 'Nidhin Gireesh',
    role: 'Campus Lead',
    department: 'Engineering',
    image: NidhinImg
  },
  {
    name: 'Aparna Anilkumar',
    role: 'Co - Lead',
    department: 'Engineering',
    image: ''
  }
];

// Section 4.6 Official Active Interest Groups (IGs) & Teams at µLearn GECI
const INTEREST_GROUPS = [
  {
    title: 'DSA IG',
    domain: 'Algorithms & Coding',
    description: 'Master Data Structures, Algorithms, Problem Solving, and LeetCode challenges for technical interviews.',
    icon: Code2,
    link: '/events',
    badge: 'Competitive'
  },
  {
    title: 'AI IG',
    domain: 'Artificial Intelligence',
    description: 'Explore Machine Learning, Neural Networks, PyTorch models, and LLM application development.',
    icon: Sparkles,
    link: '/events',
    badge: 'Trending'
  },
  {
    title: 'App Development IG',
    domain: 'Mobile Dev',
    description: 'Build native Android and cross-platform mobile apps using Flutter, React Native, and Kotlin.',
    icon: Smartphone,
    link: '/events',
    badge: 'Mobile'
  },
  {
    title: 'UI/UX IG',
    domain: 'Design & Experience',
    description: 'Design modern user interfaces, Figma prototypes, design systems, and seamless user experiences.',
    icon: Palette,
    link: '/events',
    badge: 'Design'
  },
  {
    title: 'Cybersecurity IG',
    domain: 'Security & Hacking',
    description: 'Participate in Capture The Flag (CTF) events, network auditing, penetration testing, and ethical hacking.',
    icon: ShieldCheck,
    link: '/events',
    badge: 'Security'
  },
  {
    title: 'Game IG',
    domain: 'Game Development',
    description: 'Develop 2D/3D games, physics engines, shader programming, and interactive graphics using Unity & Unreal.',
    icon: Gamepad2,
    link: '/events',
    badge: 'Gaming'
  },
  {
    title: 'Entrepreneurship IG',
    domain: 'Startups & Ventures',
    description: 'Turn technical ideas into viable startup products, pitch decks, business models, and founder networks.',
    icon: Rocket,
    link: '/events',
    badge: 'Startups'
  },
  {
    title: 'Mucomics',
    domain: 'Visual Storytelling',
    description: 'Creative tech comics, digital illustrations, visual stories, and artistic expressions celebrating learning.',
    icon: BookOpen,
    link: '/events',
    badge: 'Comics'
  }
];

// Section 4.6 FAQ Accordion Data
const FAQS = [
  {
    question: 'What is µLearn GECI and how do I join?',
    answer: 'µLearn GECI is the official student learning and innovation chapter at Government Engineering College Idukki. You can join by creating your student profile, syncing your MuID, and participating in campus interest groups.'
  },
  {
    question: 'How does the 60-Day Coding Challenge & Leaderboard work?',
    answer: 'Students pick a learning track, build something every day, and submit proof of work via GitHub commits and LinkedIn posts. Every commit earns Karma XP points updated live on the Karma Rope leaderboard.'
  },
  {
    question: 'Are events and bootcamps open to all engineering departments?',
    answer: 'Yes! All workshops, hackathons, and interest groups (CSE, IT, ECE, EEE, ME, RAI) are 100% free and open to all enrolled students and alumni.'
  },
  {
    question: 'How can alumni stay connected with current students?',
    answer: 'Alumni can join our dedicated Alumni Network tab to mentor students, post job referral opportunities, and view active campus project showcases.'
  }
];

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [execomMembers, setExecomMembers] = useState(DEFAULT_EXECOM_SLOTS);

  // Dynamically fetch Execom members if database entries exist
  useEffect(() => {
    execomAPI.getAll()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const formatted = res.data.slice(0, 3).map((item: any) => ({
            name: item.name || 'Execom Member',
            role: item.role || 'Domain Lead',
            department: item.department || 'Engineering',
            image: item.image ? getImageUrl(item.image) : ''
          }));
          setExecomMembers(formatted);
        }
      })
      .catch((err) => {
        console.warn('Execom fetch note:', err);
      });
  }, []);

  // Element Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Parallax transform for Hero Section
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 250]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0d0d0d] text-white font-sans selection:bg-blue-600 selection:text-white">
        
        {/* ─── 4.1 Hero Section (100vh) ─────────────────────────────────────── */}
        <section ref={heroRef} className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden bg-[#0d0d0d]">
          <HeroShaderCanvas />

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0d0d0d] z-10 pointer-events-none" />

          <motion.div
            style={{ y: heroY }}
            className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 w-full flex flex-col items-start justify-center pt-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center space-x-2.5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-widest text-blue-300 shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>µLearn GECI • Student Innovation Hub</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-display text-5xl sm:text-7xl md:text-[92px] lg:text-[104px] font-bold text-white leading-[1.08] tracking-tight mb-8"
            >
              We create smart & <br className="hidden sm:block" />
              effective digital{' '}
              <span className="relative inline-flex items-center">
                solutio
                <span className="relative">
                  n
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-1/2 left-full -translate-y-1/2 ml-2 w-[100px] sm:w-[220px] md:w-[380px] lg:w-[450px] h-2.5 bg-white rounded-r-full shadow-lg origin-left"
                  />
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-gray-300 text-base md:text-xl max-w-2xl leading-relaxed mb-10"
            >
              Empowering Government Engineering College Idukki students through peer-to-peer coding sprints, real-world proof of work, and live karma leaderboards.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <Link
                to="/leaderboard"
                className="bg-white hover:bg-blue-500 text-gray-900 hover:text-white px-8 py-4 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-2xl flex items-center space-x-3 group"
              >
                <span>View Live Leaderboard</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                to="/events"
                className="border border-white/30 hover:border-white text-white px-8 py-4 rounded-full font-semibold text-sm md:text-base backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
              >
                Explore Events
              </Link>
            </motion.div>
          </motion.div>

          <div className="absolute bottom-10 right-8 md:right-16 z-30 pointer-events-auto">
            <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full text-white/70"
                viewBox="0 0 100 100"
              >
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="text-[9.5px] uppercase tracking-widest font-semibold fill-white">
                  <textPath href="#circlePath">
                    µLEARN GECI • INNOVATE • EMPOWER •
                  </textPath>
                </text>
              </motion.svg>

              <div className="absolute inset-0 m-auto w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-amber-400 shadow-xl">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4.2 Website Pages & Navigation Section ─────────────────────── */}
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            
            <div className="mb-20">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3 block">
                Explore The Platform
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
                Everything You Need to Scale Your Engineering Skills
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {WEBSITE_PAGES.map((page, index) => {
                const IconComp = page.icon;
                return (
                  <motion.div
                    key={page.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="p-8 rounded-2xl bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700/60 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-600/20">
                        <IconComp className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-3 text-slate-900 dark:text-white">
                        {page.title}
                      </h3>
                      <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-medium">
                        {page.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-200 dark:border-gray-700/50">
                      <Link
                        to={page.link}
                        className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Explore Page</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ─── 4.3 Latest Highlights & Stories (Stacked Cards Carousel) ────── */}
        <StackedProjectCards />

        {/* ─── 4.4 About Section (Masonry Parallax) ────────────────────────── */}
        <section ref={masonryRef} className="py-24 md:py-32 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 block">
                  About µLearn GECI
                </span>

                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  We believe in the power of student-led innovation.
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
                  µLearn GECI is designed to bridge the gap between academic curriculum and high-impact engineering careers. We help students build consistent proof-of-work, gain real-world project experience, and connect directly with industry hiring partners.
                </p>

                <div className="pt-4 flex items-center space-x-6">
                  <div>
                    <p className="font-display text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">1,040+</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Climbers</p>
                  </div>
                  <div className="h-10 w-px bg-gray-300 dark:bg-gray-700" />
                  <div>
                    <p className="font-display text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">50+</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Events Hosted</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="sm:col-span-1 h-[420px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
                >
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>

                <div className="sm:col-span-1 space-y-6">
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-[220px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                      alt="Coding hackathon"
                      className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-700"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-[260px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
                      alt="Workshop Presentation"
                      className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-700"
                    />
                  </motion.div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ─── 4.5 Team Banner & Reserved Execom Member Slots ─────────────── */}
        <section className="py-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
          
          <div className="mb-20 overflow-hidden border-y border-gray-200 dark:border-gray-800 py-6 bg-gray-50 dark:bg-gray-950">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="flex whitespace-nowrap text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tight text-transparent text-stroke-dark dark:text-stroke-white space-x-8"
            >
              <span>MEET THE EXECOM TEAM - </span>
              <span>INNOVATORS & LEADERS - </span>
              <span>BUILDING THE FUTURE - </span>
              <span>MEET THE EXECOM TEAM - </span>
              <span>INNOVATORS & LEADERS - </span>
              <span>BUILDING THE FUTURE - </span>
            </motion.div>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {execomMembers.map((member, index) => (
                <motion.div
                  key={member.name + index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group relative h-[420px] rounded-3xl overflow-hidden border border-dashed border-gray-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/80 shadow-xl flex flex-col justify-between p-8 hover:border-blue-500 transition-all duration-300"
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 z-0"
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center h-48 rounded-2xl bg-slate-200/60 dark:bg-gray-700/50 border border-slate-300 dark:border-gray-600 text-slate-400 dark:text-gray-400 group-hover:scale-105 transition-transform duration-500">
                      <User className="w-16 h-16 text-blue-600/70 dark:text-blue-400/70 mb-2" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-300">
                        Profile & Photo Reserved
                      </span>
                    </div>
                  )}

                  {member.image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity z-10" />
                  )}

                  <div className={`relative z-20 mt-auto pt-6 ${member.image ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 block mb-1">
                      {member.department}
                    </span>
                    <h3 className="font-display text-2xl font-extrabold mb-1">
                      {member.name}
                    </h3>
                    <p className={`text-sm font-medium ${member.image ? 'text-gray-300' : 'text-slate-600 dark:text-gray-300'}`}>
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/execom"
                className="inline-flex items-center space-x-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View Full Execom Board</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 4.6 Official Active Interest Groups (IGs) & Teams ───────────── */}
        <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3 block">
                Campus Interest Groups & Teams
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Active Interest Groups (IGs)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                Explore our official technical interest groups and creative teams leading peer huddles, workshops, and challenges at GECI.
              </p>
            </div>

            {/* 10 Real Interest Groups Grid (All link to /events) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-32">
              {INTEREST_GROUPS.map((ig, index) => {
                const IconComp = ig.icon;
                return (
                  <motion.div
                    key={ig.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="p-7 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:border-blue-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] uppercase tracking-wider font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                          {ig.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold mb-2 text-slate-900 dark:text-white">
                        {ig.title}
                      </h3>

                      <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                        {ig.description}
                      </p>
                    </div>

                    <Link
                      to={ig.link}
                      className="w-full py-3 rounded-full font-bold text-xs inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-blue-600 text-white dark:bg-white dark:hover:bg-blue-500 dark:text-slate-900 dark:hover:text-white transition-all shadow-md group-hover:shadow-blue-500/20"
                    >
                      <span>Explore Events</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ Accordion Section */}
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-2 block">
                  Got Questions?
                </span>
                <h3 className="font-display text-3xl md:text-4xl font-bold">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-4">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={faq.question}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-6 text-left font-display text-lg font-bold flex items-center justify-between text-gray-900 dark:text-white"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-gray-500 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ─── 4.7 Footer Parallax Reveal Section ─────────────────────────── */}
        <footer ref={footerRef} className="relative bg-black text-white py-24 md:py-32 overflow-hidden border-t border-gray-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-16 border-b border-gray-800 gap-8">
              
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-500 mb-4 block">
                  Start Building Today
                </span>
                <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
                  Let's shape <br />
                  something new.
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/contact"
                  className="bg-white hover:bg-blue-500 text-black hover:text-white px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 shadow-xl"
                >
                  Contact Us
                </Link>

                <button
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                  className="w-14 h-14 rounded-full border border-gray-800 bg-gray-900 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
              </div>

            </div>

            <div className="pt-12 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
              <p>© 2026 µLearn GECI Chapter. Built with React, Three.js & Tailwind CSS.</p>
              <div className="flex space-x-6 text-gray-400 font-medium">
                <a href="https://discord.gg/c25EZQzd" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord</a>
                <a href="https://www.instagram.com/mulearn.geci" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
                <a href="https://chat.whatsapp.com/CR4zAR4yELmClICDZm5vOP" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
              </div>
            </div>

          </motion.div>
        </footer>

      </div>
  );
}