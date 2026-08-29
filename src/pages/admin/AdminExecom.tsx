import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Upload, Link as LinkIcon, X, Loader2, GripVertical, Check } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { execomAPI } from '../../services/api';
import { getImageUrl, formatGoogleDriveUrl, compressImageFile } from '../../utils/imageUtils';

interface ExecomMember {
  _id: string;
  name: string;
  position: string;
  category?: 'execom' | 'ig_lead';
  domain?: string;
  phone?: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  email?: string;
  github?: string;
  instagram?: string;
  order?: number;
}

export function AdminExecom() {
  const [members, setMembers] = useState<ExecomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'execom' | 'ig_lead'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<ExecomMember | null>(null);
  
  // Image Upload Type: 'file' (local upload) or 'url' (Google Drive / Web URL)
  const [imageSourceType, setImageSourceType] = useState<'file' | 'url'>('file');
  const [driveUrl, setDriveUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    category: 'execom' as 'execom' | 'ig_lead',
    domain: '',
    phone: '',
    bio: '',
    linkedin: '',
    email: '',
    github: '',
    instagram: '',
    order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<ExecomMember | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await execomAPI.getAll();
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error('Error loading Execom members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      position: '',
      category: 'execom',
      domain: '',
      phone: '',
      bio: '',
      linkedin: '',
      email: '',
      github: '',
      instagram: '',
      order: members.length + 1
    });
    setImageSourceType('file');
    setSelectedFile(null);
    setDriveUrl('');
    setImagePreview('');
    setShowModal(true);
  };

  const handleOpenEditModal = (member: ExecomMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      position: member.position || '',
      category: member.category || 'execom',
      domain: member.domain || '',
      phone: member.phone || '',
      bio: member.bio || '',
      linkedin: member.linkedin || '',
      email: member.email || '',
      github: member.github || '',
      instagram: member.instagram || '',
      order: member.order || 0
    });
    
    setSelectedFile(null);
    if (member.image && (member.image.startsWith('http') || member.image.includes('drive.google.com'))) {
      setImageSourceType('url');
      setDriveUrl(member.image);
      setImagePreview(getImageUrl(member.image));
    } else {
      setImageSourceType('file');
      setDriveUrl('');
      setImagePreview(member.image ? getImageUrl(member.image) : '');
    }
    
    setShowModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        const compressed = await compressImageFile(originalFile);
        setSelectedFile(compressed);
        setImagePreview(URL.createObjectURL(compressed));
      } catch (err) {
        setSelectedFile(originalFile);
        setImagePreview(URL.createObjectURL(originalFile));
      }
    }
  };

  const handleDriveUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setDriveUrl(url);
    if (url.trim()) {
      setImagePreview(formatGoogleDriveUrl(url));
    } else {
      setImagePreview('');
    }
  };

  const ensureProtocol = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed === '#') return trimmed;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('position', formData.position);
      data.append('category', formData.category);
      data.append('domain', formData.domain);
      data.append('bio', formData.bio);
      data.append('linkedin', ensureProtocol(formData.linkedin));
      data.append('email', formData.email);
      data.append('github', ensureProtocol(formData.github));
      data.append('instagram', ensureProtocol(formData.instagram));
      data.append('order', formData.order.toString());

      if (selectedFile) {
        data.append('image', selectedFile);
      } else if (driveUrl.trim()) {
        data.append('image', formatGoogleDriveUrl(ensureProtocol(driveUrl)));
      }

      if (editingMember) {
        await execomAPI.update(editingMember._id, data);
        alert('Member updated successfully!');
      } else {
        await execomAPI.create(data);
        alert('Member created successfully!');
      }

      setShowModal(false);
      fetchMembers();
    } catch (err: any) {
      console.error('Failed to save member:', err);
      alert(err?.message || 'Failed to save member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (member: ExecomMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await execomAPI.delete(memberToDelete._id);
      setMembers(members.filter(m => m._id !== memberToDelete._id));
      alert(`Deleted ${memberToDelete.name} successfully!`);
    } catch (err) {
      console.error('Failed to delete member:', err);
      alert('Failed to delete member');
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentMembers = [...members];
    const draggedIdx = currentMembers.findIndex((m) => m._id === draggedId);
    const targetIdx = currentMembers.findIndex((m) => m._id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Move dragged member to new index position
    const [movedMember] = currentMembers.splice(draggedIdx, 1);
    currentMembers.splice(targetIdx, 0, movedMember);

    // Re-assign order (1-indexed based on new array order)
    const reorderedList = currentMembers.map((m, index) => ({
      ...m,
      order: index + 1
    }));

    // Update state immediately for responsive drag UI
    setMembers(reorderedList);
    setDraggedId(null);
    setDragOverId(null);

    // Send updated order to backend
    try {
      setIsSavingOrder(true);
      const ordersPayload = reorderedList.map((m) => ({
        id: m._id,
        order: m.order || 0
      }));
      await execomAPI.reorder(ordersPayload);
      setOrderToast('Order updated successfully!');
      setTimeout(() => setOrderToast(null), 3000);
    } catch (err: any) {
      console.error('Failed to save reordered list:', err);
      alert(err?.message || 'Failed to update member order');
      fetchMembers();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const filteredMembers = members.filter(m => {
    const matchesCategory = categoryFilter === 'all' || (m.category || 'execom') === categoryFilter;
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.domain && m.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout title="Execom & IG Leads Management">
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-xl w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, role, domain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg text-sm">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('execom')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  categoryFilter === 'execom'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                Execom
              </button>
              <button
                onClick={() => setCategoryFilter('ig_lead')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  categoryFilter === 'ig_lead'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                IG Leads
              </button>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Add Member / IG Lead</span>
          </button>
        </div>

        {/* Drag Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2.5 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800">
          <span>💡 <strong>Tip:</strong> Drag any member using the <strong className="inline-flex items-center gap-0.5"><GripVertical className="h-3.5 w-3.5 inline" /> grip handle</strong> to reorder them on the website.</span>
          <div className="flex items-center space-x-2">
            {isSavingOrder && (
              <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving order...</span>
              </div>
            )}
            {orderToast && (
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="h-4 w-4" />
                <span>{orderToast}</span>
              </div>
            )}
          </div>
        </div>

        {/* Members Grid / Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No members found for this filter.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="w-10 px-3 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role / Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member, index) => {
                  const isDragging = draggedId === member._id;
                  const isDragOver = dragOverId === member._id;
                  return (
                    <tr
                      key={member._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, member._id)}
                      onDragOver={(e) => handleDragOver(e, member._id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, member._id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-colors duration-150 ${
                        isDragging
                          ? 'opacity-40 bg-blue-100 dark:bg-blue-900/50'
                          : isDragOver
                          ? 'border-t-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <td className="px-3 py-4 whitespace-nowrap text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-200">
                            {member.image ? (
                              <img
                                className="h-10 w-10 object-cover"
                                src={getImageUrl(member.image)}
                                alt={member.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=200`;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center text-gray-500 font-bold">
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.category === 'ig_lead'
                            ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {member.category === 'ig_lead' ? 'IG Lead' : 'Execom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {member.position}
                        {member.domain && <span className="text-xs text-gray-500 dark:text-gray-400 block">{member.domain}</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div>{member.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono font-medium">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Edit / Add Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingMember ? 'Edit Member / Lead' : 'Add Member / Lead'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Member Category *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'execom' })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border text-center transition-colors ${
                        formData.category === 'execom'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Executive Committee
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'ig_lead' })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border text-center transition-colors ${
                        formData.category === 'ig_lead'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Interest Group (IG) Lead
                    </button>
                  </div>
                </div>

                {/* Photo Input Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  
                  {/* Option Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageSourceType('file')}
                      className={`pb-2 px-3 text-sm font-medium flex items-center space-x-1 border-b-2 transition-colors ${
                        imageSourceType === 'file'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('url')}
                      className={`pb-2 px-3 text-sm font-medium flex items-center space-x-1 border-b-2 transition-colors ${
                        imageSourceType === 'url'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Google Drive / Image Link</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=2563eb&color=fff&size=200`;
                        }}
                      />
                    )}

                    {imageSourceType === 'file' ? (
                      <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-200">
                        <Upload className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{selectedFile ? selectedFile.name : 'Choose file...'}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Paste Google Drive share link or image URL..."
                          value={driveUrl}
                          onChange={handleDriveUrlChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position / Role *</label>
                    <input
                      type="text"
                      required
                      placeholder={formData.category === 'ig_lead' ? 'e.g. Cybersecurity IG Lead' : 'e.g. Technical Lead'}
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {formData.category === 'ig_lead' ? 'Interest Group Domain' : 'Domain Tag (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AI/ML, Web Dev, Cybersecurity"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. member@gecidukki.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="www.linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                    <input
                      type="text"
                      placeholder="github.com/username"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      placeholder="instagram.com/username"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{editingMember ? 'Update Member' : 'Create Member'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Member / Lead"
          message={`Are you sure you want to remove ${memberToDelete?.name} from the list?`}
        />
      </div>
    </AdminLayout>
  );
}
