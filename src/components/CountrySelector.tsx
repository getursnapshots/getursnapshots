import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCountry } from '../context/CountryContext';
import { AVAILABLE_COUNTRIES, SupportedCountryCode } from '../config/pricingConfig';

interface CountrySelectorProps {
  compact?: boolean;
  className?: string;
  id?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  compact = false,
  className = '',
  id = 'country-selector',
}) => {
  const { country, countryConfig, setCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedCountryCode) => {
    setCountry(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select country and currency. Currently selected: ${countryConfig.countryName} (${countryConfig.currency})`}
        className={`flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-200 hover:text-white hover:border-zinc-700 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-[#bd1616] ${
          compact
            ? 'h-9 px-2.5 text-[11px]'
            : 'h-9 px-3 text-xs'
        }`}
        id={`${id}-btn`}
      >
        <span className="text-sm leading-none">{countryConfig.flag}</span>
        <span className="font-semibold tracking-tight">
          {compact ? countryConfig.shortLabel : countryConfig.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-24px)] rounded-2xl bg-zinc-950/98 border border-zinc-800 p-2 shadow-2xl shadow-black/90 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-zinc-800/80 mb-1.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#bd1616]" />
                Select Country &amp; Currency
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Separate rates for India &amp; USA</p>
            </div>
          </div>

          <div className="space-y-1">
            {AVAILABLE_COUNTRIES.map((item) => {
              const isSelected = item.code === country;
              const rateDescription =
                item.code === 'IN'
                  ? 'Starts at ₹1,499 (Telangana & India)'
                  : 'Starts at $99 (USA Nationwide)';

              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#bd1616]/15 border border-[#bd1616]/40 text-white shadow-sm'
                      : 'text-zinc-300 hover:bg-zinc-900 border border-transparent hover:text-white'
                  }`}
                  id={`country-option-${item.code.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0 leading-none">{item.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.countryName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-zinc-800 text-[#bd1616]">
                          {item.symbol} {item.currency}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
                        {rateDescription}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#bd1616] text-white shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
