import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  Sparkles, 
  Zap, 
  Shield, 
  Rocket, 
  Globe, 
  Lightbulb, 
  Compass, 
  Star, 
  BookOpen 
} from 'lucide-react';
import { aboutAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const AVAILABLE_ICONS: { [key: string]: React.ElementType } = {
  Target,
  Users,
  Heart,
  Award,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Globe,
  Lightbulb,
  Compass,
  Star,
  BookOpen
};

const DEFAULT_CONFIG = {
  hero: {
    badge: 'WHO WE ARE',
    title: 'About µLearn',
    description: 'A vibrant community of students, learners, and innovators working together to create meaningful impact through technology and collaboration.'
  },
  mission: {
    title: 'Our Mission',
    description: 'To empower students with practical skills, foster innovation, and create a supportive ecosystem where learners can collaborate, grow, and make meaningful contributions to technology and society.'
  },
  vision: {
    title: 'Our Vision',
    description: 'To be the leading student community that bridges the gap between academic learning and industry requirements, creating future-ready professionals and innovators.'
  },
  image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
  imageAlt: 'Team collaboration',
  values: [
    {
      id: '1',
      icon: 'Target',
      title: 'Innovation',
      description: 'We foster creativity and encourage innovative thinking to solve real-world problems.'
    },
    {
      id: '2',
      icon: 'Users',
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and collective intelligence to achieve greater outcomes.'
    },
    {
      id: '3',
      icon: 'Heart',
      title: 'Inclusivity',
      description: 'We create an environment where everyone feels welcome and valued, regardless of their background.'
    },
    {
      id: '4',
      icon: 'Award',
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do and celebrate achievements.'
    }
  ]
};

export function About() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await aboutAPI.getConfig();
        if (res && res.data) {
          const d = res.data;
          setConfig({
            hero: {
              badge: d.hero?.badge || DEFAULT_CONFIG.hero.badge,
              title: d.hero?.title || DEFAULT_CONFIG.hero.title,
              description: d.hero?.description || DEFAULT_CONFIG.hero.description
            },
            mission: {
              title: d.mission?.title || DEFAULT_CONFIG.mission.title,
              description: d.mission?.description || DEFAULT_CONFIG.mission.description
            },
            vision: {
              title: d.vision?.title || DEFAULT_CONFIG.vision.title,
              description: d.vision?.description || DEFAULT_CONFIG.vision.description
            },
            image: d.image || DEFAULT_CONFIG.image,
            imageAlt: d.imageAlt || DEFAULT_CONFIG.imageAlt,
            values: Array.isArray(d.values) && d.values.length > 0 ? d.values : DEFAULT_CONFIG.values
          });
        }
      } catch (err) {
        console.error('Failed to load about page configuration:', err);
      }
    };

    fetchConfig();
  }, []);

  const { hero, mission, vision, image, imageAlt, values } = config;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {hero.badge && (
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-blue-200 dark:text-blue-400 bg-blue-500/30 dark:bg-blue-900/50 rounded-full border border-blue-400/30">
                {hero.badge}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{hero.title}</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              {hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{mission.title}</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {mission.description}
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Eye className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{vision.title}</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {vision.description}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80">
                <img
                  src={getImageUrl(image)}
                  alt={imageAlt || 'Team collaboration'}
                  className="w-full h-auto object-cover max-h-[480px] rounded-2xl"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide our community and shape our approach to learning and collaboration.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${values.length >= 4 ? 'lg:grid-cols-4' : values.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
            {values.map((value, index) => {
              const IconComponent = AVAILABLE_ICONS[value.icon] || Target;

              return (
                <motion.div
                  key={value.id || value.title || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center bg-white dark:bg-gray-900/60 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 hover:shadow-md transition-shadow"
                >
                  <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-500/20">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}