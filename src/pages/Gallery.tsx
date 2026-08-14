import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, X, ArrowUpRight, Sparkles, Tag } from 'lucide-react';
import { postsAPI } from '../services/api';
import { getPostImageUrl } from '../utils/imageUtils';

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
  const [selectedCategory, setSelectedCategory] = useState('all');

  // For enlarged image modal
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

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

  // Sort posts by eventDate or createdAt descending (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.eventDate || a.createdAt).getTime();
    const dateB = new Date(b.eventDate || b.createdAt).getTime();
    return dateB - dateA;
  });

  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = sortedPosts.filter(post => {
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
  });

  const openImage = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400 mb-3 bg-blue-50 dark:bg-blue-950 px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>µLearn GECI • Campus Moments</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
            Campus Gallery & Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
            Explore photos, event recaps, hackathon highlights, and orientation sessions from the µLearn GECI community.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {cat === 'all' ? 'All Posts' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-200 dark:border-gray-800"
              >
                <div className="h-64 bg-gray-200 dark:bg-gray-800"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
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
                  transition={{ delay: index * 0.06, duration: 0.4 }}
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

                      {/* Location */}
                      {post.location && (
                        <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="line-clamp-1">{post.location}</span>
                        </div>
                      )}

                      {/* Description */}
                      {post.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.description}
                        </p>
                      )}

                      {/* Tags */}
                      {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {post.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md flex items-center space-x-1">
                              <Tag className="w-2.5 h-2.5" />
                              <span>#{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional Action Link */}
                  {post.registrationLink && (
                    <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-800/60 mt-4">
                      <a
                        href={post.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
                      >
                        <span>View Event Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Sparkles className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Posts in this Category</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">New event highlights and orientations will appear here soon.</p>
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
              onClick={(e) => e.stopPropagation()}
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
