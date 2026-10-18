import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  Video,
  Film,
  Instagram,
  CheckCircle2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { ReelWorkItem } from '../types';
import {
  getDefaultPosterForCategory,
  isValidInstagramUrl,
  extractInstagramId,
  getCleanInstagramUrl,
} from '../utils/instagram';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: ReelWorkItem[];
  targetIndex: number;
  onApplyToSlide: (
    slideIndex: number,
    videoUrl: string,
    posterUrl?: string,
    file?: File
  ) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  reels,
  targetIndex,
  onApplyToSlide,
}) => {
  const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(targetIndex);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('');
  const [generatedPoster, setGeneratedPoster] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Extract a high-quality frame from the uploaded video file to use as vertical poster
  const extractPosterFrame = (fileOrBlobUrl: string) => {
    setIsProcessing(true);
    const video = document.createElement('video');
    video.src = fileOrBlobUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setGeneratedPoster(dataUrl);
        }
      } catch (e) {
        console.warn('Could not extract video frame poster:', e);
        setGeneratedPoster(getDefaultPosterForCategory('Wedding'));
      } finally {
        setIsProcessing(false);
      }
    };

    video.onerror = () => {
      setIsProcessing(false);
      setGeneratedPoster(getDefaultPosterForCategory('Wedding'));
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (.mp4, .webm, .mov)');
      return;
    }

    setVideoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewVideoUrl(blobUrl);
    extractPosterFrame(blobUrl);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const val = e.target.value;
    setVideoUrlInput(val);
    if (val.trim() && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'))) {
      setPreviewVideoUrl(val.trim());
      extractPosterFrame(val.trim());
    } else {
      setPreviewVideoUrl('');
      setGeneratedPoster('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const effectiveVideo =
      sourceType === 'file' ? previewVideoUrl : videoUrlInput.trim();

    if (!effectiveVideo) {
      setError(
        sourceType === 'file'
          ? 'Please choose a video file (.mp4, .mov, etc.) to upload.'
          : 'Please enter a valid video URL.'
      );
      return;
    }

    // Strictly apply ONLY to the selected slide index
    onApplyToSlide(
      selectedSlideIndex,
      effectiveVideo,
      generatedPoster,
      videoFile || undefined
    );
    onClose();
  };

  const currentReel = reels[selectedSlideIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-video-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 flex items-center justify-center text-[#bd1616]">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 id="upload-video-title" className="text-base font-black text-white">
                Upload for Slide #{selectedSlideIndex + 1} Only
              </h2>
              <p className="text-xs text-zinc-400">
                Uploads into this exact slide without affecting any other slides
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Target Slide Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Target Slide (Will replace only this slide):
            </label>
            <select
              value={selectedSlideIndex}
              onChange={(e) => setSelectedSlideIndex(Number(e.target.value))}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#bd1616]"
            >
              {reels.map((r, i) => (
                <option key={r.id || i} value={i}>
                  Slide #{i + 1}: {r.title}
                </option>
              ))}
            </select>
            {currentReel && (
              <p className="text-[11px] text-zinc-400 mt-1">
                Currently targeting: <strong className="text-white">Slide #{selectedSlideIndex + 1}</strong> ({currentReel.title})
              </p>
            )}
          </div>

          {/* Source Tabs: File Upload vs Direct URL */}
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setSourceType('file');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sourceType === 'file'
                  ? 'bg-[#bd1616] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Upload Local File (.mp4)
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceType('url');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                sourceType === 'url'
                  ? 'bg-[#bd1616] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Video URL / Instagram</span>
            </button>
          </div>

          {/* File Picker View */}
          {sourceType === 'file' ? (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-[#bd1616] bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl p-6 text-center transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-[#bd1616]/20 border border-zinc-700 group-hover:border-[#bd1616]/40 flex items-center justify-center text-zinc-300 group-hover:text-[#bd1616] mx-auto mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white mb-1">
                  {videoFile ? videoFile.name : 'Click to select your video file'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {videoFile
                    ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB selected • Click to change`
                    : 'Supports MP4, MOV, WEBM (9:16 vertical recommended)'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                💡 <strong className="text-zinc-200">How to upload your own videos:</strong> Place your MP4 files directly into the <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded">public/videos/</code> folder named <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded">reel-1.mp4</code>, <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded">reel-2.mp4</code> ... up to <code className="text-zinc-200 bg-black/60 px-1 py-0.5 rounded">reel-10.mp4</code>. Once placed, push to GitHub for live Vercel deployment!
              </div>
            </div>
          ) : (
            /* Direct Video or Instagram URL View */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Instagram Reel Link or Direct Video Stream URL (.mp4)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={handleUrlChange}
                  placeholder="https://www.instagram.com/reel/... or https://example.com/video.mp4"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#bd1616] pr-9"
                />
                {isValidInstagramUrl(videoUrlInput) && (
                  <Instagram className="w-4 h-4 text-pink-400 absolute right-3 top-3 pointer-events-none" />
                )}
              </div>

              {isValidInstagramUrl(videoUrlInput) ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Instagram Reel detected (ID: <code className="font-mono text-emerald-200 font-bold">{extractInstagramId(videoUrlInput)}</code>). Will embed officially into Slide #{selectedSlideIndex + 1}!
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  ✨ <span className="text-zinc-300 font-medium">Instant live website sync:</span> Paste an Instagram Reel link or direct MP4 URL (Cloudinary, AWS S3, Google Drive, Catbox). It syncs across all live website visitors instantly via Firebase!
                </p>
              )}
            </div>
          )}

          {/* Live Preview Box */}
          {previewVideoUrl && (
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3.5 flex items-center gap-3">
              <div className="relative w-16 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-700 flex items-center justify-center">
                {isValidInstagramUrl(previewVideoUrl) ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-pink-900/50 to-black flex flex-col items-center justify-center p-1 text-center">
                    <Instagram className="w-6 h-6 text-pink-400 mb-1" />
                    <span className="text-[9px] font-bold text-white">IG REEL</span>
                  </div>
                ) : (
                  <video
                    src={previewVideoUrl}
                    playsInline
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#bd1616] block mb-0.5">
                  {isValidInstagramUrl(previewVideoUrl) ? 'Instagram Reel Linked' : 'Ready to Apply'}
                </span>
                <p className="text-xs font-bold text-white truncate">
                  {videoFile ? videoFile.name : isValidInstagramUrl(previewVideoUrl) ? `Reel @${extractInstagramId(previewVideoUrl)}` : 'Custom Video Source'}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Will apply ONLY to Slide #{selectedSlideIndex + 1}.
                </p>
              </div>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#bd1616]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer border border-[#9e1212]"
            >
              <Film className="w-3.5 h-3.5 text-white" />
              <span>
                {isProcessing
                  ? 'Saving...'
                  : `Save Video to Slide #${selectedSlideIndex + 1}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
