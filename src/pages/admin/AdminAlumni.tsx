import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Upload, Link as LinkIcon, X, Loader2, GripVertical, Check } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { alumniAPI } from '../../services/api';
import { getImageUrl, formatGoogleDriveUrl, compressImageFile } from '../../utils/imageUtils';

interface AlumniMember {
  _id: string;
  name: string;
  pastRole: string;
  graduationYear: string;
  currentCompany?: string;
  currentRole?: string;
  domain?: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  instagram?: string;
  order?: number;
}

export function AdminAlumni() {
  const [alumni, setAlumni] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<AlumniMember | null>(null);

  // Image Upload Type: 'file' or 'url'
  const [imageSourceType, setImageSourceType] = useState<'file' | 'url'>('file');
  const [driveUrl, setDriveUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    pastRole: '',
    graduationYear: new Date().getFullYear().toString(),
    currentCompany: '',
    currentRole: '',
    domain: '',
    bio: '',
    linkedin: '',
    github: '',
    email: '',
    instagram: '',
    order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<AlumniMember | null>(null);

  // Drag and Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const res = await alumniAPI.getAll();
      if (res.success && res.data) {
        setAlumni(res.data);
      }
    } catch (err) {
      console.error('Error loading alumni members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      pastRole: '',
      graduationYear: new Date().getFullYear().toString(),
      currentCompany: '',
      currentRole: '',
      domain: '',
      bio: '',
      linkedin: '',
      github: '',
      email: '',
      instagram: '',
      order: alumni.length + 1
    });
    setImageSourceType('file');
    setSelectedFile(null);
    setDriveUrl('');
    setImagePreview('');
    setShowModal(true);
  };

  const handleOpenEditModal = (member: AlumniMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      pastRole: member.pastRole || '',
      graduationYear: member.graduationYear || '',
      currentCompany: member.currentCompany || '',
      currentRole: member.currentRole || '',
      domain: member.domain || '',
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
      data.append('pastRole', formData.pastRole);
      data.append('graduationYear', formData.graduationYear);
      data.append('currentCompany', formData.currentCompany);
      data.append('currentRole', formData.currentRole);
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
        await alumniAPI.update(editingMember._id, data);
        alert('Alumni member updated successfully!');
      } else {
        await alumniAPI.create(data);
        alert('Alumni member created successfully!');
      }

      setShowModal(false);
      fetchAlumni();
    } catch (err: any) {
      console.error('Failed to save alumni member:', err);
      alert(err?.message || 'Failed to save alumni member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (member: AlumniMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await alumniAPI.delete(memberToDelete._id);
      setAlumni(alumni.filter(m => m._id !== memberToDelete._id));
      alert(`Deleted ${memberToDelete.name} successfully!`);
    } catch (err) {
      console.error('Failed to delete alumni member:', err);
      alert('Failed to delete member');
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  // Drag and Drop Handlers
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

    const currentList = [...alumni];
    const draggedIdx = currentList.findIndex((m) => m._id === draggedId);
    const targetIdx = currentList.findIndex((m) => m._id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const [movedItem] = currentList.splice(draggedIdx, 1);
    currentList.splice(targetIdx, 0, movedItem);

    const reorderedList = currentList.map((m, index) => ({
      ...m,
      order: index + 1
    }));

    setAlumni(reorderedList);
    setDraggedId(null);
    setDragOverId(null);

    try {
      setIsSavingOrder(true);
      const ordersPayload = reorderedList.map((m) => ({
        id: m._id,
        order: m.order || 0
      }));
      await alumniAPI.reorder(ordersPayload);
      setOrderToast('Order updated successfully!');
      setTimeout(() => setOrderToast(null), 3000);
    } catch (err: any) {
      console.error('Failed to save reordered alumni list:', err);
      alert(err?.message || 'Failed to update order');
      fetchAlumni();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const filteredAlumni = alumni.filter(m => {
    const matchesYear = yearFilter === 'all' || m.graduationYear === yearFilter;
    const search = searchTerm.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(search) ||
                          m.pastRole.toLowerCase().includes(search) ||
                          (m.currentCompany && m.currentCompany.toLowerCase().includes(search)) ||
                          (m.currentRole && m.currentRole.toLowerCase().includes(search));
    return matchesYear && matchesSearch;
  });

  const uniqueYears = Array.from(new Set(alumni.map(a => a.graduationYear).filter(Boolean))).sort((a, b) => b.localeCompare(a));

  return (
    <AdminLayout title="Alumni Network Management">
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 max-w-xl w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search alumni by name, role, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Batch Filter */}
            <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg text-sm">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-transparent text-gray-800 dark:text-white text-xs font-medium focus:outline-none px-2 py-1"
              >
                <option value="all" className="dark:bg-gray-800">All Batches</option>
                {uniqueYears.map((yr) => (
                  <option key={yr} value={yr} className="dark:bg-gray-800">Batch {yr}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Add Alumni Member</span>
          </button>
        </div>

        {/* Drag Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2.5 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800">
          <span>💡 <strong>Tip:</strong> Drag any alumni using the <strong className="inline-flex items-center gap-0.5"><GripVertical className="h-3.5 w-3.5 inline" /> grip handle</strong> to reorder them on the website.</span>
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

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No alumni entries found for this filter.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="w-10 px-3 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Alumni Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Past µLearn Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Role / Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAlumni.map((member, index) => {
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
                            <div className="text-xs text-gray-500 dark:text-gray-400">{member.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          {member.pastRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                        Batch of {member.graduationYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {member.currentRole || 'Professional'}
                        {member.currentCompany && <span className="text-blue-600 dark:text-blue-400 block text-xs">@ {member.currentCompany}</span>}
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
                {editingMember ? 'Edit Alumni Member' : 'Add Alumni Member'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Input Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo
                  </label>

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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Past µLearn Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Former Campus Lead (2023-24)"
                      value={formData.pastRole}
                      onChange={(e) => setFormData({ ...formData, pastRole: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Role / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={formData.currentRole}
                      onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company / Org</label>
                    <input
                      type="text"
                      placeholder="e.g. Google / Microsoft"
                      value={formData.currentCompany}
                      onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain / Field</label>
                  <input
                    type="text"
                    placeholder="e.g. Web Dev, AI/ML, Cloud & DevOps"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. member@alumni.gecidukki.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio / Message</label>
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
                      placeholder="linkedin.com/in/username"
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
                    <span>{editingMember ? 'Update Alumni' : 'Create Alumni'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Alumni Member"
          message={`Are you sure you want to remove ${memberToDelete?.name} from the Alumni Directory?`}
        />
      </div>
    </AdminLayout>
  );
}
export default AdminAlumni;
