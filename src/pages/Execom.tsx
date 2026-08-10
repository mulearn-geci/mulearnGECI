import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Target, Linkedin, Mail, Github, Instagram, Phone, Code2, Loader2 } from 'lucide-react';
import { execomAPI } from '../services/api';
import { getImageUrl, extractGoogleDriveFileId } from '../utils/imageUtils';

import Anandhu from '../img/anandhu.jpg';
import Navya from '../img/NavyaMariamJohn.jpg';
import Nidhin from '../img/Nidhin.jpg';
import Shimna from '../img/shimna.jpg';
import Ihsaan from '../img/ihsaan.jpg';
import Adithyan from '../img/steam.jpg';
import Avani from '../img/avani.jpg';
import Jeevan from '../img/JEEVANPRAKASH.jpeg';
import Albert from '../img/albert.jpeg';
import Rejin from '../img/Rejin.jpg';
import Nicholas from '../img/nicho.jpg';

const defaultImageMap: Record<string, string> = {
  'Prof. Rejin R': Rejin,
  'Albert George': Albert,
  'Anandhu S Uthaman': Anandhu,
  'Navya Mariam John': Navya,
  'Nicholas Roy': Nicholas,
  'Nidhin Gireesh': Nidhin,
  'Shimna B': Shimna,
  'K S Mohammed Ihsaan': Ihsaan,
  'Adithyan VS': Adithyan,
  'Avani M U': Avani,
  'Jeevan Prakash': Jeevan,
};

interface ExecomMember {
  _id?: string;
  name: string;
  position: string;
  category?: 'execom' | 'ig_lead';
  domain?: string;
  phone?: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  email?: string;
  github?: string;
  instagram?: string;
  order?: number;
}

export function Execom() {
  const [members, setMembers] = useState<ExecomMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecom = async () => {
      try {
        setLoading(true);
        const res = await execomAPI.getAll();
        if (res.success && res.data) {
          setMembers(res.data);
        } else {
          setMembers([]);
        }
      } catch (err: any) {
        console.error('Error fetching Execom members:', err);
        setError('Failed to load Execom team members.');
      } finally {
        setLoading(false);
      }
    };

    fetchExecom();
  }, []);

  const resolveMemberImage = (member: ExecomMember): string => {
    if (member.image && (member.image.startsWith('/uploads/') || member.image.startsWith('http'))) {
      return getImageUrl(member.image);
    }
    if (defaultImageMap[member.name]) {
      return defaultImageMap[member.name];
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, member: ExecomMember) => {
    const target = e.target as HTMLImageElement;
    const fileId = extractGoogleDriveFileId(member.image || '');
    
    if (fileId) {
      if (!target.src.includes('uc?export=view')) {
        target.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
        return;
      }
      if (!target.src.includes('lh3.googleusercontent.com')) {
        target.src = `https://lh3.googleusercontent.com/d/${fileId}`;
        return;
      }
    }

    if (defaultImageMap[member.name] && target.src !== defaultImageMap[member.name]) {
      target.src = defaultImageMap[member.name];
      return;
    }
    
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=500`;
  };

  // Filter Executive Committee vs IG Leads
  const execomMembers = members.filter(m => !m.category || m.category === 'execom');
  const igLeads = members.filter(m => m.category === 'ig_lead');

  const responsibilities = [
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Developing long-term vision and strategic roadmap for community growth and impact.'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Fostering an inclusive environment where all members can learn, grow, and collaborate.'
    },
    {
      icon: Award,
      title: 'Excellence in Execution',
      description: 'Ensuring high-quality delivery of events, projects, and community initiatives.'
    }
  ];

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Executive Committee & Leads</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Meet the dedicated leaders and domain mentors who drive µLearn's mission forward and empower students across campus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Responsibilities</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The executive committee works together to ensure µLearn continues to be a thriving community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {responsibilities.map((responsibility, index) => (
              <motion.div
                key={responsibility.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <responsibility.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{responsibility.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{responsibility.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Committee Members */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our executive committee brings together diverse talents and expertise to lead µLearn.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {execomMembers.map((member, index) => (
                <motion.div
                  key={member._id || member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={resolveMemberImage(member)}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, member)}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                      <p className="text-blue-600 dark:text-blue-300 font-medium mb-3">{member.position}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{member.bio}</p>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-center space-x-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="GitHub"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interest Group Leads (IG Leads) Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/60 transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center space-x-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Code2 className="h-4 w-4" />
              <span>Specialized Domain Leads</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Interest Group Leads (IG Leads)</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our passionate Interest Group leads guide domain-specific learning, workshops, and technical tracks across various disciplines.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : igLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No Interest Group Leads listed yet. Admins can add IG Leads from the Admin Panel.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {igLeads.map((member, index) => (
                <motion.div
                  key={member._id || member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={resolveMemberImage(member)}
                        alt={member.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => handleImageError(e, member)}
                      />
                      {member.domain && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          {member.domain}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                      <p className="text-blue-600 dark:text-blue-300 font-medium text-sm mb-3">{member.position}</p>
                      {member.bio && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{member.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-center space-x-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          aria-label="GitHub"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Want to Join Section */}
      <section className="py-16 bg-blue-600 dark:bg-gray-900 text-white dark:text-blue-100 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Want to Join the Team?</h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 leading-relaxed">
              We're always looking for passionate individuals to join our executive committee and lead interest groups.
            </p>
            
            <a
              href="/contact"
              className="bg-white dark:bg-blue-600 text-blue-600 dark:text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors duration-200"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}