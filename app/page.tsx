'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck, CheckCircle, ScanLine, Building2, Users, Truck, CreditCard, Fingerprint, Play, Mic, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FEATURE_IMAGES, SITE_LOGO_ALT, SITE_LOGO_SRC } from '@/lib/siteLogo';
import HeroReportGraphic from '@/components/HeroReportGraphic';

export default function Home() {
  const { loading, user } = useAuth();
  // Logged-in users: hero only (app entry). Guests: full landing page below the hero.
  // Don't block guest marketing on /api/auth/me (it can take a couple seconds).
  // If a user session exists, sections will be hidden once `user` is set.
  const showMarketingSections = !user;
  
  return (
    <div className="bg-white">
      {/* Hero - client mockup layout */}
      <div className="relative w-full overflow-hidden bg-[#f7f8fc] -mt-site-header pt-site-header min-h-0 lg:min-h-[720px]">
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,51,255,0.07) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden
        />
        <div
          className="hero-wave absolute bottom-0 right-0 w-full sm:w-[88%] lg:w-[72%] h-[38%] sm:h-[42%] lg:h-[48%] bg-[#0033FF] pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 pb-24 lg:pb-28">
          <div className="max-w-7xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)] gap-6 sm:gap-8 md:gap-10 lg:gap-x-4 lg:gap-y-6 items-start">
              <div className="relative z-20 min-w-0 text-center lg:text-left flex flex-col gap-4 sm:gap-5 md:gap-6 max-w-xl mx-auto lg:mx-0 lg:max-w-[540px] order-1 lg:col-start-1 lg:row-start-1">
                <h1 className="hero-h1 text-slate-900 hyphens-none">
                  <span className="text-[#FF6600]">Pre-Delivery Inspections</span>{' '}
                  <span className="text-[#0033FF]">Digitised</span>
                </h1>

                <p className="hero-tagline text-slate-600 leading-relaxed max-w-lg">
                  Verify vehicle condition before handover with a defensible digital record.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Digital Compliance',
                      blurb: 'Photo-backed inspection records',
                    },
                    {
                      icon: Zap,
                      title: 'Faster Processing',
                      blurb: 'Reduce turnaround times',
                    },
                    {
                      icon: CheckCircle,
                      title: 'Defect Visibility',
                      blurb: 'Identify issues before delivery',
                    },
                  ].map(({ icon: Icon, title, blurb }) => (
                    <div
                      key={title}
                      className="rounded-xl bg-white/90 backdrop-blur-sm px-3 py-3 shadow-[0_8px_24px_-12px_rgba(0,51,255,0.2)]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#0033FF]/10 flex items-center justify-center mb-2">
                        <Icon className="w-4 h-4 text-[#0033FF]" strokeWidth={2.25} />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{title}</p>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug">{blurb}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0033FF] hover:bg-[#0029CC] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all text-sm sm:text-base w-full sm:w-auto"
                  >
                    Book a Demo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/#how-it-works"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/95 text-slate-800 font-semibold shadow-sm hover:scale-[1.02] transition-all text-sm sm:text-base w-full sm:w-auto ring-1 ring-slate-200"
                  >
                    <Play className="w-4 h-4 text-[#0033FF]" />
                    See How It Works
                  </Link>
                </div>

              </div>

              <div className="relative z-30 w-full min-w-0 flex justify-center lg:justify-end order-2 lg:col-start-2 lg:row-start-1 lg:-mr-8 xl:-mr-14 2xl:-mr-20 overflow-visible px-0 sm:px-2 md:px-4 lg:px-0">
                <HeroReportGraphic />
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
              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Reduce post-delivery disputes</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Document everything before handover to prevent costly disputes.</p>
              </div>

              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Protect warranty claims</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Create verifiable records that support warranty and insurance claims.</p>
              </div>

              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Create a defensible delivery record</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Build comprehensive digital records that stand up in any dispute.</p>
              </div>

              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm overflow-hidden">
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
              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm">
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

              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm">
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

              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm">
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

              <div className="group relative bg-[#EEF2FF] rounded-2xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300 hover:shadow-xl shadow-sm">
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
              {[
                {
                  image: FEATURE_IMAGES.photoVideo,
                  alt: 'Photo images and video walk around - Vehicle inspection',
                  title: 'Photo images and Video walk around',
                  badgeLabel: 'Photo images and Video walk around',
                  BadgeIcon: Camera,
                  description:
                    'Capture stills and video walk-arounds with GPS metadata and timestamps, organized for every inspection.',
                  hoverBorder: 'hover:border-[#0033FF]',
                  titleHover: 'group-hover:text-[#0033FF]',
                  objectPosition: 'object-center',
                },
                {
                  image: FEATURE_IMAGES.vinCapture,
                  alt: 'Vehicle Identity Capture - VIN scanning',
                  title: 'Vehicle Identity Capture',
                  badgeLabel: 'VIN Capture',
                  BadgeIcon: ScanLine,
                  description:
                    'Digitally extract VIN and compliance information from vehicle labels to create a verified pre-delivery record',
                  hoverBorder: 'hover:border-[#FF6600]',
                  titleHover: 'group-hover:text-[#FF6600]',
                  objectPosition: 'object-center',
                },
                {
                  image: FEATURE_IMAGES.gpsPinning,
                  alt: 'GPS Pinning - Location services',
                  title: 'GPS Pinning',
                  badgeLabel: 'GPS Pinning',
                  BadgeIcon: MapPin,
                  description: 'Automatic location tracking for all inspection photos and activities',
                  hoverBorder: 'hover:border-[#0033FF]',
                  titleHover: 'group-hover:text-[#0033FF]',
                  objectPosition: 'object-center',
                },
                {
                  image: FEATURE_IMAGES.voiceToText,
                  alt: 'Voice to text - Inspector documenting findings',
                  title: 'Voice to text',
                  badgeLabel: 'Voice to text',
                  BadgeIcon: Mic,
                  description:
                    'Dictate findings hands-free so inspectors can document quickly and accurately on the lot.',
                  hoverBorder: 'hover:border-[#0033FF]',
                  titleHover: 'group-hover:text-[#0033FF]',
                  objectPosition: 'object-[center_45%]',
                },
                {
                  image: FEATURE_IMAGES.secureCompliant,
                  alt: 'Secure and compliant — enterprise-grade security with audit trails, role-based access, and encrypted data',
                  title: 'Secure & Compliant',
                  badgeLabel: 'Security',
                  BadgeIcon: Shield,
                  description:
                    'Enterprise-grade security with audit trails, role-based access, and encrypted data to keep your inspections safe and compliant.',
                  hoverBorder: 'hover:border-[#0033FF]',
                  titleHover: 'group-hover:text-[#0033FF]',
                  objectPosition: 'object-[center_40%]',
                },
                {
                  image: FEATURE_IMAGES.damageDetection,
                  alt: 'AI damage detection identifying dents and scratches on vehicle bodywork',
                  title: 'Damage detection',
                  badgeLabel: 'AI powered Damage Detection',
                  BadgeIcon: Sparkles,
                  description: 'AI powered damage detection identifying dents and scratches',
                  hoverBorder: 'hover:border-[#0033FF]',
                  titleHover: 'group-hover:text-[#0033FF]',
                  objectPosition: 'object-center',
                },
                {
                  image: FEATURE_IMAGES.analytics,
                  alt: 'Analytics Dashboard - Data visualization',
                  title: 'Analytics Dashboard',
                  description: 'Track inspection metrics and generate comprehensive reports',
                  hoverBorder: 'hover:border-[#FF6600]',
                  titleHover: 'group-hover:text-[#FF6600]',
                  objectPosition: 'object-center',
                  comingSoon: true,
                },
              ].map(({ image, alt, title, badgeLabel, BadgeIcon, description, hoverBorder, titleHover, objectPosition, comingSoon }) => (
                <div
                  key={title}
                  className={`group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 ${hoverBorder} transition-all duration-300 hover:shadow-xl flex flex-col`}
                >
                  <div className="relative h-52 sm:h-56 md:h-60 shrink-0 overflow-hidden bg-slate-100">
                    <Image
                      src={image}
                      alt={alt}
                      fill
                      unoptimized
                      className={`object-cover ${objectPosition} transition-transform duration-500 ease-out group-hover:scale-[1.02] origin-center`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {badgeLabel && BadgeIcon ? (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 inline-flex items-start gap-1.5 max-w-[calc(100%-1.25rem)] px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#0033FF] text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-md leading-snug pointer-events-none">
                        <BadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" aria-hidden />
                        <span>{badgeLabel}</span>
                      </div>
                    ) : null}
                    {comingSoon ? (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-3 py-1.5 bg-[#FF6600] text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-md pointer-events-none">
                        Coming Soon
                      </div>
                    ) : null}
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3
                      className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 ${titleHover} leading-snug min-h-[2.75rem] sm:min-h-[3.25rem]`}
                    >
                      {title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
                  </div>
                </div>
              ))}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/OEM%20and%20leieveyr%20partners.png"
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

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/dealership.png"
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

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/fleet%20and%20leasing.png"
                    alt="Fleet & Leasing Companies - Commercial vehicles"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">Fleet & Leasing</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Fleet & Leasing Companies</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Standardise vehicle delivery across locations and suppliers.</p>
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
              <div className="bg-[#EEF2FF] rounded-xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Secure & Compliant</h3>
                <p className="text-gray-600 text-sm">
                  Enterprise-grade security with audit trails, role-based access, and encrypted data to keep your inspections safe and compliant.
                </p>
              </div>

              <div className="bg-[#EEF2FF] rounded-xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Role-based access controls</h3>
                <p className="text-gray-600 text-sm">Granular permissions and access management</p>
              </div>

              <div className="bg-[#EEF2FF] rounded-xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Audit trails, analytics and inspection history</h3>
                <p className="text-gray-600 text-sm">Complete transparency and traceability</p>
              </div>

              <div className="bg-[#EEF2FF] rounded-xl p-8 border-2 border-[#0033FF]/15 hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] shadow-sm hover:shadow-xl transition-all duration-300">
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

            <div className="bg-[#EEF2FF] rounded-2xl p-5 sm:p-8 md:p-10 lg:p-14 border-2 border-[#0033FF]/15 shadow-xl hover:border-[#0033FF]/40 hover:bg-[#E8EEFF] transition-all duration-300">
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


