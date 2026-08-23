import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, Calendar, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { postsAPI } from '../../services/api';
import { getPostImageUrl } from '../../utils/imageUtils';

interface EditPostFormData {
  title: string;
  description: string;
  category: string;
  eventDate: string;
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

const POPULAR_CATEGORIES = [
  'Event',
  'Orientation',
  'Workshop',
  'Hackathon',
  'Campus Life',
  'Showcase'
];

export function EditPost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditPostFormData>();
  const currentCategory = watch('category');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await postsAPI.getById(id);
        const post = response.data;
        setCurrentPost(post);
        
        setValue('title', post.title || '');
        setValue('description', post.description || post.content || '');
        setValue('category', post.category || 'Event');
        if (post.eventDate) {
          setValue('eventDate', new Date(post.eventDate).toISOString().split('T')[0]);
        } else if (post.createdAt) {
          setValue('eventDate', new Date(post.createdAt).toISOString().split('T')[0]);
        }
        
        if (post.image) {
          setImagePreview(getPostImageUrl(post.image));
        }
      } catch (error) {
        console.error('Failed to fetch gallery item:', error);
        alert('Failed to load gallery item');
        navigate('/admin/gallery');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
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

  const onSubmit = async (data: EditPostFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      let finalImageDataUrl = imagePreview;
      if (selectedImage) {
        finalImageDataUrl = await compressImageFile(selectedImage);
      }

      const payload = {
        title: data.title.trim(),
        description: data.description ? data.description.trim() : '',
        content: data.description ? data.description.trim() : '',
        category: data.category || 'Event',
        eventDate: data.eventDate || new Date().toISOString(),
        status: 'published',
        image: finalImageDataUrl || currentPost?.image,
        removeImage: !imagePreview ? 'true' : 'false'
      };

      await postsAPI.update(id, payload);
      alert('Gallery item updated successfully!');
      navigate('/admin/gallery');
    } catch (error: any) {
      console.error('Update gallery item error:', error);
      alert(error.message || 'Failed to update gallery item. Please try again.');
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
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/gallery')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Gallery Item</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Update photo, caption, date, and description</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. Photo */}
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Gallery Photo
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
                    <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1">Click to upload new photo</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">PNG, JPG, JPEG from camera or phone</p>
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
                      Choose New Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Caption / Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Title / Caption *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Please enter a title or caption' })}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="e.g., Preface 2.0 Orientation"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* 3. Date & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  id="eventDate"
                  {...register('eventDate')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Category</span>
                </label>
                <input
                  type="text"
                  id="category"
                  {...register('category')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                  placeholder="e.g., Event, Workshop, Hackathon"
                />
              </div>
            </div>

            {/* Category quick pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Quick pick:</span>
              {POPULAR_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    currentCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 4. Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
                placeholder="Add a brief description or notes about this moment..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/gallery')}
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
                    <span>Saving...</span>
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
