import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Film,
  Timer,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Copy,
  Check,
  Package,
  Printer,
  ShieldCheck,
  Send,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import { siteConfig, bookingConfig } from '../config/siteConfig';
import { BookingFormData } from '../types';
import { useCountry } from '../context/CountryContext';
import {
  validateBookingForm,
  buildWhatsAppBookingUrl,
  submitBookingRequest,
  buildMailtoUrl,
} from '../utils/bookingSubmission';
import {
  validateCoupon,
  calculateDiscountedPrice,
  CouponResult,
} from '../utils/couponHelper';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialPackage?: string;
  initialCoupon?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialPackage,
  initialCoupon,
}) => {
  const { country, setCountry, countryConfig, getPackagePrice, getEliteStartingPrice } = useCountry();

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: '',
    service: initialService || bookingConfig.services[0] || 'Event Reels',
    date: '',
    time: '',
    duration: '2 Hours',
    location: '',
    requirements: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isWhatsAppPinging, setIsWhatsAppPinging] = useState<boolean>(false);
  const [couponInput, setCouponInput] = useState<string>(initialCoupon || '');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Automated email-style confirmation state
  const [bookingReferenceId, setBookingReferenceId] = useState<string>('');
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Derive comprehensive package details based on selection or chosen duration
  const resolvedPackageInfo = useMemo(() => {
    // 1. If explicit package specified
    if (initialPackage) {
      if (initialPackage === 'elite-select' || initialPackage === 'exclusive-tier') {
        return {
          id: 'exclusive-tier',
          name: siteConfig.exclusiveTier.name,
          price: getEliteStartingPrice(),
          originalPrice: undefined,
          shootTime: 'Full Day / Custom Coverage',
          deliverables: siteConfig.exclusiveTier.features || [
            'Dedicated Cinematic Director & 2 Certified Reel-Makers',
            'Full Day Multi-Angle 4K HDR Capture',
            'Same-Day Priority Social Reel Delivery',
            'Complete Raw 4K Video Library Access',
            'Bespoke Audio Design & Studio Color Grade',
          ],
          features: siteConfig.exclusiveTier.features || ['VIP Production Crew', 'Turnkey Delivery'],
          tagline: siteConfig.exclusiveTier.tagline || 'Custom VIP commercial & celebration production.',
          badge: 'Exclusive Tier',
        };
      }
      const pkg = siteConfig.packages.find((p) => p.id === initialPackage);
      if (pkg) {
        return {
          id: pkg.id,
          name: pkg.name,
          price: getPackagePrice(pkg.id),
          originalPrice: pkg.originalPrice,
          shootTime: pkg.shootTime,
          deliverables: pkg.deliverables,
          features: pkg.features,
          tagline: pkg.tagline,
          badge: pkg.badge,
        };
      }
    }

    // 2. Intelligent fallback based on selected duration
    if (formData.duration === '1 Hour') {
      const pkg = siteConfig.packages.find((p) => p.id === 'hourly-plan') || siteConfig.packages[0];
      return {
        id: pkg.id,
        name: pkg.name,
        price: getPackagePrice(pkg.id),
        originalPrice: pkg.originalPrice,
        shootTime: pkg.shootTime,
        deliverables: pkg.deliverables,
        features: pkg.features,
        tagline: pkg.tagline,
        badge: pkg.badge,
      };
    } else if (formData.duration === 'Full Day' || formData.duration === 'Custom') {
      return {
        id: 'exclusive-tier',
        name: siteConfig.exclusiveTier.name,
        price: getEliteStartingPrice(),
        originalPrice: undefined,
        shootTime: 'Full Day Production',
        deliverables: siteConfig.exclusiveTier.features || [
          'Full Day 4K Multi-Scene Reel Coverage',
          'Trained & Certified Director On-Site',
          'Same-Day Priority Social Edits',
          'Raw Footage Archive Access',
        ],
        features: siteConfig.exclusiveTier.features || ['VIP Ground Support'],
        tagline: siteConfig.exclusiveTier.tagline || 'Bespoke high-impact visual coverage.',
        badge: 'Custom VIP',
      };
    } else {
      // Default to Half Day Plan (most popular)
      const pkg =
        siteConfig.packages.find((p) => p.id === 'half-day-plan') ||
        siteConfig.packages[1] ||
        siteConfig.packages[0];
      return {
        id: pkg.id,
        name: pkg.name,
        price: getPackagePrice(pkg.id),
        originalPrice: pkg.originalPrice,
        shootTime: pkg.shootTime,
        deliverables: pkg.deliverables,
        features: pkg.features,
        tagline: pkg.tagline,
        badge: pkg.badge,
      };
    }
  }, [initialPackage, formData.duration, getPackagePrice, getEliteStartingPrice]);

  // Backward compatibility alias for form top header
  const selectedPackageInfo = initialPackage ? resolvedPackageInfo : null;

  // Dynamic pricing calculation when coupon is applied
  const pricingCalculation = useMemo(() => {
    const basePrice = resolvedPackageInfo.price;
    if (!basePrice) return null;
    if (!appliedCoupon || appliedCoupon.discountPercent <= 0) {
      return {
        hasDiscount: false,
        finalPrice: basePrice,
        originalPrice: resolvedPackageInfo.originalPrice || basePrice,
      };
    }
    const res = calculateDiscountedPrice(basePrice, appliedCoupon.discountPercent);
    return {
      hasDiscount: true,
      originalPrice: resolvedPackageInfo.originalPrice || basePrice,
      finalPrice: res.discountedPrice || basePrice,
      savedAmount: res.savedAmount,
      percent: appliedCoupon.discountPercent,
    };
  }, [resolvedPackageInfo, appliedCoupon]);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply !== undefined ? codeToApply : couponInput;
    const result = validateCoupon(code);
    if (result.valid) {
      setAppliedCoupon(result);
      setCouponInput(result.code);
      setCouponError('');
      setFormData((prev) => ({
        ...prev,
        couponCode: result.code,
        discountApplied: `${result.discountPercent}% OFF`,
      }));
    } else {
      setCouponError(result.errorMessage || 'Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setFormData((prev) => ({
      ...prev,
      couponCode: undefined,
      discountApplied: undefined,
    }));
  };

  // Sync initial coupon if supplied
  useEffect(() => {
    if (isOpen && initialCoupon) {
      handleApplyCoupon(initialCoupon);
    }
  }, [isOpen, initialCoupon]);

  // Sync initial service / package props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialService) {
        setFormData((prev) => ({ ...prev, service: initialService }));
      }
      if (initialPackage) {
        const pkg = siteConfig.packages.find((p) => p.id === initialPackage);
        if (pkg) {
          const durationMapping = pkg.shootTime.includes('1 Hour')
            ? '1 Hour'
            : pkg.shootTime.includes('3 Hours')
            ? '3 Hours'
            : 'Full Day';
          const dynamicPrice = getPackagePrice(pkg.id);
          setFormData((prev) => ({
            ...prev,
            duration: durationMapping,
            requirements: prev.requirements || `Interested in the ${pkg.name} package (${dynamicPrice}).`,
          }));
        } else if (initialPackage === 'elite-select' || initialPackage === 'exclusive-tier') {
          const elitePrice = getEliteStartingPrice();
          setFormData((prev) => ({
            ...prev,
            duration: 'Full Day',
            requirements: prev.requirements || `Interested in the ${siteConfig.exclusiveTier.name} package (${elitePrice}).`,
          }));
        }
      }
    }
  }, [isOpen, initialService, initialPackage, getPackagePrice, getEliteStartingPrice]);

  // Subtle celebratory confetti effect when booking succeeds
  useEffect(() => {
    if (isSubmitted) {
      try {
        // First subtle burst from center
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.55 },
          colors: ['#bd1616', '#ffffff', '#e63939', '#9e1212', '#34d399'],
          ticks: 200,
          gravity: 1.15,
          scalar: 0.85,
          disableForReducedMotion: true,
          zIndex: 99999,
        });

        // Soft staggered side accents for depth
        const timer = setTimeout(() => {
          confetti({
            particleCount: 25,
            angle: 60,
            spread: 45,
            origin: { x: 0.25, y: 0.6 },
            colors: ['#bd1616', '#ffffff', '#e63939', '#10b981'],
            ticks: 180,
            gravity: 1.2,
            scalar: 0.75,
            disableForReducedMotion: true,
            zIndex: 99999,
          });
          confetti({
            particleCount: 25,
            angle: 120,
            spread: 45,
            origin: { x: 0.75, y: 0.6 },
            colors: ['#bd1616', '#ffffff', '#e63939', '#10b981'],
            ticks: 180,
            gravity: 1.2,
            scalar: 0.75,
            disableForReducedMotion: true,
            zIndex: 99999,
          });
        }, 180);

        return () => clearTimeout(timer);
      } catch {
        // Graceful fallback if confetti environment unavailable
      }
    }
  }, [isSubmitted]);

  // Lock body scroll while open and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof BookingFormData];
        return next;
      });
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError(validation.firstErrorMessage || 'Please complete all required fields.');
      return;
    }

    setErrors({});
    setGeneralError('');
    setIsSubmitting(true);

    try {
      await submitBookingRequest({
        ...formData,
        country: countryConfig.whatsappCountryName,
        price: pricingCalculation?.finalPrice || resolvedPackageInfo.price,
        packageName: resolvedPackageInfo.name,
      });

      // Generate a realistic booking reference and timestamp for the automated email summary
      const refCode = `SS-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const formattedTimestamp = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      setBookingReferenceId(refCode);
      setSubmissionTimestamp(formattedTimestamp);
      setIsSubmitted(true);
    } catch {
      setGeneralError('An unexpected error occurred. Please try again or book via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmailSummaryToClipboard = () => {
    const activePkg = resolvedPackageInfo;
    const finalPrice = pricingCalculation?.finalPrice || activePkg.price;
    const emailBody = `=====================================================
AUTOMATED BOOKING SUMMARY - SNAP SHOTS STUDIO
Reference ID: ${bookingReferenceId}
Date Generated: ${submissionTimestamp}
=====================================================

FROM: Snap Shots Dispatch <getursnapshots@gmail.com>
TO: ${formData.name} <${formData.email || 'Client'}>
PHONE: ${formData.phone}
SUBJECT: Confirmed: 🎬 ${formData.service} Shoot with Snap Shots

-----------------------------------------------------
1. SELECTED SERVICE
-----------------------------------------------------
• Service: ${formData.service}
• Coverage Type: 4K HDR Vertical Reel & Social Media Video
• Category Focus: On-Location Dynamic Capture

-----------------------------------------------------
2. PACKAGE DETAILS & INCLUSIONS
-----------------------------------------------------
• Package Name: ${activePkg.name} (${activePkg.badge || 'Official Package'})
• Shoot Duration: ${formData.duration || activePkg.shootTime}
• Deliverables & Features:
${activePkg.deliverables.map((item: string) => `  - ${item}`).join('\n')}

-----------------------------------------------------
3. SHOOT LOGISTICS & SCHEDULE
-----------------------------------------------------
• Scheduled Date: ${formData.date}
• Scheduled Time: ${formData.time}
• Shoot Location: ${formData.location}
• Region / Market: ${countryConfig.whatsappCountryName}
${formData.requirements ? `• Special Instructions: "${formData.requirements}"\n` : ''}
-----------------------------------------------------
4. INVESTMENT & PRICING BREAKDOWN
-----------------------------------------------------
• Base Package Rate: ${pricingCalculation?.originalPrice || activePkg.price}
${formData.couponCode ? `• Applied Coupon: ${formData.couponCode} (${formData.discountApplied}) - Saved ${pricingCalculation?.savedAmount || ''}\n` : ''}• Total Estimated Price: ${finalPrice}
• Currency: ${countryConfig.currency} (${countryConfig.symbol})

-----------------------------------------------------
DISPATCH STATUS:
Confirmed & Dispatched to Certified Creator Network.
A dedicated Snap Shots creator will reach out before call-time.
Tel: +91 90143 19818 | getursnapshots@gmail.com
=====================================================`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailBody);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const handleWhatsAppClick = () => {
    setIsWhatsAppPinging(false);
    requestAnimationFrame(() => {
      setIsWhatsAppPinging(true);
      setTimeout(() => setIsWhatsAppPinging(false), 900);
    });

    const url = buildWhatsAppBookingUrl(formData, {
      country: countryConfig.whatsappCountryName,
      price: pricingCalculation?.finalPrice || resolvedPackageInfo.price,
      packageName: `${resolvedPackageInfo.name} (${formData.service} - Ref: ${bookingReferenceId || 'DIRECT'})`,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setBookingReferenceId('');
    setSubmissionTimestamp('');
    setCopiedSummary(false);
    setErrors({});
    setGeneralError('');
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    onClose();
  };

  // Get today's date formatted as YYYY-MM-DD for min date picker
  const todayStr = new Date().toISOString().split('T')[0];

  // Interactive Calendar / Date Picker State
  const [showCalendarView, setShowCalendarView] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  // Quick date presets
  const quickDates = useMemo(() => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const thisWeekend = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    thisWeekend.setDate(now.getDate() + daysUntilSaturday);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    return [
      { label: 'Today', date: formatDate(now) },
      { label: 'Tomorrow', date: formatDate(tomorrow) },
      { label: 'This Weekend', date: formatDate(thisWeekend) },
      { label: 'In 7 Days', date: formatDate(nextWeek) },
    ];
  }, []);

  const selectCalendarDate = (dateStr: string) => {
    setFormData((prev) => ({ ...prev, date: dateStr }));
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
    const currentDayNum = String(now.getDate()).padStart(2, '0');
    const localTodayStr = `${currentYear}-${currentMonthNum}-${currentDayNum}`;

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: '',
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const isPast = dateStr < localTodayStr;
      const isToday = dateStr === localTodayStr;
      const isSelected = formData.date === dateStr;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [calendarMonth, formData.date]);

  const monthYearHeader = useMemo(() => {
    return calendarMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [calendarMonth]);

  const formattedSelectedDate = useMemo(() => {
    if (!formData.date) return null;
    const parts = formData.date.split('-');
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [formData.date]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Darkened Semi-Transparent Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={handleResetAndClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-black border border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(189,22,22,0.18)] text-white p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Close 'X' Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#bd1616] hover:border-[#bd1616] transition-all cursor-pointer z-20"
          aria-label="Close booking modal"
          id="booking-modal-close-x"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {isSubmitted ? (
          /* ===================================================================
           * AUTOMATED EMAIL-STYLE SUMMARY VIEW
           * Displays official dispatch statement, selected service, and package details
           * =================================================================== */
          <div
            className="py-2 sm:py-3 text-left relative overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            id="booking-modal-success-email"
          >
            {/* Ambient celebration backdrop glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#bd1616]/15 via-[#ffc800]/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Email Client Simulated Envelope Card */}
            <div className="w-full rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Simulated Mail Client Window Chrome */}
              <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#bd1616]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffc800]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline ml-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>dispatch.snapshots.photos/inbox</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Automated Email Summary</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#ffc800] bg-black/70 px-2 py-0.5 rounded border border-white/10 font-bold">
                    #{bookingReferenceId || 'SS-CONFIRMED'}
                  </span>
                </div>
              </div>

              {/* Email Envelope Metadata Header */}
              <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800/80 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] w-14 shrink-0">
                      From:
                    </span>
                    <span className="text-zinc-200 font-medium truncate">
                      Snap Shots Dispatch &lt;<span className="text-zinc-400">getursnapshots@gmail.com</span>&gt;
                    </span>
                  </div>
                  <span className="text-zinc-400 text-[11px] font-mono shrink-0">
                    {submissionTimestamp}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] w-14 shrink-0">
                    To:
                  </span>
                  <span className="text-white font-semibold truncate">
                    {formData.name} &lt;<span className="text-zinc-400">{formData.email || formData.phone}</span>&gt;
                  </span>
                </div>

                <div className="flex items-start sm:items-center gap-2 text-zinc-400">
                  <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] w-14 shrink-0 mt-0.5 sm:mt-0">
                    Subject:
                  </span>
                  <span className="text-[#ffc800] font-bold text-xs sm:text-sm">
                    🎬 Confirmed: {formData.service} Shoot &bull; {resolvedPackageInfo.name} Summary
                  </span>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="p-4 sm:p-6 space-y-5 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 text-zinc-200">
                {/* Salutation & Status Banner */}
                <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      Hello {formData.name}, your shoot booking is confirmed!
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Thank you for choosing <strong>Snap Shots Visual Media Studio</strong>. Your booking request has been routed to our certified creators in <strong>{countryConfig.whatsappCountryName}</strong>. Please review your selected service and package summary below.
                    </p>
                  </div>
                </div>

                {/* Primary Highlights: Selected Service & Selected Package */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Selected Service Card */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 hover:border-[#bd1616]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#bd1616] uppercase tracking-widest flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-[#bd1616]" />
                        Selected Service
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold">
                        4K Production
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {formData.service}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Cinematic vertical coverage engineered for high social reach, trending audio syncing, and professional presentation.
                    </p>
                  </div>

                  {/* Selected Package Details Card */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 hover:border-[#ffc800]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#ffc800] uppercase tracking-widest flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#ffc800]" />
                        Package Details
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#bd1616]/20 border border-[#bd1616]/50 text-[#bd1616] text-[10px] font-bold">
                        {resolvedPackageInfo.badge || 'Official Package'}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white flex items-baseline justify-between flex-wrap gap-1">
                      <span>{resolvedPackageInfo.name}</span>
                      <span className="text-sm font-extrabold text-[#bd1616]">
                        {pricingCalculation?.finalPrice || resolvedPackageInfo.price}
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {resolvedPackageInfo.tagline || 'On-location shoot with certified videographer and priority delivery.'}
                    </p>
                  </div>
                </div>

                {/* Package Inclusions & Deliverables Checklist */}
                {resolvedPackageInfo.deliverables && resolvedPackageInfo.deliverables.length > 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/90 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Package Deliverables &amp; Inclusions:
                      </h4>
                      <span className="text-[11px] text-[#ffc800] font-mono font-bold">
                        Coverage: {formData.duration || resolvedPackageInfo.shootTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {resolvedPackageInfo.deliverables.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shoot Logistics Grid */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <Calendar className="w-4 h-4 text-[#ffc800]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Shoot Date</span>
                      <span className="text-white font-semibold">{formData.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <Clock className="w-4 h-4 text-[#ffc800]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Preferred Time</span>
                      <span className="text-white font-semibold">{formData.time} ({formData.duration})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <MapPin className="w-4 h-4 text-[#bd1616]" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Location</span>
                      <span className="text-white font-semibold truncate block" title={formData.location}>
                        {formData.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Requirements Note (if entered) */}
                {formData.requirements && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#ffc800]" />
                      Special Shoot Instructions / Creative Notes:
                    </span>
                    <p className="text-zinc-200 italic font-mono text-[11px] pl-3 border-l-2 border-[#bd1616]">
                      "{formData.requirements}"
                    </p>
                  </div>
                )}

                {/* Financial Summary & Pricing Statement */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Package Base Rate:</span>
                    <span className="text-zinc-200 font-mono font-medium">
                      {pricingCalculation?.originalPrice || resolvedPackageInfo.price}
                    </span>
                  </div>

                  {formData.couponCode && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Tag className="w-3 h-3" />
                        Coupon Applied ({formData.couponCode}):
                      </span>
                      <span className="font-mono font-bold">
                        -{pricingCalculation?.savedAmount || formData.discountApplied || 'Discount'}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 pt-2.5 flex justify-between items-center text-sm font-extrabold">
                    <span className="text-white uppercase tracking-wider">Estimated Total ({countryConfig.currency}):</span>
                    <span className="text-base sm:text-lg text-[#bd1616] font-mono">
                      {pricingCalculation?.finalPrice || resolvedPackageInfo.price}
                    </span>
                  </div>
                </div>

                {/* Dispatch Disclaimer & Creator Contact */}
                <div className="pt-2 text-center sm:text-left text-[11px] text-zinc-400 border-t border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p>
                    Questions or timing changes? Contact dispatch at <strong className="text-white">+91 90143 19818</strong> or reply via WhatsApp.
                  </p>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Ref ID: {bookingReferenceId}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Action Controls Bar */}
            <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Copy Email Summary Button */}
                <button
                  type="button"
                  onClick={copyEmailSummaryToClipboard}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
                  id="copy-email-summary-btn"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Summary Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copy Email Summary</span>
                    </>
                  )}
                </button>

                {/* Print / Save PDF Button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-11 px-3.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Print or Save PDF"
                  aria-label="Print or save booking confirmation"
                  id="print-booking-summary-btn"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* WhatsApp Creator Notification (Signature Red Button) */}
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="flex-1 sm:flex-none h-11 px-6 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#bd1616]/30 active:scale-95"
                  id="booking-modal-success-whatsapp"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Notify on WhatsApp</span>
                </button>

                {/* Done / Close Button */}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="h-11 px-6 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  id="booking-modal-success-close-btn"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================================
           * BOOKING FORM
           * =================================================================== */
          <div id="booking-modal-form-content">
            {/* Modal Header */}
            <div className="text-left pr-8 sm:pr-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 text-[#bd1616] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#bd1616]" />
                <span>Snap Shots Studio</span>
              </div>

              <h2
                id="booking-modal-title"
                className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-tight"
              >
                {bookingConfig.heading}
              </h2>

              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {bookingConfig.subheading}
              </p>
            </div>

            {/* General Validation Error Alert */}
            {generalError && (
              <div
                className="mt-3.5 sm:mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in"
                role="alert"
                id="booking-modal-error-alert"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Selected Package and Price Display */}
            {selectedPackageInfo && (
              <div
                className="mt-3.5 sm:mt-4 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-inner"
                id="booking-modal-package-summary"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Selected Package:
                  </span>
                  <span className="text-sm sm:text-base font-black text-white">
                    {selectedPackageInfo.name}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                  {/* Region Toggle (India & USA only) */}
                  <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setCountry('IN')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        country === 'IN'
                          ? 'bg-[#bd1616] text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      id="modal-toggle-in"
                    >
                      🇮🇳 India
                    </button>
                    <button
                      type="button"
                      onClick={() => setCountry('US')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        country === 'US'
                          ? 'bg-[#bd1616] text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      id="modal-toggle-us"
                    >
                      🇺🇸 USA
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Price ({countryConfig.currency}):
                    </span>
                    {pricingCalculation?.hasDiscount ? (
                      <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                        <span className="text-xs line-through text-zinc-500 font-medium">
                          {pricingCalculation.originalPrice}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-[#bd1616]">
                          {pricingCalculation.finalPrice}
                        </span>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded-md">
                          {pricingCalculation.percent}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-extrabold text-[#bd1616]">
                        {selectedPackageInfo.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4" noValidate>
              {/* Anti-Spam Honeypot Field (Hidden from humans, traps automated spam bots) */}
              <div className="hidden opacity-0 absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="modal-hp-website">Leave blank</label>
                <input
                  type="text"
                  id="modal-hp-website"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={(formData as any).website_url || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Row 1: Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="modal-name"
                    className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                  >
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="modal-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                        errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                      } text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="modal-phone"
                    className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                  >
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="modal-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                        errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                      } text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="modal-email"
                    className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                        errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                      } text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="modal-service"
                    className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                  >
                    Service <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Film className="w-4 h-4" />
                    </div>
                    <select
                      id="modal-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                        errors.service ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                      } text-base sm:text-sm text-white focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors`}
                    >
                      {bookingConfig.services.map((svc) => (
                        <option key={svc} value={svc} className="bg-zinc-950 text-white py-1">
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.service && (
                    <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.service}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Preferred Date (with Interactive Calendar View) & Preferred Time */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Preferred Date Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                      <label
                        htmlFor="modal-date"
                        className="block text-xs sm:text-sm font-semibold text-zinc-200"
                      >
                        Preferred Date <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCalendarView(!showCalendarView)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ffc800] hover:text-[#ffd633] transition-colors cursor-pointer"
                        id="toggle-calendar-view-btn"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{showCalendarView ? 'Hide Calendar' : 'Calendar View'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        id="modal-date"
                        name="date"
                        min={todayStr}
                        value={formData.date}
                        onChange={handleChange}
                        className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                          errors.date ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                        } text-base sm:text-sm text-white focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors [color-scheme:dark]`}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.date}</p>
                    )}
                  </div>

                  {/* Preferred Time Selector */}
                  <div>
                    <label
                      htmlFor="modal-time"
                      className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                    >
                      Preferred Time <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Clock className="w-4 h-4" />
                      </div>
                      <input
                        type="time"
                        id="modal-time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                          errors.time ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                        } text-base sm:text-sm text-white focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors [color-scheme:dark]`}
                      />
                    </div>
                    {errors.time && (
                      <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.time}</p>
                    )}
                  </div>
                </div>

                {/* Quick Date Selection Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider shrink-0 mr-1">
                    Quick Select:
                  </span>
                  {quickDates.map((item) => {
                    const isSelected = formData.date === item.date;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => selectCalendarDate(item.date)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-[#bd1616] text-white font-bold ring-1 ring-white/20 shadow-xs'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Inline Calendar View */}
                {showCalendarView && (
                  <div
                    className="p-3 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200"
                    id="booking-interactive-calendar"
                  >
                    {/* Month / Year Navigation */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#bd1616]" />
                        <h4 className="text-xs sm:text-sm font-bold text-white capitalize">
                          {monthYearHeader}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day of Week Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <span
                          key={day}
                          className="text-[10px] font-bold text-zinc-400 py-1"
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Day Cells Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((cell, idx) => {
                        if (!cell.isCurrentMonth) {
                          return <div key={`empty-${idx}`} className="h-8" />;
                        }

                        return (
                          <button
                            key={cell.dateStr}
                            type="button"
                            disabled={cell.isPast}
                            onClick={() => selectCalendarDate(cell.dateStr)}
                            className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center relative transition-all ${
                              cell.isPast
                                ? 'text-zinc-600 cursor-not-allowed opacity-40'
                                : cell.isSelected
                                ? 'bg-[#bd1616] text-white font-bold shadow-md shadow-[#bd1616]/40 scale-105 cursor-pointer ring-2 ring-white/30'
                                : cell.isToday
                                ? 'bg-zinc-900 border border-amber-400/60 text-amber-300 hover:bg-zinc-800 cursor-pointer'
                                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 cursor-pointer'
                            }`}
                          >
                            <span>{cell.dayNumber}</span>
                            {cell.isToday && !cell.isSelected && (
                              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Date Confirmation Tag */}
                    {formattedSelectedDate ? (
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-300 flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Shoot Date: <strong className="text-white">{formattedSelectedDate}</strong></span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ⚡ Priority Slot Reserved
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400 italic text-center pt-1">
                        Click any available date above to set your shoot schedule.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Row 4: Shoot Duration & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="modal-duration"
                    className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                  >
                    Duration
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Timer className="w-4 h-4" />
                    </div>
                    <select
                      id="modal-duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 text-base sm:text-sm text-white focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors"
                    >
                      {bookingConfig.durations.map((dur) => (
                        <option key={dur} value={dur} className="bg-zinc-950 text-white py-1">
                          {dur}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="modal-location"
                    className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                  >
                    Shoot Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="modal-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter shoot location"
                      className={`w-full h-11 sm:h-11 md:h-12 pl-9 pr-3 rounded-xl bg-zinc-950 border ${
                        errors.location ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-800'
                      } text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors`}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-[11px] sm:text-xs text-red-400 font-medium mt-1">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Row 5: Requirements */}
              <div>
                <label
                  htmlFor="modal-requirements"
                  className="block text-xs sm:text-sm font-semibold text-zinc-200 mb-1 sm:mb-1.5"
                >
                  Requirements
                </label>
                <textarea
                  id="modal-requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Tell us about your shoot or content requirements..."
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Row 6: Coupon / Promo Code Section */}
              <div
                className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5"
                id="booking-modal-coupon-section"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="modal-coupon-code"
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase tracking-wider"
                  >
                    <Tag className="w-3.5 h-3.5 text-[#bd1616]" />
                    <span>Have a Coupon Code?</span>
                  </label>
                  {appliedCoupon && (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Applied
                    </span>
                  )}
                </div>

                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          id="modal-coupon-code"
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            if (couponError) setCouponError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Enter coupon code (e.g. SNAP15)"
                          className="w-full h-10 px-3 uppercase rounded-xl bg-zinc-950 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono tracking-wider focus:outline-none focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="h-10 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white hover:text-[#bd1616] border border-zinc-700 hover:border-[#bd1616] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                        id="booking-modal-apply-coupon-btn"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-400 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
                      <span>Available offer:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('SNAP15')}
                        className="text-[#bd1616] hover:underline font-mono font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>SNAP15</span>
                        <span className="text-zinc-400 font-normal">(15% OFF)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-emerald-300">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-1.5 py-0.5 rounded">
                            {appliedCoupon.discountPercent}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300">
                          {appliedCoupon.description}
                          {pricingCalculation?.savedAmount && (
                            <span className="text-emerald-400 font-bold ml-1">
                              • Saved {pricingCalculation.savedAmount}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer px-2.5 py-1 font-semibold hover:bg-zinc-900/60 rounded-lg"
                      id="booking-modal-remove-coupon-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-1 sm:pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 sm:h-12 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-[#bd1616]/30 hover:shadow-xl hover:shadow-[#bd1616]/40 transition-all duration-200 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                  id="booking-modal-submit-btn"
                >
                  {isSubmitting ? (
                    <span>CONFIRMING DETAILS...</span>
                  ) : (
                    <span>{bookingConfig.submitButtonText}</span>
                  )}
                </button>
              </div>

              {/* Divider: OR */}
              <div className="relative flex items-center justify-center py-0.5 sm:py-1">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-black px-3 text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  OR
                </span>
                <div className="border-t border-zinc-800 w-full" />
              </div>

              {/* WhatsApp Secondary Button */}
              <div>
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="relative overflow-visible w-full h-10 sm:h-11 rounded-full bg-zinc-950 border border-zinc-700/80 hover:border-[#bd1616] hover:bg-[#bd1616]/10 text-white hover:text-[#bd1616] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                  id="booking-modal-whatsapp-btn"
                >
                  {isWhatsAppPinging && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-[#bd1616] animate-ping opacity-60 pointer-events-none" />
                      <span className="absolute -inset-1 rounded-full border border-[#bd1616] animate-ping opacity-40 pointer-events-none" />
                    </>
                  )}
                  <MessageSquare className="w-4 h-4 text-[#bd1616] relative z-10" />
                  <span className="relative z-10">{bookingConfig.whatsappButtonText}</span>
                </button>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 text-center mt-1 sm:mt-1.5">
                  Direct connection with certified creators in Telangana &amp; USA
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
