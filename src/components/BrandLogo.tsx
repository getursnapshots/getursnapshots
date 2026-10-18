import React, { useRef, useState } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { useLogo } from '../context/LogoContext';
import logoPng from '../assets/logo.png';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  variant?: 'header' | 'footer' | 'default';
  allowUpload?: boolean;
  lightBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  imageClassName = '',
  variant = 'header',
  allowUpload = true,
  lightBackground = false,
}) => {
  const { customLogoUrl, hasCustomLogo, saveCustomLogo, removeCustomLogo } = useLogo();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const isHeader = variant === 'header';
  const defaultLogo = logoPng || '/assets/logo.png';
  const displayLogoUrl = customLogoUrl || defaultLogo;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        saveCustomLogo(dataUrl);
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTriggerUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    removeCustomLogo();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Hidden file picker input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/svg+xml, image/webp, image/gif"
        className="hidden"
        aria-label="Upload logo image"
      />

      <div className="relative group inline-flex items-center justify-start shrink-0">
        <img
          src={displayLogoUrl}
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.src.endsWith('/assets/logo.png')) {
              el.src = '/assets/logo.png';
            } else if (!el.src.endsWith('/logo.png')) {
              el.src = '/logo.png';
            }
          }}
          alt="Snap Shots"
          width={variant === 'footer' ? 260 : 160}
          height={variant === 'footer' ? 58 : 36}
          style={{
            aspectRatio: '1382/310',
            minWidth: variant === 'footer' ? '180px' : '120px',
          }}
          loading="eager"
          decoding="sync"
          className={`${
            variant === 'footer'
              ? 'h-12 sm:h-14 md:h-16 max-h-[64px]'
              : 'h-8 sm:h-9 md:h-10 max-h-[44px]'
          } w-auto object-contain object-left block transition-all duration-200 ${
            lightBackground ? '' : 'filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]'
          } ${imageClassName}`}
        />

        {/* Change / Upload Button overlay on hover (Header) */}
        {allowUpload && isHeader && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700 shadow-xl">
              <button
                type="button"
                onClick={handleTriggerUpload}
                title="Click to choose a new image file"
                className="flex items-center gap-1 text-[10px] font-bold text-white hover:text-[#ffc800] transition-colors cursor-pointer"
              >
                <Camera className="w-3 h-3 text-[#bd1616]" />
                <span>Change Image</span>
              </button>

              {hasCustomLogo && (
                <>
                  <span className="text-zinc-600 text-xs">|</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset to default brand logo"
                    className="p-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success indicator toast */}
      {justUpdated && (
        <div className="absolute -bottom-8 left-0 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/95 border border-emerald-600/80 text-emerald-300 text-[10px] font-bold shadow-xl animate-in fade-in duration-200 whitespace-nowrap">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>Image updated!</span>
        </div>
      )}
    </div>
  );
};
