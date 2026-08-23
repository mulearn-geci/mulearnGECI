import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, X } from 'lucide-react';
import { eventsAPI } from '../services/api';
import { getEventImageUrl } from '../utils/imageUtils';
import { RegistrationButton } from '../components/RegistrationButton';
import { FilterBar, EmptyFilterState } from '../components/FilterBar';
import { useFilterState } from '../hooks/useFilterState';

export function Events() {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Image modal
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Filter state (URL-synced)
  const { filters, debouncedSearch, setFilter, clearFilters, hasActiveFilters, toAPIParams } = useFilterState();

  // Fetch ALL events once (upcoming + completed)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const [upRes, pastRes] = await Promise.all([
          eventsAPI.getAll('upcoming'),
          eventsAPI.getAll('completed'),
        ]);
        setAllEvents([...(upRes.data || []), ...(pastRes.data || [])]);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Derive categories from data
  const categories = useMemo(() => {
    const types = new Set<string>();
    allEvents.forEach(e => { if (e.type) types.add(e.type); });
    return Array.from(types).sort();
  }, [allEvents]);

  // Derive month options from data
  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();
    allEvents.forEach(e => {
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months.has(key)) {
        months.set(key, d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }));
      }
    });
    return Array.from(months.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([value, label]) => ({ value, label }));
  }, [allEvents]);

  // Client-side filtering (mirrors what backend would do with toAPIParams())
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return allEvents.filter(event => {
      // Text search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const inTitle = (event.title || '').toLowerCase().includes(q);
        const inDesc  = (event.description || '').toLowerCase().includes(q);
        const inLoc   = (event.location || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inLoc) return false;
      }

      // Category (maps to event.type)
      if (filters.category !== 'all' && event.type !== filters.category) return false;

      // Month
      if (filters.month !== 'all') {
        const d = new Date(event.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key !== filters.month) return false;
      }

      // Timing
      if (filters.timing === 'upcoming') {
        if (new Date(event.date) <= now) return false;
      } else if (filters.timing === 'past') {
        if (new Date(event.date) > now) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEvents, debouncedSearch, filters.category, filters.month, filters.timing]);

  const openImage = (src: string, alt: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth * 0.5, height: img.naturalHeight * 0.5 });
      setSelectedImage({ src, alt });
    };
  };

  const closeImage = () => setSelectedImage(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white dark:from-gray-900 dark:to-gray-900 dark:text-blue-100 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Events</h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Discover exciting opportunities to learn, network, and grow through our carefully curated events and workshops.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              showTimingFilter={true}
              searchPlaceholder="Search events by title, description, or location..."
              resultCount={isLoading ? undefined : filteredEvents.length}
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate <= new Date();

                return (
                  <motion.div
                    key={event._id || event.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.06, 0.5), duration: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div
                      className="relative h-48 overflow-hidden cursor-pointer"
                      onClick={() => openImage(getEventImageUrl(event.image), event.title)}
                    >
                      <img
                        src={getEventImageUrl(event.image)}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {event.type}
                        </span>
                      </div>
                      {isPast && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gray-900/70 backdrop-blur-sm text-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            Past
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          <span>
                            {eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <Clock className="h-4 w-4 ml-4 mr-2 text-blue-600" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{event.attendees || event.currentAttendees || 0} attendees</span>
                        </div>
                      </div>

                      {!isPast && (
                        <div className="pt-2">
                          <RegistrationButton
                            eventId={event._id || event.id}
                            eventTitle={event.title}
                            registrationLink={event.registrationLink}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : hasActiveFilters ? (
            <EmptyFilterState
              clearFilters={clearFilters}
              title="No events match your filters"
              description="Try broadening your search, selecting a different category, or changing the date range."
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No events available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImage}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeImage}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="object-contain rounded-2xl shadow-xl"
                style={{
                  width: imageSize?.width,
                  height: imageSize?.height,
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  display: 'block',
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
