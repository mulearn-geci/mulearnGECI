import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Calendar, MapPin, Tag, Link as LinkIcon, FileText, Sparkles } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { postsAPI } from '../../services/api';

interface CreatePostFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  eventDate: string;
  location: string;
  tags: string;
  registrationLink: string;
}

// Client-side image compression helper to prevent Vercel 4.5MB limit errors
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

export function CreatePost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePostFormData>({
    defaultValues: {
      category: 'Orientation & Event',
      eventDate: new Date().toISOString().split('T')[0],
      location: 'Government Engineering College Idukki',
      tags: 'mulearn, event, campus'
    }
  });

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

  const onSubmit = async (data: CreatePostFormData) => {
    if (!imagePreview && !selectedImage) {
      alert('Please upload an image for the post');
      return;
    }

    setIsSubmitting(true);
    try {
      // Compress image to ensure payload stays well below 4.5MB
      let finalImageDataUrl = imagePreview;
      if (selectedImage && (!finalImageDataUrl || !finalImageDataUrl.startsWith('data:image'))) {
        finalImageDataUrl = await compressImageFile(selectedImage);
      }

      const payload = {
        title: data.title.trim(),
        description: data.description ? data.description.trim() : '',
        content: data.content ? data.content.trim() : '',
        category: data.category || 'event',
        eventDate: data.eventDate || new Date().toISOString(),
        location: data.location ? data.location.trim() : '',
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        registrationLink: data.registrationLink ? data.registrationLink.trim() : '',
        status: 'published',
        image: finalImageDataUrl
      };

      await postsAPI.create(payload);
      alert('Post created successfully!');
      navigate('/admin/posts');
    } catch (error: any) {
      console.error('Create post error:', error);
      alert(error.message || 'Failed to create post. Please check the fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post / Event</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Publish campus events, hackathons, orientations, and gallery highlights</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* 1. Post Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Post Image / Event Banner *
              </label>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-gray-900">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-96 object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white flex items-center space-x-1.5 border border-white/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Optimized & Ready for Upload</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-900/50">
                    <Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">PNG, JPG, JPEG from camera or phone (automatically compressed)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md transition-all"
                    >
                      Choose Image File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Event / Post Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Preface 2.0 Orientation & Level Hunt"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Category / Type
                </label>
                <div className="relative">
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="Orientation & Event">Orientation & Event</option>
                    <option value="Workshop & Bootcamp">Workshop & Bootcamp</option>
                    <option value="Hackathon & Sprint">Hackathon & Sprint</option>
                    <option value="Competition & Quiz">Competition & Quiz</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Community Story">Community Story</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Event Date & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Event Date *</span>
                </label>
                <input
                  type="date"
                  id="eventDate"
                  {...register('eventDate')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Location / Venue</span>
                </label>
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Seminar Hall / Main Auditorium, GECI"
                />
              </div>
            </div>

            {/* 4. Description (Overview) */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Description / Overview *</span>
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="Brief summary of what happened, key takeaways, and highlights..."
              />
            </div>

            {/* 5. Detailed Content (Optional) */}
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Detailed Content / Notes (Optional)
              </label>
              <textarea
                id="content"
                rows={5}
                {...register('content')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="Full recap, agenda, speakers, participating branches, or outcomes..."
              />
            </div>

            {/* 6. Tags & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tags" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <span>Tags (comma separated)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  {...register('tags')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., preface, orientation, mulearn, geckerala"
                />
              </div>

              <div>
                <label htmlFor="registrationLink" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span>Link / Registration URL (Optional)</span>
                </label>
                <input
                  type="url"
                  id="registrationLink"
                  {...register('registrationLink')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/posts')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Compressing & Publishing...</span>
                  </>
                ) : (
                  <span>Publish Post</span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
