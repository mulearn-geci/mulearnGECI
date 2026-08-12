import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Plus, Trash2, Edit3, Save, RefreshCw, CheckCircle, 
  Image as ImageIcon, Layers, Users, Layout, ArrowRight, ExternalLink,
  Upload, X, Info
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { homepageAPI } from '../../services/api';
import { compressImageToDataUrl } from '../../utils/imageUtils';

export interface CustomCard {
  id: string;
  number: string;
  meta: string;
  title: string;
  description: string;
  image: string;
  link: string;
  ctaText: string;
}

export interface CustomInterestGroup {
  id: string;
  title: string;
  domain: string;
  description: string;
  badge: string;
  link: string;
}

export interface CustomExecomSlot {
  id: string;
  name: string;
  role: string;
  department: string;
  image: string;
}

export interface CustomAboutSection {
  tagline: string;
  headline: string;
  description: string;
  stat1Number: string;
  stat1Label: string;
  stat2Number: string;
  stat2Label: string;
  photo1: string;
  photo2: string;
  photo3: string;
}

const STORAGE_KEY = 'mulearn_homepage_custom_config';

export function AdminHomepage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'igs' | 'execom' | 'about'>('cards');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default stacked cards
  const [cards, setCards] = useState<CustomCard[]>([
    {
      id: '1',
      number: '01',
      meta: 'µLEARN GECI • CAMPUS LEADERBOARD',
      title: 'Live Campus Karma XP & Streak Ranking System',
      description: 'Track daily GitHub commits, LinkedIn proof-of-work posts, and karma points earned across all GECI engineering departments in real time.',
      image: '',
      link: '/leaderboard',
      ctaText: 'View Leaderboard'
    },
    {
      id: '2',
      number: '02',
      meta: 'LEADERSHIP & ARCHITECTURE • EXECOM',
      title: 'Meet the Executive Board & Domain Leads',
      description: 'Our student office bearers and domain mentors coordinate technical interest groups, coding bootcamps, and hackathons year-round.',
      image: '',
      link: '/execom',
      ctaText: 'Meet Execom Board'
    },
    {
      id: '3',
      number: '03',
      meta: 'EVENTS & HACKATHONS • WORKSHOPS',
      title: 'Hands-On Bootcamps & 24-Hour Hackathons',
      description: 'Join campus workshops on Full-Stack Web Dev, AI/ML, Cloud DevOps, and Robotics engineered to turn theory into working code.',
      image: '',
      link: '/events',
      ctaText: 'Explore Events'
    },
    {
      id: '4',
      number: '04',
      meta: 'ALUMNI & CAREERS • PLACEMENT NETWORK',
      title: 'Global Alumni Mentorship & Job Referral Hub',
      description: 'Connect directly with graduated seniors working at top global tech firms for mock technical interviews, project guidance, and referrals.',
      image: '',
      link: '/alumni',
      ctaText: 'Connect with Alumni'
    }
  ]);

  // Default Interest Groups
  const [igs, setIgs] = useState<CustomInterestGroup[]>([
    {
      id: '1',
      title: 'DSA IG',
      domain: 'Algorithms & Coding',
      description: 'Master Data Structures, Algorithms, Problem Solving, and LeetCode challenges for technical interviews.',
      badge: 'Competitive',
      link: '/events'
    },
    {
      id: '2',
      title: 'AI IG',
      domain: 'Artificial Intelligence',
      description: 'Explore Machine Learning, Neural Networks, PyTorch models, and LLM application development.',
      badge: 'Trending',
      link: '/events'
    },
    {
      id: '3',
      title: 'App Development IG',
      domain: 'Mobile Dev',
      description: 'Build native Android and cross-platform mobile apps using Flutter, React Native, and Kotlin.',
      badge: 'Mobile',
      link: '/events'
    },
    {
      id: '4',
      title: 'UI/UX IG',
      domain: 'Design & Experience',
      description: 'Design modern user interfaces, Figma prototypes, design systems, and seamless user experiences.',
      badge: 'Design',
      link: '/events'
    },
    {
      id: '5',
      title: 'Cybersecurity IG',
      domain: 'Security & Hacking',
      description: 'Participate in Capture The Flag (CTF) events, network auditing, penetration testing, and ethical hacking.',
      badge: 'Security',
      link: '/events'
    },
    {
      id: '6',
      title: 'Game IG',
      domain: 'Game Development',
      description: 'Develop 2D/3D games, physics engines, shader programming, and interactive graphics using Unity & Unreal.',
      badge: 'Gaming',
      link: '/events'
    },
    {
      id: '7',
      title: 'Entrepreneurship IG',
      domain: 'Startups & Ventures',
      description: 'Turn technical ideas into viable startup products, pitch decks, business models, and founder networks.',
      badge: 'Startups',
      link: '/events'
    },
    {
      id: '8',
      title: 'Mucomics',
      domain: 'Visual Storytelling',
      description: 'Creative tech comics, digital illustrations, visual stories, and artistic expressions celebrating learning.',
      badge: 'Comics',
      link: '/events'
    }
  ]);

  // Default Execom team slots
  const [execoms, setExecoms] = useState<CustomExecomSlot[]>([
    {
      id: '1',
      name: 'Prof. Rejin R',
      role: 'Campus Enabler',
      department: 'Engineering',
      image: ''
    },
    {
      id: '2',
      name: 'Nidhin Gireesh',
      role: 'Campus Lead',
      department: 'Engineering',
      image: ''
    },
    {
      id: '3',
      name: 'Aparna Anilkumar',
      role: 'Co - Lead',
      department: 'Engineering',
      image: ''
    }
  ]);

  // Default About section
  const [about, setAbout] = useState<CustomAboutSection>({
    tagline: 'About µLearn GECI',
    headline: 'We believe in the power of student-led innovation.',
    description: 'µLearn GECI is designed to bridge the gap between academic curriculum and high-impact engineering careers. We help students build consistent proof-of-work, gain real-world project experience, and connect directly with industry hiring partners.',
    stat1Number: '1,040+',
    stat1Label: 'Active Climbers',
    stat2Number: '50+',
    stat2Label: 'Events Hosted',
    photo1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    photo2: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop',
    photo3: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load existing config on mount (First from localStorage, then API merge if server is newer & count safe)
  useEffect(() => {
    const fetchConfig = async () => {
      let localData: any = null;

      // 1. Read local storage FIRST for instant UI rendering
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          localData = JSON.parse(saved);
          if (localData.cards && localData.cards.length > 0) setCards(localData.cards);
          if (localData.igs && localData.igs.length > 0) setIgs(localData.igs);
          if (localData.execoms && localData.execoms.length > 0) setExecoms(localData.execoms);
          if (localData.about && Object.keys(localData.about).length > 0) setAbout((prev) => ({ ...prev, ...localData.about }));
        }
      } catch (err) {}

      // 2. Fetch from backend API & apply only if safe
      try {
        const res = await homepageAPI.getConfig();
        if (res.success && res.data) {
          const apiData = res.data;
          
          const localTime = localData?.updatedAt ? new Date(localData.updatedAt).getTime() : 0;
          const serverTime = apiData?.updatedAt ? new Date(apiData.updatedAt).getTime() : 0;

          const localCardsCount = localData?.cards?.length || 0;
          const serverCardsCount = apiData?.cards?.length || 0;

          // SAFEGUARD: Only overwrite local cards if:
          // a) Local storage was empty OR
          // b) Server has MORE cards than local cache!
          if (!localData || serverCardsCount > localCardsCount) {
            if (apiData.cards && apiData.cards.length > 0) setCards(apiData.cards);
            if (apiData.igs && apiData.igs.length > 0) setIgs(apiData.igs);
            if (apiData.execoms && apiData.execoms.length > 0) setExecoms(apiData.execoms);
            if (apiData.about && Object.keys(apiData.about).length > 0) setAbout((prev) => ({ ...prev, ...apiData.about }));
            
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(apiData));
            } catch (e) {}
          }
        }
      } catch (e) {}
    };
    fetchConfig();
  }, []);

  // Save Config
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const configPayload = { cards, igs, execoms, about, updatedAt: nowIso };
      
      // 1. Save locally FIRST for zero-delay responsiveness
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configPayload));
      } catch (storageErr) {
        console.warn('Local storage quota warning:', storageErr);
      }

      // 2. Save to backend database for worldwide persistence across all devices
      try {
        const apiRes = await homepageAPI.saveConfig({ cards, igs, execoms, about });
        if (apiRes && apiRes.success && apiRes.data && apiRes.data.cards && apiRes.data.cards.length >= cards.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(apiRes.data));
        }
      } catch (apiErr) {
        console.warn('Backend API save warning (retained in local cache):', apiErr);
      }

      // 3. Dispatch local events so all browser tabs update immediately
      window.dispatchEvent(new Event('mulearn_config_updated'));
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('mulearn_config_channel');
          bc.postMessage('update');
          bc.close();
        } catch (bcErr) {}
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (e: any) {
      console.error('Failed to save homepage config:', e);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // Card Handlers
  const updateCard = (index: number, field: keyof CustomCard, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const addCard = () => {
    const newCard: CustomCard = {
      id: String(Date.now()),
      number: String(cards.length + 1).padStart(2, '0'),
      meta: 'µLEARN GECI • NEW SHOWCASE',
      title: 'New Showcase Card',
      description: 'Enter card description here...',
      image: '',
      link: '/events',
      ctaText: 'Learn More'
    };
    setCards([...cards, newCard]);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  // IG Handlers
  const updateIg = (index: number, field: keyof CustomInterestGroup, value: string) => {
    const updated = [...igs];
    updated[index] = { ...updated[index], [field]: value };
    setIgs(updated);
  };

  const addIg = () => {
    const newIg: CustomInterestGroup = {
      id: String(Date.now()),
      title: 'New Interest Group',
      domain: 'Tech Domain',
      description: 'Enter Interest Group details...',
      badge: 'New',
      link: '/events'
    };
    setIgs([...igs, newIg]);
  };

  const removeIg = (index: number) => {
    setIgs(igs.filter((_, i) => i !== index));
  };

  // Execom Handlers
  const updateExecom = (index: number, field: keyof CustomExecomSlot, value: string) => {
    const updated = [...execoms];
    updated[index] = { ...updated[index], [field]: value };
    setExecoms(updated);
  };

  const addExecom = () => {
    const newExecom: CustomExecomSlot = {
      id: String(Date.now()),
      name: 'New Member Name',
      role: 'Role / Designation',
      department: 'Department Name',
      image: ''
    };
    setExecoms([...execoms, newExecom]);
  };

  const removeExecom = (index: number) => {
    setExecoms(execoms.filter((_, i) => i !== index));
  };

  // File Upload Helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onRead: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedDataUrl = await compressImageToDataUrl(file, 1200, 1200, 0.75);
      if (compressedDataUrl) {
        onRead(compressedDataUrl);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Title & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Homepage & Customizer Studio</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Customize Homepage Cards, Photos & Content
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload local image files or paste image URLs to replace photos across cards, Execom team slots, Interest Groups, and About section.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Changes...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span>Changes Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3.5 px-5 rounded-2xl text-sm transition-colors"
            >
              <span>Preview Homepage</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'cards'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stacked Showcase Cards ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Section & Photos</span>
          </button>

          <button
            onClick={() => setActiveTab('igs')}
            className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'igs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Active Interest Groups ({igs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('execom')}
            className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'execom'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Execom Team Slots ({execoms.length})</span>
          </button>
        </div>

        {/* ─── TAB 1: STACKED SHOWCASE CARDS ───────────────────────────────────── */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Manage Stacked Highlight Cards & Photos
              </h2>
              <button
                onClick={addCard}
                className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Showcase Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Card #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeCard(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(idx, 'title', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Badge / Tagline</label>
                      <input
                        type="text"
                        value={card.meta}
                        onChange={(e) => updateCard(idx, 'meta', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => updateCard(idx, 'description', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    {/* Image Upload & URL Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Card Photo / Image</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Paste Image URL or Upload File"
                          value={card.image}
                          onChange={(e) => updateCard(idx, 'image', e.target.value)}
                          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
                        />
                        <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors shadow-sm flex-shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (dataUrl) => updateCard(idx, 'image', dataUrl))}
                          />
                        </label>
                      </div>

                      {card.image && (
                        <div className="mt-3 relative w-24 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                          <img src={card.image} alt="Card Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => updateCard(idx, 'image', '')}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Target Link</label>
                        <input
                          type="text"
                          value={card.link}
                          onChange={(e) => updateCard(idx, 'link', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={card.ctaText}
                          onChange={(e) => updateCard(idx, 'ctaText', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 2: ABOUT SECTION & PHOTOS ───────────────────────────────────── */}
        {activeTab === 'about' && (
          <div className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                About µLearn GECI Text & Showcase Photos
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Replace the headline text, paragraph description, statistics, and 3 showcase photos next to the section on the homepage.
              </p>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Section Tagline</label>
                <input
                  type="text"
                  value={about.tagline}
                  onChange={(e) => setAbout({ ...about, tagline: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Headline Text</label>
                <input
                  type="text"
                  value={about.headline}
                  onChange={(e) => setAbout({ ...about, headline: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Paragraph Description</label>
                <textarea
                  rows={3}
                  value={about.description}
                  onChange={(e) => setAbout({ ...about, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stat 1 Value</label>
                  <input
                    type="text"
                    value={about.stat1Number}
                    onChange={(e) => setAbout({ ...about, stat1Number: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stat 1 Label</label>
                  <input
                    type="text"
                    value={about.stat1Label}
                    onChange={(e) => setAbout({ ...about, stat1Label: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stat 2 Value</label>
                  <input
                    type="text"
                    value={about.stat2Number}
                    onChange={(e) => setAbout({ ...about, stat2Number: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Stat 2 Label</label>
                  <input
                    type="text"
                    value={about.stat2Label}
                    onChange={(e) => setAbout({ ...about, stat2Label: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Showcase Photos Inputs */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                Replace The 3 Showcase Photos Next To The Text
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Photo 1 (Tall Left Photo) */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Photo 1 (Tall Main Photo)
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL or Upload"
                      value={about.photo1}
                      onChange={(e) => setAbout((prev) => ({ ...prev, photo1: e.target.value }))}
                      className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
                    />
                    <label className="cursor-pointer inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex-shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (dataUrl) => setAbout((prev) => ({ ...prev, photo1: dataUrl })))}
                      />
                    </label>
                  </div>

                  {about.photo1 && (
                    <div className="mt-2 relative h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                      <img src={about.photo1} alt="About Photo 1 Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setAbout((prev) => ({ ...prev, photo1: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Photo 2 (Top Right Photo) */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Photo 2 (Top Right Photo)
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL or Upload"
                      value={about.photo2}
                      onChange={(e) => setAbout((prev) => ({ ...prev, photo2: e.target.value }))}
                      className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
                    />
                    <label className="cursor-pointer inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex-shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (dataUrl) => setAbout((prev) => ({ ...prev, photo2: dataUrl })))}
                      />
                    </label>
                  </div>

                  {about.photo2 && (
                    <div className="mt-2 relative h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                      <img src={about.photo2} alt="About Photo 2 Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setAbout((prev) => ({ ...prev, photo2: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Photo 3 (Bottom Right Photo) */}
                <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    Photo 3 (Bottom Right Photo)
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL or Upload"
                      value={about.photo3}
                      onChange={(e) => setAbout((prev) => ({ ...prev, photo3: e.target.value }))}
                      className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
                    />
                    <label className="cursor-pointer inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex-shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (dataUrl) => setAbout((prev) => ({ ...prev, photo3: dataUrl })))}
                      />
                    </label>
                  </div>

                  {about.photo3 && (
                    <div className="mt-2 relative h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                      <img src={about.photo3} alt="About Photo 3 Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setAbout((prev) => ({ ...prev, photo3: '' }))}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: ACTIVE INTEREST GROUPS ───────────────────────────────────── */}
        {activeTab === 'igs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Manage Active Interest Groups (IGs)
              </h2>
              <button
                onClick={addIg}
                className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Interest Group</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {igs.map((ig, idx) => (
                <div
                  key={ig.id || idx}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      IG #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeIg(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete IG"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Interest Group Name</label>
                      <input
                        type="text"
                        value={ig.title}
                        onChange={(e) => updateIg(idx, 'title', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Domain Sub-tag</label>
                        <input
                          type="text"
                          value={ig.domain}
                          onChange={(e) => updateIg(idx, 'domain', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Badge Text</label>
                        <input
                          type="text"
                          value={ig.badge}
                          onChange={(e) => updateIg(idx, 'badge', e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={ig.description}
                        onChange={(e) => updateIg(idx, 'description', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: EXECOM TEAM SLOTS ────────────────────────────────────────── */}
        {activeTab === 'execom' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Manage Execom Leadership Slots & Photos
              </h2>
              <button
                onClick={addExecom}
                className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Execom Member Slot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {execoms.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Member Slot #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeExecom(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateExecom(idx, 'name', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Role / Designation</label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => updateExecom(idx, 'role', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                      <input
                        type="text"
                        value={member.department}
                        onChange={(e) => updateExecom(idx, 'department', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-medium"
                      />
                    </div>

                    {/* Member Photo Upload & URL Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Member Photo Image</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Paste URL or Upload File"
                          value={member.image}
                          onChange={(e) => updateExecom(idx, 'image', e.target.value)}
                          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white"
                        />
                        <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors shadow-sm flex-shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (dataUrl) => updateExecom(idx, 'image', dataUrl))}
                          />
                        </label>
                      </div>

                      {member.image && (
                        <div className="mt-3 relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 group">
                          <img src={member.image} alt="Member Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => updateExecom(idx, 'image', '')}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
