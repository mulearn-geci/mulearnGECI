import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Maximize2, Zap, Layout, ChevronDown, 
  ArrowUp, Sparkles, Star, Users, CheckCircle, ShieldCheck,
  Compass, Code, Laptop, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroShaderCanvas } from '../components/HeroShaderCanvas';
import { StackedProjectCards } from '../components/StackedProjectCards';

// Section 4.2 Services / Core Pillars Data
const SERVICES = [
  {
    icon: Zap,
    title: 'Hackathons & Sprints',
    description: 'Intensive 24-hour building sprees and 60-day challenges to translate theoretical engineering into production code.'
  },
  {
    icon: Maximize2,
    title: 'Skill Bootcamps',
    description: 'Peer-led learning circles covering Full-Stack Web Development, AI/ML models, Robotics, and Cloud DevOps.'
  },
  {
    icon: Layout,
    title: 'Innovation Labs',
    description: 'Dedicated campus hardware labs and open-source hubs for prototyping real-world software and IoT hardware.'
  },
  {
    icon: ArrowUpRight,
    title: 'Industry & Alumni Network',
    description: 'Direct mentorship, mock technical interviews, and job placement referrals connected to global alumni engineers.'
  }
];

// Section 4.5 Execom Team Members
const TEAM_MEMBERS = [
  {
    name: 'Albert George',
    role: 'Campus Lead & Lead Architect',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop',
    department: 'Computer Science & Eng.'
  },
  {
    name: 'Avani R',
    role: 'Technical Lead & Developer',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop',
    department: 'Electronics & Comm.'
  },
  {
    name: 'Jeevan Prakash',
    role: 'Events & Operations Lead',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    department: 'Robotics & AI'
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

// Section 4.6 Learning Tracks & Tiers
const TRACKS = [
  {
    name: 'Starter Track',
    badge: 'Beginner',
    tagline: 'Ideal for 1st & 2nd year students starting their coding journey.',
    features: ['HTML/CSS/JS Basics', 'Git & GitHub Workflows', 'Weekly Discord Huddles', 'Community Karma XP'],
    highlighted: false
  },
  {
    name: 'Pioneer Track',
    badge: 'Most Popular',
    tagline: 'Full-stack engineering, AI projects & 60-day building streaks.',
    features: ['React & Node.js Architecture', 'Automated CI/CD & Cloud', 'Direct Industry Mentorship', 'Live Leaderboard Ladder', 'Placement Referrals'],
    highlighted: true
  },
  {
    name: 'Research & AI Track',
    badge: 'Advanced',
    tagline: 'Deep dive into Machine Learning, Robotics, and IoT Hardware.',
    features: ['PyTorch & LLM Fine-tuning', 'ROS & Autonomous Hardware', 'Research Paper Publishing', 'Lab Hardware Access'],
    highlighted: false
  }
];

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Parallax transform for Hero Section
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 250]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0d0d0d] text-white font-sans selection:bg-blue-600 selection:text-white">
        
        {/* ─── 4.1 Hero Section (100vh) ─────────────────────────────────────── */}
        <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden bg-[#0d0d0d]">
          {/* Full Screen WebGL Shader Canvas */}
          <HeroShaderCanvas />

          {/* Dark Overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0d0d0d] z-10 pointer-events-none" />

          {/* Hero Content (Centered Vertically & Parallax transform) */}
          <motion.div
            style={{ y: heroY }}
            className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 w-full flex flex-col items-start justify-center pt-16"
          >
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center space-x-2.5 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8 text-xs font-semibold uppercase tracking-widest text-blue-300 shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>µLearn GECI • Student Innovation Hub</span>
            </motion.div>

            {/* Massive Hero Display Heading */}
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
                  {/* Micro-interaction: Extending line from 'n' scaling X 0 to 1 over 1.5s */}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-1/2 left-full -translate-y-1/2 ml-2 w-[100px] sm:w-[220px] md:w-[380px] lg:w-[450px] h-2.5 bg-white rounded-r-full shadow-lg origin-left"
                  />
                </span>
              </span>
            </motion.h1>

            {/* Subtitle Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-gray-300 text-base md:text-xl max-w-2xl leading-relaxed mb-10"
            >
              Empowering Government Engineering College Idukki students through peer-to-peer coding sprints, real-world proof of work, and live karma leaderboards.
            </motion.p>

            {/* CTA Buttons */}
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

          {/* Circular Rotating Badge (Bottom Right) */}
          <div className="absolute bottom-10 right-8 md:right-16 z-30 pointer-events-auto">
            <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
              {/* Infinitely Rotating SVG Text (360deg over 10s) */}
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

              {/* Central Star Icon */}
              <div className="absolute inset-0 m-auto w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-amber-400 shadow-xl">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4.2 Services / Core Pillars Section ─────────────────────────── */}
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            
            {/* Header */}
            <div className="mb-20">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3 block">
                What We Offer
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
                Our Core Pillars & Offerings
              </h2>
            </div>

            {/* 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {SERVICES.map((service, index) => {
                const IconComp = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <IconComp className="w-7 h-7" />
                      </div>
                      <h3 className="font-display text-xl font-bold mb-3 text-gray-900 dark:text-white">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <span>Learn More</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ─── 4.3 Latest Projects (Stacked Cards Carousel) ────────────────── */}
        <StackedProjectCards />

        {/* ─── 4.4 About Section (Masonry Parallax) ────────────────────────── */}
        <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Sticky Narrative Text */}
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

              {/* Right Column: Masonry Grid with whileInView motion */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                
                {/* Image 1: Large Left Column */}
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

                {/* Right Column (Top & Bottom Images) */}
                <div className="sm:col-span-1 space-y-6">
                  
                  {/* Image 2: Top Right */}
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

                  {/* Image 3: Bottom Right */}
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

        {/* ─── 4.5 Team Banner & Grid ───────────────────────────────────────── */}
        <section className="py-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
          
          {/* Marquee Banner with Text Stroke Effect */}
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

          {/* 3-Column Team Grid */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TEAM_MEMBERS.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group relative h-[420px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl cursor-pointer"
                >
                  {/* Image with Grayscale -> Color Hover Transition */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Text Overlay (Slides Up on Hover) */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-xs uppercase tracking-wider font-semibold text-blue-400 block mb-1">
                      {member.department}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-gray-300 text-sm font-medium">
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

        {/* ─── 4.6 FAQ & Pricing / Learning Tracks ─────────────────────────── */}
        <section className="py-24 md:py-32 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            
            {/* Learning Tracks / Pricing Tiers */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-3 block">
                Learning Paths
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Pick Your Learning Track
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                Whether you are writing your first line of HTML or fine-tuning ML models, there is a dedicated track for you.
              </p>
            </div>

            {/* 3 Tier Cards (Center Pro tier highlighted black) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-32">
              {TRACKS.map((track) => {
                const isHighlight = track.highlighted;
                return (
                  <div
                    key={track.name}
                    className={`rounded-3xl p-8 transition-all duration-300 shadow-xl border ${
                      isHighlight
                        ? 'bg-black text-white dark:bg-gray-900 border-blue-500 md:-translate-y-4 shadow-blue-500/10'
                        : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full ${
                        isHighlight ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {track.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold mb-2">
                      {track.name}
                    </h3>
                    <p className={`text-sm mb-8 ${isHighlight ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      {track.tagline}
                    </p>

                    <div className="space-y-3 mb-8">
                      {track.features.map((feat) => (
                        <div key={feat} className="flex items-center space-x-3 text-sm">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isHighlight ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'}`} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/events"
                      className={`w-full py-3.5 rounded-full font-bold text-sm inline-flex items-center justify-center transition-all ${
                        isHighlight
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-900 hover:bg-blue-600 text-white dark:bg-white dark:hover:bg-blue-500 dark:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Join Track
                    </Link>
                  </div>
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
        <footer className="relative bg-black text-white py-24 md:py-32 overflow-hidden border-t border-gray-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-16 border-b border-gray-800 gap-8">
              
              {/* Massive CTA */}
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-500 mb-4 block">
                  Start Building Today
                </span>
                <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight">
                  Let's shape <br />
                  something new.
                </h2>
              </div>

              {/* Action Buttons & Scroll to Top */}
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

            {/* Bottom Meta & Copyright */}
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