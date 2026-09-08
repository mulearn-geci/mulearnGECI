import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Sparkles, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { postsAPI } from '../services/api';
import { getPostImageUrl } from '../utils/imageUtils';
import { FilterBar, EmptyFilterState } from '../components/FilterBar';
import { useFilterState } from '../hooks/useFilterState';

function GalleryImage({
  src,
  alt,
  photoCount,
  onClick
}: {
  src: string;
  alt: string;
  photoCount?: number;
  onClick: () => void;
}) {
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

      {/* Multi-photo badge */}
      {photoCount !== undefined && photoCount > 1 && (
        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-md flex items-center gap-1.5 z-10">
          <Images className="w-3.5 h-3.5 text-blue-400" />
          <span>{photoCount} Photos</span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
          {photoCount && photoCount > 1 ? (
            <>
              <Images className="w-3.5 h-3.5 text-blue-400" />
              <span>View {photoCount} Photos</span>
            </>
          ) : (
            <span>Click to expand</span>
          )}
        </span>
      </div>
    </div>
  );
}

export function Gallery() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Multi-image Lightbox state
  const [lightbox, setLightbox] = useState<{
    images: string[];
    currentIndex: number;
    title: string;
    description?: string;
    category?: string;
    date?: string;
  } | null>(null);

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

  const openLightbox = (post: any, initialIndex: number = 0) => {
    const rawImages = (post.images && Array.isArray(post.images) && post.images.length > 0)
      ? post.images
      : (post.image ? [post.image] : []);

    const resolvedImages = rawImages.map((img: string) => getPostImageUrl(img));
    if (resolvedImages.length === 0) return;

    const displayDate = post.eventDate
      ? new Date(post.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : (post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined);

    setLightbox({
      images: resolvedImages,
      currentIndex: Math.max(0, Math.min(initialIndex, resolvedImages.length - 1)),
      title: post.title,
      description: post.description,
      category: post.category,
      date: displayDate
    });
  };

  const closeLightbox = () => setLightbox(null);

  const nextImage = useCallback(() => {
    setLightbox(prev => {
      if (!prev || prev.images.length <= 1) return prev;
      return {
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.images.length
      };
    });
  }, []);

  const prevImage = useCallback(() => {
    setLightbox(prev => {
      if (!prev || prev.images.length <= 1) return prev;
      return {
        ...prev,
        currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
      };
    });
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, nextImage, prevImage]);

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

              const postPhotos = post.images && Array.isArray(post.images) && post.images.length > 0
                ? post.images
                : (post.image ? [post.image] : []);

              return (
                <motion.article
                  key={post._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.4 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {postPhotos.length > 0 && (
                      <GalleryImage
                        src={getPostImageUrl(postPhotos[0])}
                        alt={post.title}
                        photoCount={postPhotos.length}
                        onClick={() => openLightbox(post, 0)}
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
                      <h3
                        onClick={() => openLightbox(post, 0)}
                        className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                      >
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

                  {/* Card Action Footer */}
                  {postPhotos.length > 0 && (
                    <div className="px-6 pb-6 pt-0">
                      <button
                        onClick={() => openLightbox(post, 0)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/btn"
                      >
                        <Images className="w-3.5 h-3.5 text-blue-500" />
                        <span>{postPhotos.length > 1 ? `View all ${postPhotos.length} photos` : 'View photo'}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
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

      {/* Multi-Image Interactive Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[92vh] bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Top Controls Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                {/* Photo counter */}
                <div className="pointer-events-auto bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  {lightbox.images.length > 1 ? (
                    <span>{lightbox.currentIndex + 1} / {lightbox.images.length}</span>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="pointer-events-auto bg-black/70 hover:bg-red-600 text-white rounded-full p-2.5 transition-colors shadow-lg border border-white/20"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Image Area with Previous / Next Arrows */}
              <div className="relative flex items-center justify-center w-full min-h-[35vh] sm:min-h-[45vh] max-h-[55vh] px-2 pt-14 pb-6 flex-1">
                {/* Previous Button */}
                {lightbox.images.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-blue-600 text-white p-2.5 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-md shadow-xl border border-white/20 group"
                    title="Previous photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Active Image */}
                <img
                  key={lightbox.currentIndex}
                  src={lightbox.images[lightbox.currentIndex]}
                  alt={`${lightbox.title} - ${lightbox.currentIndex + 1}`}
                  className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300 select-none"
                />

                {/* Next Button */}
                {lightbox.images.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-blue-600 text-white p-2.5 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-md shadow-xl border border-white/20 group"
                    title="Next photo (Right Arrow)"
                  >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Bottom Caption & Thumbnail Dots */}
              <div className="px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6 bg-gray-900/95 border-t-2 border-white/15 space-y-4 shrink-0 overflow-y-auto max-h-[35vh]">
                {/* Title + Badges */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {lightbox.category && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                        {lightbox.category}
                      </span>
                    )}
                    {lightbox.date && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        {lightbox.date}
                      </span>
                    )}
                  </div>
                  <h2 className="text-white font-bold text-lg sm:text-xl leading-snug">{lightbox.title}</h2>
                </div>

                {/* Full Description */}
                {lightbox.description && (
                  <div className="max-w-3xl mx-auto text-left sm:text-center">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                      {lightbox.description}
                    </p>
                  </div>
                )}

                {/* Thumbnail dots indicator */}
                {lightbox.images.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-1 overflow-x-auto max-w-md mx-auto py-1">
                    {lightbox.images.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setLightbox(prev => prev ? { ...prev, currentIndex: dotIdx } : null)}
                        className={`h-2 rounded-full transition-all duration-200 ${
                          dotIdx === lightbox.currentIndex
                            ? 'w-6 bg-blue-500'
                            : 'w-2 bg-gray-600 hover:bg-gray-400'
                        }`}
                        title={`Go to photo ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
