import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Send,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { BookingFormData } from '../types';
import { useCountry } from '../context/CountryContext';
import {
  validateCoupon,
  CouponResult,
} from '../utils/couponHelper';

interface BookingFormProps {
  selectedService?: string;
  selectedPackage?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ selectedService, selectedPackage }) => {
  const { countryConfig, getPackagePrice, getEliteStartingPrice } = useCountry();

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: '',
    service: selectedService || 'Event Reels',
    date: '',
    time: 'Afternoon (12 PM - 4 PM)',
    duration: '2-3 Hours',
    location: '',
    requirements: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState<string>('');

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

  // Update service when props change from pricing or services cards
  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, service: selectedService }));
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedPackage) {
      if (selectedPackage === 'wedding-select' || selectedPackage === 'elite-select') {
        setFormData((prev) => ({
          ...prev,
          service: 'Weddings & Celebrations',
          duration: 'Full Day (6+ Hours)',
          requirements: 'Interested in the Wedding & Select Package with multi-angle cinematic coverage.',
        }));
        return;
      }
      const matched = siteConfig.packages.find((p) => p.id === selectedPackage);
      if (matched) {
        setFormData((prev) => ({
          ...prev,
          duration: matched.shootTime.includes('1 Hour')
            ? '1 Hour'
            : matched.shootTime.includes('3 Hours') || matched.shootTime.includes('3 hours')
            ? '2-3 Hours'
            : 'Custom / Flexible',
          requirements: `Interested in the ${matched.name} (${matched.price}).`,
        }));
      }
    }
  }, [selectedPackage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('Please provide a valid phone number for shoot coordination.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.date) {
      setErrorMessage('Please select your preferred shoot date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Simulate reliable booking submission with local persistence
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Save submission locally so user doesn't lose track
      try {
        const existing = JSON.parse(localStorage.getItem('snapshots_bookings') || '[]');
        existing.push({
          ...formData,
          country: countryConfig.whatsappCountryName,
          currency: countryConfig.currency,
          submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('snapshots_bookings', JSON.stringify(existing));
      } catch (err) {
        // Storage fallback
      }
    }, 900);
  };

  const generateWhatsAppUrl = () => {
    const lines = [
      `*New Shoot Booking Request - Snap Shots*`,
      `Name: ${formData.name || 'Client'}`,
      `Phone: ${formData.phone || 'Not provided'}`,
      `Service: ${formData.service}`,
      `Date: ${formData.date || 'To be decided'}`,
      `Time: ${formData.time}`,
      `Duration: ${formData.duration}`,
      `Location: ${formData.location || 'Pending venue'}`,
    ];
    if (formData.couponCode) {
      lines.push(`Coupon: ${formData.couponCode} (${formData.discountApplied || 'Applied'})`);
    }
    lines.push(`Notes: ${formData.requirements || 'None'}`);

    const text = lines.join('\n');
    return `https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="booking" className="bg-transparent py-10 sm:py-14 relative overflow-hidden">
      {/* Background ambient accents */}
      <div
        className="absolute pointer-events-none -top-24 right-0 w-[500px] h-[500px]"
        style={{
          background: 'radial-gradient(circle, rgba(189, 22, 22,0.18) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header (Matches ReelOnGo hierarchy) */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="uppercase text-[#bd1616] font-bold text-xs sm:text-sm tracking-widest">
            BOOK YOUR SESSION TODAY
          </p>
          <h2
            className="mt-2 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
            id="booking-headline"
          >
            Instantly Perfect Event Reels — For Anything, Anytime!
          </h2>
          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Fill out the form to schedule your shoot. We&apos;ll help bring your vision to life, whether it&apos;s a corporate event, wedding, or creative project.
          </p>
        </div>

        {/* 2-Column Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto items-start">
          {/* Left Column: Direct Info & Guarantees */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-zinc-950 p-7 sm:p-8 text-white shadow-xl border border-zinc-800">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#bd1616] text-white text-[11px] font-bold uppercase tracking-wider border border-[#9e1212] mb-4 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" />
                <span>Zero Booking Fee to Inquire</span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight text-white">
                What happens after you submit?
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#bd1616] text-white text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Instant Creator Check</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      We match creator availability in your city for your exact date.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#bd1616] text-white text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">15-Min WhatsApp Sync</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Our coordinator sends you reel mood boards and confirms timings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#bd1616] text-white text-xs font-bold flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Show Up &amp; Shine</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      We shoot, edit, and deliver your viral reel within hours!
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Contact Button */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-xs text-zinc-400 mb-3">Prefer an instant human chat?</p>
                <a
                  href={`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(siteConfig.business.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#bd1616]/20 transition-all hover:scale-[1.02] border border-[#9e1212]"
                >
                  <MessageSquare className="w-4 h-4 fill-white text-white" />
                  <span>CHAT VIA WHATSAPP NOW</span>
                </a>
              </div>
            </div>

            {/* Direct Contact Details Box */}
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#bd1616]" />
                <span>
                  Direct Desk: <strong className="text-white">{siteConfig.business.phone}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#bd1616]" />
                <span>
                  Bookings Email: <strong className="text-white">{siteConfig.business.email}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#bd1616]" />
                <span>Active across Telangana, India &amp; USA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 sm:p-6 md:p-8 shadow-xl shadow-black/40">
              {isSubmitted ? (
                <div className="py-12 text-center animate-in fade-in duration-300">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#bd1616] text-white shadow-lg shadow-[#bd1616]/25 mb-4 border border-[#9e1212]">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Thank you! Your request has been received. We&apos;ll contact you shortly.
                  </h3>
                  <p className="mt-2 text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Our lead shoot director has received your booking details for <strong className="text-white">{formData.service}</strong> on <strong className="text-white">{formData.date}</strong>. We will review your requirements and get in touch with you shortly.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 h-11 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#bd1616]/20 hover:scale-105 transition-transform border border-[#9e1212]"
                    >
                      <MessageSquare className="w-4 h-4 fill-white text-white" />
                      <span>CONTINUE ON WHATSAPP</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setAppliedCoupon(null);
                        setCouponInput('');
                        setCouponError('');
                        setFormData({
                          name: '',
                          phone: '',
                          email: '',
                          service: 'Event Reels',
                          date: '',
                          time: 'Afternoon (12 PM - 4 PM)',
                          duration: '2-3 Hours',
                          location: '',
                          requirements: '',
                        });
                      }}
                      className="w-full sm:w-auto px-6 h-11 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer border border-zinc-700 hover:border-[#bd1616] hover:text-[#bd1616]"
                    >
                      Submit Another Booking
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" id="shoot-booking-form">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Full Name <span className="text-[#bd1616]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Aditi Sharma"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all"
                        id="booking-input-name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Phone Number <span className="text-[#bd1616]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +91 90143 19818"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all"
                        id="booking-input-phone"
                      />
                    </div>
                  </div>

                  {/* Email & Service */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Email <span className="text-[#bd1616]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="aditi@example.com"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all"
                        id="booking-input-email"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Service <span className="text-[#bd1616]">*</span>
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all cursor-pointer"
                        id="booking-select-service"
                      >
                        {siteConfig.services.map((srv) => (
                          <option key={srv.id} value={srv.title} className="bg-zinc-900 text-white">
                            {srv.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Preferred Date <span className="text-[#bd1616]">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all cursor-pointer"
                        id="booking-input-date"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Preferred Time
                      </label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all cursor-pointer"
                        id="booking-select-time"
                      >
                        <option value="Morning (8 AM - 12 PM)" className="bg-zinc-900 text-white">Morning (8 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 4 PM)" className="bg-zinc-900 text-white">Afternoon (12 PM - 4 PM)</option>
                        <option value="Golden Hour / Evening (4 PM - 8 PM)" className="bg-zinc-900 text-white">
                          Golden Hour / Evening (4 PM - 8 PM)
                        </option>
                        <option value="Night Event (8 PM Onwards)" className="bg-zinc-900 text-white">Night Event (8 PM Onwards)</option>
                        <option value="Full Day Flexible" className="bg-zinc-900 text-white">Full Day Flexible</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Shoot Duration
                      </label>
                      <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all cursor-pointer"
                        id="booking-select-duration"
                      >
                        <option value="1 Hour (Quick Shot)" className="bg-zinc-900 text-white">
                          1 Hour (Quick Shot — {getPackagePrice('quick-shot')})
                        </option>
                        <option value="2-3 Hours (Event Reel)" className="bg-zinc-900 text-white">
                          2-3 Hours (Event Reel — {getPackagePrice('event-reel')})
                        </option>
                        <option value="Full Day (6+ Hours)" className="bg-zinc-900 text-white">
                          Full Day (6+ Hours — {getPackagePrice('full-content')})
                        </option>
                        <option value="Multi-Day / Wedding Elite" className="bg-zinc-900 text-white">
                          Multi-Day / Wedding Elite (From {getEliteStartingPrice()})
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Shoot Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Hyderabad / Dallas / New York"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all"
                        id="booking-input-location"
                      />
                    </div>
                  </div>

                  {/* Requirements / Notes */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                      Requirements
                    </label>
                    <textarea
                      name="requirements"
                      rows={3}
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="Tell us about your event theme, specific trends or songs you like, number of guests, or special moments you want highlighted..."
                      className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#bd1616] focus:border-transparent transition-all"
                      id="booking-textarea-requirements"
                    />
                  </div>

                  {/* Coupon / Promo Code Section */}
                  <div
                    className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2.5"
                    id="booking-form-coupon-section"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="booking-coupon-code"
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
                              id="booking-coupon-code"
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
                            id="booking-form-apply-coupon-btn"
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
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer px-2.5 py-1 font-semibold hover:bg-zinc-900/60 rounded-lg"
                          id="booking-form-remove-coupon-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#bd1616]/25 hover:shadow-xl hover:shadow-[#bd1616]/35 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer border border-[#9e1212]"
                      id="booking-submit-btn"
                    >
                      {isSubmitting ? (
                        <span>PROCESSING YOUR REQUEST...</span>
                      ) : (
                        <>
                          <span>BOOK YOUR SHOOT</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Your contact information is strictly confidential. No spam ever.</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
