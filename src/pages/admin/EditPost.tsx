import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { postsAPI } from '../../services/api';
import { getPostImageUrl } from '../../utils/imageUtils';
import { MultiImageUploader } from '../../components/MultiImageUploader';

interface EditPostFormData {
  title: string;
  description: string;
  category: string;
  eventDate: string;
}

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
  const [images, setImages] = useState<string[]>([]);
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
        
        if (post.images && Array.isArray(post.images) && post.images.length > 0) {
          setImages(post.images.map((img: string) => getPostImageUrl(img)));
        } else if (post.image) {
          setImages([getPostImageUrl(post.image)]);
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

  const onSubmit = async (data: EditPostFormData) => {
    if (!id) return;

    if (images.length === 0) {
      alert('Please upload at least one photo for the gallery');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description ? data.description.trim() : '',
        content: data.description ? data.description.trim() : '',
        category: data.category || 'Event',
        eventDate: data.eventDate || new Date().toISOString(),
        status: 'published',
        image: images.length > 0 ? images[0] : (currentPost?.image || ''),
        images: images,
        removeImage: images.length === 0 ? 'true' : 'false'
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
            
            {/* 1. Photos Upload (Multiple) */}
            <MultiImageUploader
              images={images}
              onChange={setImages}
              maxImages={10}
              label="Gallery Photos"
              helperText="Upload or update photos for this gallery post. The first image will be shown on the gallery grid card."
            />

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
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/admin/gallery')}
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
