import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Instagram,
  Youtube,
  Facebook,
  ArrowUpRight,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Event Reels',
    date: '',
    location: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hi Snap Shots, I would like to enquire about booking a shoot in Telangana / USA.`
    );
    window.open(`https://wa.me/${siteConfig.business.whatsapp.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 bg-transparent min-h-screen text-white">
      {/* Background Ambient Glow */}
      <div
        className="absolute pointer-events-none top-24 left-1/2 -translate-x-1/2"
        style={{
          width: '760px',
          height: '420px',
          opacity: 0.16,
          borderRadius: '500px',
          background: 'radial-gradient(circle, #bd1616 0%, #200000 60%, transparent 80%)',
          filter: 'blur(110px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#bd1616]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#bd1616]">
              GET IN TOUCH
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Let&apos;s Create Something Unforgettable
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Have an upcoming wedding, private celebration, brand campaign, or corporate gala? Reach out directly or send us an inquiry.
          </p>
        </div>

        {/* 2-Column Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Direct Contact Info & Highlights (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Priority Direct WhatsApp Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#bd1616] text-white shadow-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instant WhatsApp Desk</h3>
                  <span className="text-xs text-[#ffc800] font-medium flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#ffc800] animate-pulse" />
                    Live &bull; Average response 5–15 mins
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Connect directly with our shoot coordinator for immediate creator availability, rate estimates, and instant booking locks.
              </p>

              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#bd1616]/30 transition-all hover:scale-[1.02] border border-[#9e1212] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CHAT ON WHATSAPP (+91 90143 19818)</span>
              </button>
            </div>

            {/* Direct Contact Details Cards */}
            <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 space-y-5 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-900 pb-3">
                Direct Contact Information
              </h3>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-[#bd1616] shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-medium block">Phone Hotline</span>
                  <a
                    href="tel:+919014319818"
                    className="text-sm font-bold text-white hover:text-[#bd1616] transition-colors"
                  >
                    +91 90143 19818
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-[#bd1616] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-medium block">Email Desk</span>
                  <a
                    href="mailto:bookings@snapshotstudio.com"
                    className="text-sm font-bold text-white hover:text-[#bd1616] transition-colors block"
                  >
                    bookings@snapshotstudio.com
                  </a>
                  <a
                    href="mailto:hello@snapshotstudio.com"
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    hello@snapshotstudio.com
                  </a>
                </div>
              </div>

              {/* Locations */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-[#bd1616] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-medium block">Operating Regions</span>
                  <span className="text-sm font-bold text-white block">Telangana, India</span>
                  <span className="text-xs text-zinc-400">Hyderabad, Warangal, Karimnagar &amp; surrounding districts</span>
                  <span className="text-sm font-bold text-white block mt-1.5">United States (USA)</span>
                  <span className="text-xs text-zinc-400">Dallas, TX &bull; New York, NY &bull; San Jose, CA</span>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5 pt-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-[#bd1616] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-medium block">Working Hours</span>
                  <span className="text-sm font-bold text-white">Monday &ndash; Sunday: 8:00 AM &ndash; 10:00 PM IST</span>
                  <span className="text-xs text-zinc-400 block">Shoot crews operate 24/7 on booked schedule</span>
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Follow Our Works</span>
                <span className="text-[11px] text-zinc-400">@snapshots_by_abhi</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={siteConfig.business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 hover:bg-[#bd1616] text-white transition-colors border border-zinc-800"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.business.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 hover:bg-[#bd1616] text-white transition-colors border border-zinc-800"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.business.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 hover:bg-[#bd1616] text-white transition-colors border border-zinc-800"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Booking Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl relative">
              {submitted ? (
                <div className="text-center py-12 space-y-4 animate-in fade-in duration-300">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 text-[#bd1616] mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white">Inquiry Received!</h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.name}</strong>. Our shoot coordinator has received your request and will contact you via WhatsApp / phone shortly.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleWhatsAppDirect}
                      className="px-6 py-3 rounded-full bg-[#bd1616] hover:bg-[#9e1212] text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all"
                    >
                      Connect on WhatsApp Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-3 rounded-full border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-zinc-900 pb-4 mb-4">
                    <h2 className="text-xl sm:text-2xl font-black text-white">Send Us a Direct Message</h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Fill out this quick form and we&apos;ll get back to you with custom availability and pricing.
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Your Full Name <span className="text-[#bd1616]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-11 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        WhatsApp / Phone <span className="text-[#bd1616]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 90143 19818"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="yourname@gmail.com"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Service & Date Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Service Needed
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors"
                      >
                        {siteConfig.services.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Custom Multi-Day Shoot">Custom Multi-Day Shoot</option>
                        <option value="Brand Retainer Package">Brand Retainer Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Tentative Shoot Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Shoot Location / City
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Hyderabad / Warangal / Dallas, TX / New York"
                      className="w-full h-11 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Shoot Details or Questions
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your event, hours required, specific shots, or preferred style..."
                      className="w-full p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-[#bd1616] focus:ring-1 focus:ring-[#bd1616] text-white text-sm outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-[#bd1616]/40 transition-all hover:scale-[1.01] active:scale-[0.98] border border-[#9e1212] cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>SENDING INQUIRY...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-white" />
                          <span>SEND INQUIRY TO SNAP SHOTS</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
