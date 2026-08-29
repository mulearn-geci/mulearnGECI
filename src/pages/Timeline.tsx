import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsAPI } from '../services/api';
import { getEventImageUrl } from '../utils/imageUtils';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

export function Timeline() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Multi-image lightbox modal
  const [lightbox, setLightbox] = useState<{
    images: string[];
    currentIndex: number;
    title: string;
  } | null>(null);

  // Fetch only completed events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsAPI.getAll('completed');
        let fetchedEvents = response.data || [];

        // Sort events by date (latest first)
        fetchedEvents = fetchedEvents.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        alert('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const openLightbox = (event: any, initialIndex: number = 0) => {
    const rawImages = (event.images && Array.isArray(event.images) && event.images.length > 0)
      ? event.images
      : (event.image ? [event.image] : []);

    const resolved = rawImages.map((img: string) => getEventImageUrl(img));
    if (resolved.length === 0) return;

    setLightbox({
      images: resolved,
      currentIndex: Math.max(0, Math.min(initialIndex, resolved.length - 1)),
      title: event.title
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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Timeline</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              A glimpse of our past events and activities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <div className="flex justify-center py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 min-h-screen">
        <div className="relative w-full max-w-5xl">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading events...</p>
            </div>
          )}

          {/* No Events */}
          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No events available at the moment.
              </p>
            </div>
          )}

          {/* Events Timeline */}
          {!isLoading && events.length > 0 && (
            <>
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-600 rounded-full"></div>

              {events.map((event, index) => (
                <motion.div
                  key={index}
                  className={`relative w-full flex ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  } mb-16`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 border-4 border-white rounded-full shadow-md" />

                  {/* Event card */}
                  <div className="w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Event image */}
                    {(() => {
                      const eventPhotos = event.images && Array.isArray(event.images) && event.images.length > 0
                        ? event.images
                        : (event.image ? [event.image] : []);

                      return (
                        <div
                          className="relative h-40 overflow-hidden cursor-pointer group"
                          onClick={() => openLightbox(event, 0)}
                        >
                          <img
                            src={getEventImageUrl(eventPhotos[0] || event.image)}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {eventPhotos.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-md flex items-center gap-1 z-10">
                              <Images className="w-3 h-3 text-blue-400" />
                              <span>{eventPhotos.length} Photos</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Event content */}
                    <div className="p-4">
                      <h3
                        onClick={() => openLightbox(event, 0)}
                        className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {event.title}
                      </h3>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>

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
              className="relative max-w-5xl w-full max-h-[92vh] bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Controls Bar */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                  {lightbox.images.length > 1 ? (
                    <span>{lightbox.currentIndex + 1} / {lightbox.images.length}</span>
                  ) : (
                    <span>Photo</span>
                  )}
                </div>

                <button
                  onClick={closeLightbox}
                  className="pointer-events-auto bg-black/70 hover:bg-red-600 text-white rounded-full p-2.5 transition-colors shadow-lg border border-white/20"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Image Area with Previous / Next Arrows */}
              <div className="relative flex items-center justify-center w-full min-h-[50vh] max-h-[75vh] p-2 pt-14">
                {lightbox.images.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-blue-600 text-white p-2.5 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-md shadow-xl border border-white/20 group"
                    title="Previous photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                )}

                <img
                  key={lightbox.currentIndex}
                  src={lightbox.images[lightbox.currentIndex]}
                  alt={`${lightbox.title} - ${lightbox.currentIndex + 1}`}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300 select-none"
                />

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
              <div className="p-4 sm:p-6 bg-gray-900/90 border-t border-white/10 text-center space-y-2">
                <p className="text-white font-bold text-base sm:text-lg">{lightbox.title}</p>

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
