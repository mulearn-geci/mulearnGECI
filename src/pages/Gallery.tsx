import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Sparkles } from 'lucide-react';
import { postsAPI } from '../services/api';
import { getPostImageUrl } from '../utils/imageUtils';
import { FilterBar, EmptyFilterState } from '../components/FilterBar';
import { useFilterState } from '../hooks/useFilterState';

function GalleryImage({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  return (
    <div
      className="w-full h-64 bg-gray-900 rounded-t-2xl overflow-hidden cursor-pointer relative group"
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
          Click to expand
        </span>
      </div>
    </div>
  );
}

export function Gallery() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Image modal
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  // Filter state (URL-synced)
  const { filters, debouncedSearch, setFilter, clearFilters, hasActiveFilters } = useFilterState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const postsResponse = await postsAPI.getAll('published');
        setPosts(postsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive categories from data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [posts]);

  // Derive month options from data
  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();
    posts.forEach(p => {
      const d = new Date(p.eventDate || p.createdAt);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months.has(key)) {
        months.set(key, d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }));
      }
    });
    return Array.from(months.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([value, label]) => ({ value, label }));
  }, [posts]);

  // Client-side filtering
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Text search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const inTitle = (post.title || '').toLowerCase().includes(q);
        const inDesc  = (post.description || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }

      // Category
      if (filters.category !== 'all' && post.category !== filters.category) return false;

      // Month
      if (filters.month !== 'all') {
        const d = new Date(post.eventDate || post.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key !== filters.month) return false;
      }

      return true;
    }).sort((a, b) => {
      const dA = new Date(a.eventDate || a.createdAt).getTime();
      const dB = new Date(b.eventDate || b.createdAt).getTime();
      return dB - dA;
    });
  }, [posts, debouncedSearch, filters.category, filters.month]);

  const openImage = (src: string, alt: string) => setSelectedImage({ src, alt });
  const closeImage = () => setSelectedImage(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-950 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>µLearn GECI • Campus Moments</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
            Campus Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
            Explore photos, event recaps, hackathon highlights, and orientation sessions from the µLearn GECI community.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-10">
          <FilterBar
            filters={filters}
            debouncedSearch={debouncedSearch}
            setFilter={setFilter}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            categories={categories}
            monthOptions={monthOptions}
            showTimingFilter={false}
            searchPlaceholder="Search gallery by title or caption..."
            resultCount={isLoading ? undefined : filteredPosts.length}
          />
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-200 dark:border-gray-800"
              >
                <div className="h-64 bg-gray-200 dark:bg-gray-800" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => {
              const displayDate = post.eventDate
                ? new Date(post.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

              return (
                <motion.article
                  key={post._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.4 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {post.image && (
                      <GalleryImage
                        src={getPostImageUrl(post.image)}
                        alt={post.title}
                        onClick={() => openImage(getPostImageUrl(post.image), post.title)}
                      />
                    )}

                    <div className="p-6">
                      {/* Category & Date */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        {post.category && (
                          <span className="text-[11px] uppercase tracking-wider font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        )}
                        <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          <span>{displayDate}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>

                      {/* Description */}
                      {post.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : hasActiveFilters ? (
          <EmptyFilterState
            clearFilters={clearFilters}
            title="No photos match your filters"
            description="Try broadening your search, selecting a different category, or changing the month."
          />
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Sparkles className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Photos Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">New moments, event highlights, and orientations will appear here soon.</p>
          </div>
        )}
      </main>

      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImage}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeImage}
                className="absolute top-4 right-4 z-10 bg-black/70 text-white rounded-full p-2.5 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full max-h-[85vh] object-contain rounded-2xl"
              />
              <div className="p-4 text-center">
                <p className="text-white font-bold text-lg">{selectedImage.alt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
