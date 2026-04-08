'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Calendar, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck, CheckCircle, ScanLine, Building2, Users, Truck, CreditCard, Fingerprint } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SITE_HERO_MOBILE_GRAPHICS_SRC, SITE_LOGO_ALT, SITE_LOGO_SRC } from '@/lib/siteLogo';

export default function Home() {
  const { loading, user } = useAuth();
  // Logged-in users: hero only (app entry). Guests: full landing page below the hero.
  // Don't block guest marketing on /api/auth/me (it can take a couple seconds).
  // If a user session exists, sections will be hidden once `user` is set.
  const showMarketingSections = !user;
  
  return (
    <div className="bg-white">
      {/* Hero Section - always; marketing + footer below only for guests */}
      <div className="relative bg-gradient-to-b from-[#0033FF] via-[#0029CC] to-[#0033FF] min-h-[min(100dvh,900px)] lg:min-h-0 w-full overflow-x-clip">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <Image
            src="/predelivery-hero-shot.jpg"
            alt="Pre Delivery Inspection Facility"
            fill
            priority
            className="object-cover object-center min-h-full"
            quality={90}
          />
        </div>
        
        {/* Logo blue overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0033FF]/85 via-[#0029CC]/80 to-[#0033FF]/85"></div>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0033FF]/50 via-[#FF6600]/20 to-[#0033FF]/50"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        
        <div className="relative z-20 flex items-start pt-14 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-10 lg:py-12">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-6 pb-12 sm:pb-16 md:pb-8 w-full max-w-full min-w-0 flex-1">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-[7px] sm:gap-2 md:gap-6 lg:gap-x-6 lg:gap-y-0 items-center w-full min-w-0">
              {/* Hero content: H1, tagline, features, Built for, CTAs - all in one div */}
              <div className="min-w-0 w-full pl-0 pr-2 sm:pr-4 text-center lg:text-left flex flex-col gap-[7px] sm:gap-1 md:gap-3 lg:gap-4 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 max-w-2xl overflow-visible mx-auto lg:mx-0">
                <h1 className="hero-h1 hyphens-none mt-16 sm:mt-20 md:mt-12 lg:mt-[4.5rem]">
                  <span className="text-[#FF6600]">Pre-Delivery Inspections</span><span className="text-white"> Digitised</span>
                </h1>
                <p className="hero-tagline text-white/90 leading-relaxed break-words min-w-0">
                  Verify vehicle condition before handover with a defensible digital record.
                </p>

                <div className="text-center lg:text-left min-w-0 overflow-visible">
                  {/* Mobile: two compact pills (3 + 2) — less bulky than one wide block */}
                  <div
                    className="sm:hidden grid grid-cols-2 gap-2 w-full max-w-xl mx-auto lg:mx-0 items-stretch"
                    aria-label="Product highlights"
                  >
                    <div className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 shadow-md px-2.5 py-2 min-w-0">
                      <ul className="flex flex-col items-start gap-1.5 text-[0.75rem] leading-snug text-white/92">
                        <li className="flex items-start gap-1.5 w-full text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] shrink-0 mt-0.5" aria-hidden />
                          <span className="min-w-0 break-words">Photo images</span>
                        </li>
                        <li className="flex items-start gap-1.5 w-full text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] shrink-0 mt-0.5" aria-hidden />
                          <span className="min-w-0 break-words">OCR Scanner</span>
                        </li>
                        <li className="flex items-start gap-1.5 w-full text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] shrink-0 mt-0.5" aria-hidden />
                          <span className="min-w-0 break-words">GPS Pinning</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 shadow-md px-2.5 py-2 min-w-0 flex flex-col justify-center">
                      <ul className="flex flex-col items-start gap-1.5 text-[0.75rem] leading-snug text-white/92">
                        <li className="flex items-start gap-1.5 w-full text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] shrink-0 mt-0.5" aria-hidden />
                          <span className="min-w-0 break-words">Analytics Dashboard</span>
                        </li>
                        <li className="flex items-start gap-1.5 w-full text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600] shrink-0 mt-0.5" aria-hidden />
                          <span className="min-w-0 break-words">Secure and Compliant</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* sm+: single pill row */}
                  <div className="hidden sm:block rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg px-2.5 py-2 sm:px-4 sm:py-2.5 w-fit max-w-full mx-auto lg:mx-0">
                    <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-x-1.5 gap-y-1 sm:gap-x-2 sm:gap-y-1.5 text-white/95 hero-features">
                      <li className="flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Photo images</span>
                      </li>
                      <li className="flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>OCR Scanner</span>
                      </li>
                      <li className="flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>GPS Pinning</span>
                      </li>
                      <li className="flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Analytics Dashboard</span>
                      </li>
                      <li className="flex items-center gap-1 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Secure and Compliant</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-white/70 hero-built-for max-w-2xl break-words min-w-0">
                  Built for OEM's, logistics delivery partners, dealerships, and fleets who need inspection certainty before delivery.
                </p>

                <div className="mt-3 lg:mt-0 text-center lg:text-left flex flex-col items-center lg:items-start">
                  <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                    <Link href="/contact" className="bg-[#0033FF] hover:bg-[#0029CC] text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 border border-white/30 text-sm sm:text-base">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Book a demo</span>
                    </Link>
                    <Link href="/contact" className="bg-[#FF6600] hover:bg-[#E65C00] text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 md:px-8 md:py-4 rounded-full border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-2 shadow-lg text-sm sm:text-base">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Talk to sales</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile app hero graphic - centered on mobile; on lg right column spanning 2 rows */}
              <div className="relative w-full min-w-0 flex flex-col items-center justify-center lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 mt-3 mb-3 lg:mt-24 lg:mb-0">
                <div className="hero-phone w-full max-h-[min(62vh,560px)] sm:max-h-[min(64vh,600px)] md:max-h-[min(62vh,620px)] lg:max-h-[min(58vh,600px)] mx-auto flex flex-col items-center">
                  <Image
                    src={SITE_HERO_MOBILE_GRAPHICS_SRC}
                    alt="Pre Delivery mobile app — verified before your drive"
                    width={7411}
                    height={7263}
                    className="w-[min(560px,100%)] max-w-full h-auto max-h-[min(58vh,480px)] sm:max-h-[min(62vh,520px)] md:max-h-[min(60vh,540px)] lg:max-h-[min(54vh,560px)] object-contain object-center drop-shadow-2xl"
                    style={{ width: 'min(560px, 100%)', height: 'auto' }}
                    priority
                    sizes="(max-width: 640px) 92vw, (max-width: 768px) 560px, (max-width: 1024px) 560px, (max-width: 1280px) 600px, 640px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMarketingSections && (
        <>
      {/* Why Predelivery.ai? - White section, blue/orange accents (Spectral-style) */}
      <div id="benefits" className="relative bg-white pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#0033FF] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0033FF]/10 rounded-full border border-[#0033FF]/20">Why Choose Us</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                Why Predelivery.ai?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Vehicle issues discovered after delivery and registration lead to disputes, warranty friction, and reputational risk.
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-[#FF6600]/10 rounded-full border border-[#FF6600]/20">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  Pre-delivery replaces uncertainty with proof.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Reduce post-delivery disputes</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Document everything before handover to prevent costly disputes.</p>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Protect warranty claims</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Create verifiable records that support warranty and insurance claims.</p>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Create a defensible delivery record</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Build comprehensive digital records that stand up in any dispute.</p>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Prevent post registration risks</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Identify and resolve issues before vehicle registration and delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works - White section, blue/orange accents (Spectral-style) */}
      <div id="how-it-works" className="relative bg-gray-50 pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#FF6600] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF6600]/10 rounded-full border border-[#FF6600]/20">Simple Process</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                How it works
              </h2>
              <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-2">
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Start with a <span className="font-semibold text-[#0033FF]">comprehensive inspection</span>, <span className="font-semibold text-[#FF6600]">verify all vehicle details</span> with digital documentation, and <span className="font-semibold text-[#0033FF]">deliver with confidence</span> knowing every detail is recorded and verified.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-[#0033FF] text-white rounded-full flex items-center justify-center font-extrabold text-xl z-30 border-4 border-white shadow-lg">
                  1
                </div>
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                    <ClipboardCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-[#0033FF]">Inspect</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Complete a comprehensive digital inspection checklist covering all vehicle components and systems.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-[#FF6600] text-white rounded-full flex items-center justify-center font-extrabold text-xl z-30 border-4 border-white shadow-lg">
                  2
                </div>
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-[#FF6600]">Verify</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Document vehicle condition with photos, capture VIN data, and record compliance information automatically.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-[#0033FF] text-white rounded-full flex items-center justify-center font-extrabold text-xl z-30 border-4 border-white shadow-lg">
                  3
                </div>
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                    <FileCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-[#0033FF]">Sign Off</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Approve the inspection with digital signatures, creating a complete and legally defensible record.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-[#FF6600] text-white rounded-full flex items-center justify-center font-extrabold text-xl z-30 border-4 border-white shadow-lg">
                  4
                </div>
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                    <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-[#FF6600]">Deliver</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Hand over the vehicle with complete confidence, backed by a verified digital inspection record.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Powerful Features - White section, cards with blue/orange accents (Spectral-style) */}
      <div id="features" className="relative bg-white pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#0033FF] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0033FF]/10 rounded-full border border-[#0033FF]/20">Core Features</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                Powerful Features
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                Everything you need for comprehensive vehicle inspections
              </p>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Our tech verifies your new vehicle before handover and registration, capturing condition, compliance, and proof so issues are identified and resolved before the keys are released.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80"
                    alt="Photo images and video walk around - Vehicle inspection"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full max-w-[calc(100%-2rem)] text-left leading-tight">
                    Photo images and Video walk around
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Photo images and Video walk around</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Capture stills and video walk-arounds with GPS metadata and timestamps, organized for every inspection.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80"
                    alt="Vehicle Identity Capture - VIN scanning"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">VIN Capture</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Vehicle Identity Capture</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Digitally extract VIN and compliance information from vehicle labels to create a verified pre-delivery record</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80"
                    alt="GPS Pinning - Location services"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">GPS Pinning</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">GPS Pinning</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Automatic location tracking for all inspection photos and activities</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80"
                    alt="Analytics Dashboard - Data visualization"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">Analytics</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Analytics Dashboard</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Track inspection metrics and generate comprehensive reports</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80"
                    alt="Secure & Compliant - Data security"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">Security</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Secure & Compliant</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Bank-level security with audit trails and compliance records</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80"
                    alt="Fast & Efficient - Streamlined workflow"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">Efficiency</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Fast & Efficient</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Streamlined workflow reduces inspection time by up to 60%</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=600&fit=crop&q=80"
                    alt="Voice to text - Inspector documenting findings"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">Voice to text</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Voice to text</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Dictate findings hands-free so inspectors can document quickly and accurately on the lot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who It's For? - White section, cards with blue/orange accents (Spectral-style) */}
      <div className="relative bg-gray-50 pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#FF6600] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF6600]/10 rounded-full border border-[#FF6600]/20">Target Audience</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                Who It's For?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop&q=80"
                    alt="Dealerships - Car showroom"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">Dealerships</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Dealerships</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Reduce post-delivery disputes and protect handover quality.</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80"
                    alt="Fleet & Leasing Companies - Commercial vehicles"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">Fleet & Leasing</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Fleet & Leasing Companies</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Standardise vehicle delivery across locations and suppliers.</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80"
                    alt="OEM & Delivery Partners - Manufacturing and delivery"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">OEM Partners</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">OEM & Delivery Partners</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Enforce consistent pre-delivery inspection standards at scale.</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80"
                    alt="Insurers & Financiers - Insurance and finance"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">Insurance</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Insurers & Financiers</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Access verified condition records that stand up in claims and disputes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance and Trust - White section, blue/orange accents (Spectral-style) */}
      <div className="relative bg-white pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#0033FF] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0033FF]/10 rounded-full border border-[#0033FF]/20">Trust & Security</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                Compliance and Trust
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#0033FF] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Enterprise-grade data security</h3>
                <p className="text-gray-600 text-sm">Bank-level encryption and security protocols</p>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#FF6600] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Role-based access controls</h3>
                <p className="text-gray-600 text-sm">Granular permissions and access management</p>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#0033FF] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Audit trails, analytics and inspection history</h3>
                <p className="text-gray-600 text-sm">Complete transparency and traceability</p>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#FF6600] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Built by automotive experts</h3>
                <p className="text-gray-600 text-sm">Deep inspection and automotive data experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing - Light section, blue/orange CTA (Spectral-style) */}
      <div className="relative bg-gray-50 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block mb-4 sm:mb-6 text-[#FF6600] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF6600]/10 rounded-full border border-[#FF6600]/20">Flexible Pricing</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                Pricing
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 lg:p-14 border-2 border-gray-200 shadow-xl hover:border-[#0033FF]/40 transition-all duration-300">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-xl bg-[#FF6600] flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xl sm:text-2xl text-gray-900 font-semibold leading-relaxed">
                  Flexible plans based on vehicle volume and business needs.
                </p>
                <p className="text-lg sm:text-xl text-gray-600">
                  Per-vehicle and enterprise options available.
                </p>
                <div className="pt-6">
                  <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-all duration-300">
                    <Phone className="w-5 h-5" />
                    Contact sales for pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Logo blue to orange gradient, white text */}
      <div className="relative bg-gradient-to-br from-[#0033FF] via-[#0029CC] to-[#FF6600] pt-6 sm:pt-8 pb-6 sm:pb-8 overflow-hidden">
        {/* Speed lines effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255,255,255,0.1) 100px, rgba(255,255,255,0.1) 200px)'}}></div>
        </div>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 px-2">
              Ready to Transform Your Inspections?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              Join leading OEM and delivery partners who trust our platform for accurate, defensible pre-delivery inspections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-white text-[#0033FF] font-bold px-10 py-4 rounded-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-2 hover:shadow-[#0033FF]/50 text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold px-10 py-4 rounded-lg border-2 border-white/30 transition-all flex items-center gap-2 hover:scale-105 text-lg shadow-xl">
                <Phone className="w-5 h-5" />
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Logo blue background, white text */}
      <footer id="contact" className="bg-gradient-to-b from-[#0029CC] via-[#0033FF] to-[#0029CC] border-t border-white/20 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-4 group hover:opacity-90 transition-opacity">
                <Image
                  src={SITE_LOGO_SRC}
                  alt={SITE_LOGO_ALT}
                  width={322}
                  height={221}
                  className="h-28 sm:h-24 md:h-28 w-auto object-contain"
                  unoptimized
                />
              </Link>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4">
                Comprehensive pre-delivery inspection management system for OEM's, vehicle transport partners, dealerships, and fleets.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm">Features</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm">How it Works</a>
                </li>
                <li>
                  <a href="#benefits" className="text-white/70 hover:text-white transition-colors text-sm">Benefits</a>
                </li>
                <li>
                  <Link href="/login" className="text-white/70 hover:text-white transition-colors text-sm">Login</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Legal &amp; resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/terms" className="text-white/70 hover:text-white transition-colors text-sm">Terms &amp; Conditions</Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Support</a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Contact Us</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className="text-white/70 hover:text-white transition-colors text-sm">
                    Contact Form
                  </Link>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-white" />
                    <a href="mailto:info@predelivery.ai" className="hover:text-white transition-colors">info@predelivery.ai</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#0033FF]/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/70 text-sm text-center md:text-left">
                © 2025 Pre Delivery Inspection. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                <Link href="/terms" className="text-white/70 hover:text-white transition-colors text-sm">Terms &amp; Conditions</Link>
                <Link href="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              </div>
            </div>
          </div>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}


