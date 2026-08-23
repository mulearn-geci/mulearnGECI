import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { postsAPI } from '../../services/api';
import { getPostImageUrl } from '../../utils/imageUtils';

export function AdminPosts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditPost = (post: any) => {
    navigate(`/admin/gallery/edit/${post._id}`);
  };

  const handleDeletePost = (post: any) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (selectedPost) {
      try {
        await postsAPI.delete(selectedPost._id);
        setPosts(posts.filter(post => post._id !== selectedPost._id));
        alert(`Gallery item "${selectedPost.title}" deleted successfully!`);
      } catch (error) {
        console.error('Failed to delete gallery item:', error);
        alert('Failed to delete gallery item');
      } finally {
        setShowDeleteModal(false);
        setSelectedPost(null);
      }
    }
  };

  const handleViewDetails = (post: any) => {
    console.log('View gallery details:', post);
    alert(`Viewing details for: ${post.title}`);
  };

  const handleNewPost = () => {
    navigate('/admin/gallery/create');
  };

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await postsAPI.getAll();

      // ✅ Sort posts by createdAt (newest first)
      const sortedPosts = (response.data || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
        setPosts(sortedPosts);
      } catch (error) {
        console.error('Failed to fetch gallery items:', error);
        alert('Failed to load gallery items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Upload, edit, and manage photos and event showcases displayed on the public Gallery page</p>
          </div>
          <button 
            onClick={handleNewPost}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span>Add to Gallery</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gallery items..."
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading gallery items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-gray-900">
                  {post.image && (
                    <img
                      src={getPostImageUrl(post.image)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
                        {post.category || 'Event'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {post.eventDate ? new Date(post.eventDate).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    {post.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mb-4">
                        {post.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer"
                        title="Edit gallery item"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors cursor-pointer"
                        title="Delete gallery item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No gallery items found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gallery Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {posts.filter(p => p.status?.toLowerCase() === 'published').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {posts.filter(p => p.status?.toLowerCase() === 'draft').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {posts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {posts.filter(p => p.image).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">With Photos</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeletePost}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedPost?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </AdminLayout>
  );
}