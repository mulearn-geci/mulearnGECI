import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Users, Calendar as CalendarIcon, MapPin, Search, Filter } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { eventsAPI } from '../../services/api';
import { getEventImageUrl } from '../../utils/imageUtils';

export function AdminEvents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleEditEvent = (event: any) => {
    navigate(`/admin/events/edit/${event._id}`);
  };

  const handleDeleteEvent = (event: any) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await eventsAPI.delete(selectedEvent._id);
        setEvents(events.filter(event => event._id !== selectedEvent._id));
        alert(`Event "${selectedEvent.title}" deleted successfully!`);
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event');
      } finally {
        setShowDeleteModal(false);
        setSelectedEvent(null);
      }
    }
  };

  const handleViewDetails = (event: any) => {
    console.log('View event details:', event);
    // Navigate to event details page
    alert(`Viewing details for: ${event.title}`);
  };

  const handleNewEvent = () => {
    navigate('/admin/events/create');
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsAPI.getAll();

        // ✅ Sort by createdAt (newest first)
      const sortedEvents = (response.data || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

        setEvents(sortedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        alert('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Create, edit, and manage your community events</p>
          </div>
          <button 
            onClick={handleNewEvent}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Event</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id || event.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-1/3 h-48 overflow-hidden bg-gray-900">
                    <img
                      src={getEventImageUrl(event.image)}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(event.status || 'upcoming')}`}>
                        {event.status || 'upcoming'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-5 sm:p-6">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                        {event.type || 'Event'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-1.5 mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-2 text-blue-500 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at {event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-blue-500 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-2 text-blue-500 shrink-0" />
                        <span>{event.attendees || event.currentAttendees || 0}/{event.maxAttendees || 100} attendees</span>
                      </div>
                    </div>

                    {/* Progress bar for attendees */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Capacity</span>
                        <span>{Math.min(100, Math.round(((event.attendees || event.currentAttendees || 0) / (event.maxAttendees || 100)) * 100))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.round(((event.attendees || event.currentAttendees || 0) / (event.maxAttendees || 100)) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleViewDetails(event)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <CalendarIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Events Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {events.filter(e => e.status === 'Upcoming').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {events.filter(e => e.status === 'Completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {events.reduce((sum, event) => sum + event.attendees, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(events.reduce((sum, event) => sum + (event.attendees / event.maxAttendees * 100), 0) / (events.length || 1))}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Capacity</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteEvent}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </AdminLayout>
  );
}