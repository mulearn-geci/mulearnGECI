import React, { useState, useRef } from 'react';
import { Upload, X, Star, Plus, Loader2, Image as ImageIcon } from 'lucide-react';

export const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
  error?: string;
}

export function MultiImageUploader({
  images,
  onChange,
  maxImages = 10,
  label = 'Event & Gallery Images',
  helperText = 'Select one or more images. The first image will be used as the primary cover banner.',
  error
}: MultiImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum of ${maxImages} images allowed.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) can be added (maximum ${maxImages}).`);
    }

    setIsProcessing(true);
    const newCompressed: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      setProcessingProgress(`Processing ${i + 1} of ${filesToProcess.length}...`);
      try {
        const compressed = await compressImageFile(filesToProcess[i]);
        newCompressed.push(compressed);
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    setIsProcessing(false);
    setProcessingProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (newCompressed.length > 0) {
      onChange([...images, ...newCompressed]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const setAsCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const target = images[indexToCover];
    const filtered = images.filter((_, idx) => idx !== indexToCover);
    onChange([target, ...filtered]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          {label} <span className="text-red-500">*</span>
        </label>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          {images.length} / {maxImages} {images.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {helperText}
      </p>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        className="hidden"
        id="multi-image-file-input"
        disabled={isProcessing || images.length >= maxImages}
      />

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {processingProgress || 'Compressing images...'}
          </span>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {images.map((imgSrc, index) => {
            const isCover = index === 0;
            return (
              <div
                key={index}
                className={`group relative rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-gray-100 dark:bg-gray-800 border-2 transition-all duration-200 ${
                  isCover
                    ? 'border-blue-600 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <img
                  src={imgSrc}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover badge */}
                {isCover ? (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Cover</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAsCover(index)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow z-10 flex items-center gap-1 backdrop-blur-sm"
                    title="Set as primary cover image"
                  >
                    <Star className="w-3 h-3" />
                    <span>Set Cover</span>
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow transition-all duration-150 z-10"
                  title="Remove this photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Image number tag */}
                <div className="absolute bottom-1.5 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  #{index + 1}
                </div>
              </div>
            );
          })}

          {/* Add more button tile if slots remain */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center aspect-video sm:aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-4"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-1 group-hover:bg-blue-100">
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="text-xs font-semibold">Add Photos</span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                {maxImages - images.length} left
              </span>
            </button>
          )}
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
            Click to upload one or multiple photos
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-3">
            Supports PNG, JPG, WebP. Multiple files can be selected at once. Photos will be automatically optimized.
          </p>
          <span className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">
            <ImageIcon className="w-4 h-4" />
            <span>Select Photos from Computer</span>
          </span>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
