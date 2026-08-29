import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Calendar, Clock, MapPin, Users, Tag, Link as LinkIcon, FileText, Sparkles, Award } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { eventsAPI } from '../../services/api';
import { getEventImageUrl } from '../../utils/imageUtils';

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

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export function EditEvent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditEventFormData>();

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
        
        if (event.image) {
          setImagePreview(getEventImageUrl(event.image));
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

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      try {
        const compressed = await compressImageFile(file);
        setImagePreview(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: EditEventFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      let finalImageDataUrl = imagePreview;
      if (selectedImage) {
        finalImageDataUrl = await compressImageFile(selectedImage);
      }

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
        image: finalImageDataUrl || currentEvent?.image
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
            
            {/* 1. Event Banner Image */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Event Banner Image
              </label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-gray-900">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-80 object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center space-x-1.5 border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ready to save</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-900/50">
                    <Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">Click to upload new banner</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">PNG, JPG, JPEG from camera or computer</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="event-image-upload"
                    />
                    <label
                      htmlFor="event-image-upload"
                      className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md transition-all"
                    >
                      Choose New Image
                    </label>
                  </div>
                )}
              </div>
            </div>

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
