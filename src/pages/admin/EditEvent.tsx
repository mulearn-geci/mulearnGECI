import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Tag, Link as LinkIcon, FileText, Award } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { eventsAPI } from '../../services/api';
import { getEventImageUrl } from '../../utils/imageUtils';
import { MultiImageUploader } from '../../components/MultiImageUploader';

interface EditEventFormData {
  title: string;
  description: string;
  content?: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  type: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  status: string;
  featured: boolean;
  registrationLink?: string;
  registrationDeadline?: string;
}

export function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditEventFormData>();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await eventsAPI.getById(id);
        const event = response.data;
        setCurrentEvent(event);
        
        setValue('title', event.title || '');
        setValue('description', event.description || '');
        setValue('content', event.content || '');
        if (event.date) {
          setValue('date', new Date(event.date).toISOString().split('T')[0]);
        }
        setValue('time', event.time || '');
        setValue('endTime', event.endTime || '');
        setValue('location', event.location || '');
        setValue('type', event.type || 'workshop');
        setValue('category', event.category || 'technical');
        setValue('attendees', event.attendees || event.currentAttendees || 0);
        setValue('maxAttendees', event.maxAttendees || 100);
        setValue('status', event.status || 'upcoming');
        setValue('featured', event.featured === true);
        setValue('registrationLink', event.registrationLink || '');
        if (event.registrationDeadline) {
          setValue('registrationDeadline', new Date(event.registrationDeadline).toISOString().split('T')[0]);
        }
        
        if (event.images && Array.isArray(event.images) && event.images.length > 0) {
          setImages(event.images.map((img: string) => getEventImageUrl(img)));
        } else if (event.image) {
          setImages([getEventImageUrl(event.image)]);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
        alert('Failed to load event details');
        navigate('/admin/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, setValue, navigate]);

  const onSubmit = async (data: EditEventFormData) => {
    if (!id) return;

    if (images.length === 0) {
      alert('Please upload at least one image for the event');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        content: data.content ? data.content.trim() : (currentEvent?.content || ''),
        date: data.date,
        time: data.time.trim(),
        endTime: data.endTime ? data.endTime.trim() : '',
        location: data.location.trim(),
        type: data.type || currentEvent?.type || 'workshop',
        category: data.category || currentEvent?.category || 'technical',
        attendees: !isNaN(Number(data.attendees)) ? Number(data.attendees) : 0,
        currentAttendees: !isNaN(Number(data.attendees)) ? Number(data.attendees) : 0,
        maxAttendees: data.maxAttendees ? Number(data.maxAttendees) : (currentEvent?.maxAttendees || 100),
        status: data.status || currentEvent?.status || 'upcoming',
        featured: data.featured === true,
        registrationLink: data.registrationLink ? data.registrationLink.trim() : '',
        registrationDeadline: data.registrationDeadline || undefined,
        image: images.length > 0 ? images[0] : (currentEvent?.image || ''),
        images: images
      };

      await eventsAPI.update(id, payload);
      alert('Event updated successfully!');
      navigate('/admin/events');
    } catch (error: any) {
      console.error('Update event error:', error);
      alert(error.message || 'Failed to update event. Please check the fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/events')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Event</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Update event schedule, venue, attendees, registration, or banner</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. Event Images (Multiple) */}
            <MultiImageUploader
              images={images}
              onChange={setImages}
              maxImages={10}
              label="Event Images & Banner Posters"
              helperText="Upload or update event posters, photos, and highlights. The first image will be used as the primary cover banner."
            />

            {/* 2. Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Event title is required' })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* 3. Short Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Short Description / Overview *
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description', { required: 'Description is required' })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Key highlights and overview shown on the event card..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* 4. Date & Timing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Event Date *</span>
                </label>
                <input
                  type="date"
                  id="date"
                  {...register('date', { required: 'Date is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Start Time *</span>
                </label>
                <input
                  type="text"
                  id="time"
                  {...register('time', { required: 'Time is required' })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., 10:00 AM"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>End Time (Optional)</span>
                </label>
                <input
                  type="text"
                  id="endTime"
                  {...register('endTime')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., 01:00 PM"
                />
              </div>
            </div>

            {/* 5. Location & Venue */}
            <div>
              <label htmlFor="location" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Location / Venue *</span>
              </label>
              <input
                type="text"
                id="location"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="e.g., Seminar Hall 1, Main Block / Google Meet"
              />
            </div>

            {/* 6. Event Classification (Type & Category) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <span>Event Type *</span>
                </label>
                <select
                  id="type"
                  {...register('type')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors cursor-pointer"
                >
                  <option value="workshop">Workshop</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="seminar">Seminar</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="competition">Competition</option>
                  <option value="meetup">Meetup</option>
                  <option value="conference">Conference</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>Category</span>
                </label>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors cursor-pointer"
                >
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="career">Career</option>
                  <option value="academic">Academic</option>
                  <option value="social">Social</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
            </div>

            {/* 7. Attendees & Capacity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="attendees" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Current Attendees / Registered</span>
                </label>
                <input
                  type="number"
                  min="0"
                  id="attendees"
                  {...register('attendees')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., 45"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Displayed as '{'{attendees}'} attendees' on the website card</p>
              </div>

              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>Maximum Capacity / Total Seats</span>
                </label>
                <input
                  type="number"
                  min="1"
                  id="maxAttendees"
                  {...register('maxAttendees')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            {/* 8. Registration Links & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="registrationLink" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span>Registration URL (Optional)</span>
                </label>
                <input
                  type="url"
                  id="registrationLink"
                  {...register('registrationLink')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="https://forms.gle/... or https://..."
                />
              </div>

              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Registration Deadline (Optional)</span>
                </label>
                <input
                  type="date"
                  id="registrationDeadline"
                  {...register('registrationDeadline')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* 9. Detailed Content (Optional) */}
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Full Story / Agenda / Prerequisites (Optional)</span>
              </label>
              <textarea
                id="content"
                rows={4}
                {...register('content')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="Detailed schedule, prerequisites, speakers, and instructions..."
              />
            </div>

            {/* 10. Status & Featured Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              <div>
                <label htmlFor="status" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Event Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors cursor-pointer"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed / Past</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-700 cursor-pointer"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer">
                  Mark as Featured Event
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/events')}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Event...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
