'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Calendar, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck, CheckCircle, ScanLine, Building2, Users, Truck, CreditCard, Fingerprint } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        // Not logged in - that's okay
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const isLoggedIn = !!user;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - SiteGround AI Studio Style */}
      <div className="relative bg-gradient-to-b from-[#0033FF] via-[#0029CC] to-[#0033FF] min-h-screen w-full overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/predelivery-hero-shot.jpg"
            alt="Pre Delivery Inspection Facility"
            fill
            priority
            className="object-cover"
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
        
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12 relative z-20 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
              {/* Left: Hero content */}
              <div className="max-w-2xl w-full mx-0 text-left space-y-4 sm:space-y-5 lg:space-y-6 lg:col-span-7">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-[#FF6600]">Pre-Delivery Inspections</span>
                  <span className="text-white">, Digitised</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed break-words">
                  Verify vehicle condition, compliance, and documentation before handover and registration with a single, defensible digital record.
                </p>

                {/* Feature points - 2 rows on mobile, 1 row on sm+, left-aligned, glass effect */}
                <div className="text-left">
                  <div className="rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg px-4 py-3 sm:px-5 sm:py-2.5 w-fit max-w-full">
                    <ul className="flex flex-wrap sm:flex-nowrap items-center justify-start gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-0 text-white/95 text-xs sm:text-xs">
                      <li className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Photo Gallery</span>
                      </li>
                      <li className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Barcode Scanner</span>
                      </li>
                      <li className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>GPS Tracking</span>
                      </li>
                      <li className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Analytics Dashboard</span>
                      </li>
                      <li className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#FF6600] shrink-0" aria-hidden />
                        <span>Secure & Compliant</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* New Inspection & View Inspections - left, after dotted content, above CTA */}
                <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
                  <Link 
                    href="/inspection/new"
                    className="flex-1 min-w-[140px] group relative bg-gradient-to-r from-[#0033FF] to-[#0029CC] hover:from-[#0033FF]/95 hover:to-[#0029CC]/95 text-white font-semibold px-6 py-4 sm:px-8 sm:py-5 rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 border border-white/30 text-base sm:text-lg"
                  >
                    <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
                    <span>New Inspection</span>
                  </Link>
                  <Link 
                    href="/inspections"
                    className="flex-1 min-w-[140px] group relative bg-[#FF6600] hover:bg-[#E65C00] text-white font-semibold px-6 py-4 sm:px-8 sm:py-5 rounded-xl border-2 border-white/30 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl text-base sm:text-lg"
                  >
                    <Search className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
                    <span>View Inspections</span>
                  </Link>
                </div>
              </div>

              {/* Right: AutoGrab-style composite - vehicle anchor with valuation card overlapping left */}
              <div className="hidden lg:block relative w-full min-h-[380px] lg:col-span-5">
                {/* Vehicle / Care AG - main anchor, right side (front) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[70%] max-w-md z-20">
                  <div className="overflow-hidden">
                    <Image
                      src="/Care_AG.png"
                      alt="Care AG - Automotive platform"
                      width={420}
                      height={300}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                {/* Valuation card - back, left of vehicle */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] max-w-[280px] z-10">
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src="/Valuation.jpg"
                      alt="Vehicle valuation"
                      width={280}
                      height={340}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Section - left-aligned with heading */}
            <div className="mt-12 text-left">
              <div className="flex flex-row flex-wrap items-start sm:items-center justify-start gap-3">
                <Link href="/contact" className="bg-[#0033FF] hover:bg-[#0029CC] text-white font-semibold px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 border border-white/30">
                  <Calendar className="w-4 h-4" />
                  <span>Book a demo</span>
                </Link>
                <Link href="/contact" className="bg-[#FF6600] hover:bg-[#E65C00] text-white font-semibold px-6 py-2.5 rounded-full border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-2 shadow-lg">
                  <Phone className="w-4 h-4" />
                  <span>Talk to sales</span>
                </Link>
              </div>
              <p className="text-white/70 text-base mt-4 max-w-2xl break-words">
                Built for dealerships, fleets, OEM delivery partners, and insurers who need inspection certainty before delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <>
      {/* Why Predelivery.ai? - White section, blue/orange accents (Spectral-style) */}
      <div id="benefits" className="relative bg-white pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#0033FF] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0033FF]/10 rounded-full border border-[#0033FF]/20">Why Choose Us</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                Why Predelivery.ai?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Vehicle issues discovered after delivery and registration lead to disputes, rework, warranty friction, and reputational risk.
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#FF6600]/10 rounded-full border border-[#FF6600]/20">
                <div className="w-2 h-2 bg-[#FF6600] rounded-full animate-pulse"></div>
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

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">Create a defensible delivery record</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Build comprehensive digital records that stand up in any dispute.</p>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl overflow-hidden">
                <div className="w-14 h-14 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Prevent post registration risks</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Identify and resolve issues before vehicle registration and delivery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works - White section, blue/orange accents (Spectral-style) */}
      <div id="how-it-works" className="relative bg-gray-50 pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <span className="inline-block mb-4 sm:mb-6 text-[#FF6600] font-bold text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF6600]/10 rounded-full border border-[#FF6600]/20">Simple Process</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 px-2">
                How it works
              </h2>
              <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-2">
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Start with a <span className="font-semibold text-[#0033FF]">comprehensive inspection</span>, then <span className="font-semibold text-[#FF6600]">verify all vehicle details</span> with digital documentation, <span className="font-semibold text-[#FF6600]">obtain approval</span> through digital signatures, and finally <span className="font-semibold text-[#0033FF]">deliver with confidence</span> knowing every detail is recorded and verified.
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

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-[#FF6600] text-white rounded-full flex items-center justify-center font-extrabold text-xl z-30 border-4 border-white shadow-lg">
                  3
                </div>
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                    <FileCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-[#FF6600]">Sign Off</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Approve the inspection with digital signatures, creating a complete and legally defensible record.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-[#0033FF] text-white rounded-full flex items-center justify-center font-extrabold text-xl z-30 border-4 border-white shadow-lg">
                  4
                </div>
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
                    <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-[#0033FF]">Deliver</h3>
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
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
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
                    alt="Photo Gallery - Vehicle inspection photography"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">Photo Gallery</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Photo Gallery</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Capture and organize inspection photos with GPS metadata and timestamps</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#0033FF] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80"
                    alt="Vehicle Identity Capture - VIN scanning"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0033FF] text-white text-xs font-bold rounded-full">VIN Capture</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#0033FF]">Vehicle Identity Capture</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Digitally extract VIN and compliance information from vehicle labels to create a verified pre-delivery record</p>
                </div>
              </div>

              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6600] transition-all duration-300 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80"
                    alt="GPS Tracking - Location services"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF6600] text-white text-xs font-bold rounded-full">GPS Tracking</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#FF6600]">GPS Tracking</h3>
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
            </div>
          </div>
        </div>
      </div>

      {/* Who It's For? - White section, cards with blue/orange accents (Spectral-style) */}
      <div className="relative bg-gray-50 pt-6 sm:pt-8 pb-6 sm:pb-8 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
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
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
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

              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#FF6600] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#FF6600] flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Audit trails, analytics and inspection history</h3>
                <p className="text-gray-600 text-sm">Complete transparency and traceability</p>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-[#0033FF] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-[#0033FF] flex items-center justify-center mb-6">
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
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
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
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 px-2">
              Ready to Transform Your Inspections?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              Join leading dealerships and fleets who trust our platform for accurate, defensible pre-delivery inspections.
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
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-4 group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0033FF] to-[#0029CC] flex items-center justify-center mr-3 border border-[#0033FF]/30 group-hover:scale-110 transition-transform shadow-lg shadow-[#0033FF]/30">
                  <span className="text-white font-bold text-sm">PD</span>
                </div>
                <span className="text-xl font-bold text-white">Pre Delivery</span>
              </Link>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Comprehensive pre-delivery inspection management system for dealerships, fleets, and OEM partners.
              </p>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-[#0033FF]" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Features</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">How it Works</a>
                </li>
                <li>
                  <a href="#benefits" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Benefits</a>
                </li>
                <li>
                  <Link href="/login" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Login</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">API Reference</a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Support</a>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Contact Us</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">
                    Contact Form
                  </Link>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0033FF]" />
                    <a href="mailto:info@predelivery.ai" className="hover:text-[#0033FF] transition-colors">info@predelivery.ai</a>
                  </div>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0033FF]" />
                    <span>Sales: +1 (555) 123-4567</span>
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
              <div className="flex items-center gap-6">
                <a href="#" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Terms of Service</a>
                <Link href="/privacy" className="text-white/70 hover:text-[#0033FF] transition-colors text-sm">Privacy Policy</Link>
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


