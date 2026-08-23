import React, { useState, useEffect } from 'react';
import { 
  Info, 
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
  BookOpen, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink, 
  Upload, 
  Trash2, 
  Plus, 
  AlertCircle,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { aboutAPI } from '../../services/api';
import { compressImageToDataUrl, getImageUrl } from '../../utils/imageUtils';

export interface ValueItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

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

export function AdminAbout() {
  const [hero, setHero] = useState(DEFAULT_CONFIG.hero);
  const [mission, setMission] = useState(DEFAULT_CONFIG.mission);
  const [vision, setVision] = useState(DEFAULT_CONFIG.vision);
  const [image, setImage] = useState(DEFAULT_CONFIG.image);
  const [imageAlt, setImageAlt] = useState(DEFAULT_CONFIG.imageAlt);
  const [values, setValues] = useState<ValueItem[]>(DEFAULT_CONFIG.values);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'mission_vision' | 'image' | 'values'>('mission_vision');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const res = await aboutAPI.getConfig();
        if (res && res.data) {
          const d = res.data;
          if (d.hero) setHero(prev => ({ ...prev, ...d.hero }));
          if (d.mission) setMission(prev => ({ ...prev, ...d.mission }));
          if (d.vision) setVision(prev => ({ ...prev, ...d.vision }));
          if (d.image) setImage(d.image);
          if (d.imageAlt) setImageAlt(d.imageAlt);
          if (Array.isArray(d.values) && d.values.length > 0) setValues(d.values);
        }
      } catch (err) {
        console.error('Failed to load about config:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await compressImageToDataUrl(file, 1400, 1000, 0.75);
      setImage(dataUrl);
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('Failed to process image file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddValue = () => {
    const newVal: ValueItem = {
      id: Date.now().toString(),
      icon: 'Sparkles',
      title: 'New Core Value',
      description: 'Describe the core value and how it benefits the student community.'
    };
    setValues([...values, newVal]);
  };

  const handleUpdateValue = (id: string, field: keyof ValueItem, value: string) => {
    setValues(values.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleDeleteValue = (id: string) => {
    setValues(values.filter(v => v.id !== id));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all About Page content back to default values? Any unsaved changes will be lost.')) {
      setHero(DEFAULT_CONFIG.hero);
      setMission(DEFAULT_CONFIG.mission);
      setVision(DEFAULT_CONFIG.vision);
      setImage(DEFAULT_CONFIG.image);
      setImageAlt(DEFAULT_CONFIG.imageAlt);
      setValues(DEFAULT_CONFIG.values);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      await aboutAPI.saveConfig({
        hero,
        mission,
        vision,
        image,
        imageAlt,
        values
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save about configuration:', err);
      setSaveError(err.message || 'Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title="About Page Customizer">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Info className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Page Customizer
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                About Page Editor
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                Edit the public About page content: Hero Header, Mission, Vision, Showcase Photo, and Core Values.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                <span>View Live /about</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {savedSuccess && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>About page configuration saved and published successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm font-bold flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('mission_vision')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'mission_vision'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Mission & Vision</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Showcase Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('values')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'values'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Core Values ({values.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero Header</span>
          </button>
        </div>

        {/* Tab 1: Mission & Vision */}
        {activeTab === 'mission_vision' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Our Mission */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Our Mission Section</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Displayed with the Target icon</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Mission Heading
                </label>
                <input
                  type="text"
                  value={mission.title}
                  onChange={e => setMission({ ...mission, title: e.target.value })}
                  placeholder="Our Mission"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Mission Statement / Description
                </label>
                <textarea
                  rows={4}
                  value={mission.description}
                  onChange={e => setMission({ ...mission, description: e.target.value })}
                  placeholder="To empower students with practical skills..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Our Vision */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Our Vision Section</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Displayed with the Eye icon</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Vision Heading
                </label>
                <input
                  type="text"
                  value={vision.title}
                  onChange={e => setVision({ ...vision, title: e.target.value })}
                  placeholder="Our Vision"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Vision Statement / Description
                </label>
                <textarea
                  rows={4}
                  value={vision.description}
                  onChange={e => setVision({ ...vision, description: e.target.value })}
                  placeholder="To be the leading student community..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Showcase Photo */}
        {activeTab === 'image' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Showcase / Team Collaboration Photo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This image appears right next to the Mission & Vision section on the public About page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Upload and URL controls */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Upload New Image File
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-900/60 transition-all group">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {isUploading ? 'Compressing Image...' : 'Click to select photo or drag & drop'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      PNG, JPG, WEBP (Auto-optimized)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Or Enter Image URL / Google Drive Link
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Google Drive URL"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    Image Alt Description (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={e => setImageAlt(e.target.value)}
                    placeholder="Team collaboration"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Photo Preview
                </span>
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-gray-900 aspect-[4/3]">
                  {image ? (
                    <img
                      src={getImageUrl(image)}
                      alt={imageAlt || 'About Showcase Preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Core Values */}
        {activeTab === 'values' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Core Values Grid
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage the principles and cards displayed under "Our Values" on the About page.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddValue}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Value</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((val, index) => {
                const IconComponent = AVAILABLE_ICONS[val.icon] || Target;

                return (
                  <div
                    key={val.id || index}
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700/80 space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Value #{index + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteValue(val.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Value"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Icon Selection Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Icon
                      </label>
                      <select
                        value={val.icon}
                        onChange={e => handleUpdateValue(val.id, 'icon', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {Object.keys(AVAILABLE_ICONS).map(iconName => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value Title */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Title
                      </label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={e => handleUpdateValue(val.id, 'title', e.target.value)}
                        placeholder="e.g. Innovation"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Value Description */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={val.description}
                        onChange={e => handleUpdateValue(val.id, 'description', e.target.value)}
                        placeholder="Describe this core value..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Hero Header */}
        {activeTab === 'hero' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Hero Banner Header
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The top banner section of the About page.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Eyebrow / Badge Text
              </label>
              <input
                type="text"
                value={hero.badge || ''}
                onChange={e => setHero({ ...hero, badge: e.target.value })}
                placeholder="WHO WE ARE"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Main Hero Title
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={e => setHero({ ...hero, title: e.target.value })}
                placeholder="About µLearn"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Hero Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={hero.description}
                onChange={e => setHero({ ...hero, description: e.target.value })}
                placeholder="A vibrant community of students, learners, and innovators..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Remember to save your changes to publish them to the live website.
          </span>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
