/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { WelcomePopup } from './components/WelcomePopup';
import { LogoProvider } from './context/LogoContext';
import { CountryProvider } from './context/CountryContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { SEOHead } from './components/SEOHead';
import { PackageItem } from './types';
import { trackBookShootClick } from './services/analyticsService';

// Code-split non-critical routes and heavy modals to slash initial JS execution & bundle size
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const FaqsPage = lazy(() => import('./pages/FaqsPage').then((m) => ({ default: m.FaqsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const BookingModal = lazy(() => import('./components/BookingModal').then((m) => ({ default: m.BookingModal })));
const AdminLoginModal = lazy(() => import('./components/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal })));

// Scroll restoration helper on route transition
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function MainAppLayout() {
  const [selectedService, setSelectedService] = useState<string>('Event Reels');
  const [selectedPackage, setSelectedPackage] = useState<string>('event-reel');
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  const openBookingModal = (service?: string, pkgId?: string, coupon?: string, triggerLocation = 'navigation') => {
    trackBookShootClick({
      location: triggerLocation,
      service,
      packageId: pkgId,
    });
    if (service) setSelectedService(service);
    if (pkgId) setSelectedPackage(pkgId);
    if (coupon !== undefined) setSelectedCoupon(coupon);
    setIsBookingModalOpen(true);
  };

  const handleSelectPackage = (pkgId: string) => {
    openBookingModal(undefined, pkgId, undefined, 'pricing_package_card');
  };

  const handleSelectService = (serviceTitle: string) => {
    openBookingModal(serviceTitle, undefined, undefined, 'services_card');
  };

  // Universal delegate listener to ensure any "BOOK A SHOOT" button triggers the modal
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a');
      if (!clickable) return;

      if (clickable.closest('#booking-modal-form-content') || clickable.closest('#booking-modal-success')) {
        return;
      }
      if (clickable.id === 'booking-submit-btn') {
        return;
      }

      // Avoid intercepting external links, whatsapp, phone, email
      const href = clickable.getAttribute('href');
      if (
        href &&
        (href.startsWith('http') ||
          href.startsWith('tel:') ||
          href.startsWith('mailto:') ||
          href.includes('wa.me') ||
          href.includes('whatsapp.com') ||
          href.includes('api.whatsapp.com'))
      ) {
        return;
      }

      const text = (clickable.textContent || '').trim().toUpperCase();
      const isBookingTrigger =
        text.includes('BOOK A SHOOT') ||
        text.includes('BOOK NOW') ||
        text.includes('BOOK YOUR SHOOT') ||
        text.includes('BOOK THIS SERVICE') ||
        text.includes('BOOK SNAP SHOTS ELITE') ||
        text.includes('START STEP 01') ||
        clickable.id === 'header-book-btn' ||
        clickable.id === 'footer-book-cta-btn' ||
        clickable.id === 'menu-book-now-btn' ||
        clickable.id === 'wedding-plan-book-btn';

      if (isBookingTrigger) {
        trackBookShootClick({
          location: 'site_cta_click',
          buttonText: (clickable.textContent || '').trim().slice(0, 60),
          buttonId: clickable.id || undefined,
        });
        openBookingModal();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1a0000] via-35% to-[#000000] text-white selection:bg-[#bd1616] selection:text-white relative overflow-x-hidden">
      {/* Background Gradient Mesh with Black & Red */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
        aria-hidden="true"
      >
        {/* Top Hero Radial Glow in Red & Black */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(189,22,22,0.18)_0%,rgba(117,13,13,0.08)_45%,transparent_75%)] blur-3xl" />

        {/* Mid-Left Black & Red Ambient Glow */}
        <div className="absolute top-[28%] -left-52 w-[850px] h-[850px] bg-[radial-gradient(ellipse_at_center,rgba(189,22,22,0.12)_0%,rgba(117,13,13,0.06)_50%,transparent_75%)] blur-3xl animate-pulse-soft" />

        {/* Mid-Right Black & Red Ambient Glow */}
        <div className="absolute top-[58%] -right-52 w-[900px] h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(189,22,22,0.14)_0%,rgba(117,13,13,0.06)_50%,transparent_75%)] blur-3xl" />

        {/* Bottom Black & Red Glow */}
        <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(189,22,22,0.14)_0%,rgba(117,13,13,0.08)_45%,transparent_75%)] blur-3xl" />

        {/* Subtle Vignette Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      </div>

      <ScrollToTop />
      <SEOHead />

      {/* Sticky Navigation Header with Multi-Page Routing */}
      <Header onBookClick={() => openBookingModal()} />

      {/* Main Routed Content */}
      <main className="relative z-10">
        <Routes>
          {/* Home Page: Clean Landing Page (Services & FAQs removed as requested) */}
          <Route
            path="/"
            element={
              <HomePage
                onBookClick={(pkgId) => openBookingModal(undefined, pkgId)}
                onSelectPackage={handleSelectPackage}
              />
            }
          />

          {/* Separate Dedicated Services Page */}
          <Route
            path="/services"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <ServicesPage onBookService={handleSelectService} />
              </Suspense>
            }
          />

          {/* Separate Dedicated FAQs Page */}
          <Route
            path="/faqs"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <FaqsPage onOpenBooking={() => openBookingModal()} />
              </Suspense>
            }
          />

          {/* Separate Dedicated Contact Us Page */}
          <Route
            path="/contact"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <ContactPage />
              </Suspense>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive In-Site WhatsApp Widget (Bottom-Right) */}
      <FloatingWhatsApp onOpenBooking={() => openBookingModal()} />

      {/* Professional Centered Booking Popup / Modal - Lazy loaded */}
      {isBookingModalOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedCoupon('');
            }}
            initialService={selectedService}
            initialPackage={selectedPackage}
            initialCoupon={selectedCoupon}
          />
        </Suspense>
      )}

      {/* Timed Welcome Privilege Offer Popup */}
      <WelcomePopup onClaimOffer={() => openBookingModal(undefined, undefined, 'SNAP15')} />

      {/* Admin Login Modal - Lazy loaded */}
      <Suspense fallback={null}>
        <AdminLoginModal />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <CountryProvider>
        <LogoProvider>
          <BrowserRouter>
            <MainAppLayout />
          </BrowserRouter>
        </LogoProvider>
      </CountryProvider>
    </AdminAuthProvider>
  );
}
