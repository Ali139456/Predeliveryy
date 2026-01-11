'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Sparkles, Calendar, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck, CheckCircle } from 'lucide-react';

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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-black min-h-screen w-full">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/predelivery-hero-shot.jpg"
            alt="Pre Delivery Inspection Facility"
            fill
            priority
            className="object-cover opacity-60"
            quality={90}
          />
        </div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-black/80"></div>
        
        {/* Subtle light streaks effect */}
        <div className="absolute inset-0 opacity-20 z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#3833FF] to-transparent"></div>
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#3833FF] to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-0 pb-4 sm:pb-6 lg:pb-8 relative z-20 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full py-2 sm:py-3">
            {/* Main Title - Centered */}
            <div className="text-center mb-2 sm:mb-3 lg:mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-1.5 sm:mb-2">
                Pre-Delivery Inspections, Digitised
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-white/90 max-w-3xl mx-auto mb-2 sm:mb-3 lg:mb-4 px-4">
                Verify vehicle condition, compliance, and documentation before handover and registration — with a single, defensible digital record.
              </p>

              {/* Action Cards Section */}
              <div className="max-w-5xl mx-auto mb-2 sm:mb-3 lg:mb-4 px-4">
                {/* Large Cards Row - New Inspection & View Inspections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-2 sm:mb-3">
                  <Link href="/inspection/new" className="group relative bg-gradient-to-br from-[#3833FF] via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border-2 border-[#3833FF]/80 shadow-2xl shadow-[#3833FF]/40 hover:shadow-[#3833FF]/60 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Decorative background pattern - More visible */}
                    <div className="absolute inset-0">
                      {/* Large decorative circles - responsive sizes */}
                      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/30 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-28 h-28 sm:w-40 sm:h-40 lg:w-56 lg:h-56 bg-purple-300/40 rounded-full blur-3xl"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-blue-300/35 rounded-full blur-2xl"></div>
                      {/* Grid pattern overlay - more visible */}
                      <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.4) 2px, transparent 0)', backgroundSize: '32px 32px'}}></div>
                      {/* Decorative geometric shapes - hidden on mobile */}
                      <div className="hidden sm:block absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 lg:w-24 lg:h-24 border-2 border-white/30 rounded-lg rotate-45"></div>
                      <div className="hidden sm:block absolute bottom-4 left-4 lg:bottom-8 lg:left-8 w-8 h-8 lg:w-16 lg:h-16 border-2 border-white/25 rounded-full"></div>
                    </div>
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Floating particles effect - hidden on mobile */}
                    <div className="hidden sm:block absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="hidden sm:block absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-cyan-300 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <FileCheck className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#3833FF]" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 group-hover:text-white/95 transition-colors">New Inspection</h3>
                      <p className="text-white/90 text-xs sm:text-sm font-medium">Start a new pre-delivery inspection</p>
                    </div>
                  </Link>

                  <Link href="/inspections" className="group relative bg-gradient-to-br from-[#3833FF] via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border-2 border-[#3833FF]/80 shadow-2xl shadow-[#3833FF]/40 hover:shadow-[#3833FF]/60 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Decorative background pattern - More visible */}
                    <div className="absolute inset-0">
                      {/* Large decorative circles - responsive sizes */}
                      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/30 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-28 h-28 sm:w-40 sm:h-40 lg:w-56 lg:h-56 bg-purple-300/40 rounded-full blur-3xl"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-blue-300/35 rounded-full blur-2xl"></div>
                      {/* Grid pattern overlay - more visible */}
                      <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(255,255,255,0.4) 2px, transparent 0)', backgroundSize: '32px 32px'}}></div>
                      {/* Decorative geometric shapes - hidden on mobile */}
                      <div className="hidden sm:block absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 lg:w-24 lg:h-24 border-2 border-white/30 rounded-lg rotate-45"></div>
                      <div className="hidden sm:block absolute bottom-4 left-4 lg:bottom-8 lg:left-8 w-8 h-8 lg:w-16 lg:h-16 border-2 border-white/25 rounded-full"></div>
                    </div>
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Floating particles effect - hidden on mobile */}
                    <div className="hidden sm:block absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="hidden sm:block absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-cyan-300 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <Search className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#3833FF]" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 group-hover:text-white/95 transition-colors">View Inspections</h3>
                      <p className="text-white/90 text-xs sm:text-sm font-medium">Browse and manage inspections</p>
                    </div>
                  </Link>
                </div>

                {/* Small Cards Row - Photo Gallery, GPS Tracking, Analytics */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto mb-2 sm:mb-3">
                  <div className="relative bg-[#3833FF] rounded-lg p-3 sm:p-4 border-2 border-[#3833FF]/80 shadow-lg shadow-[#3833FF]/30 overflow-hidden">
                    {/* Subtle shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center mb-2 shadow-md">
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">Photo Gallery</h4>
                    </div>
                  </div>

                  <div className="relative bg-blue-600 rounded-lg p-3 sm:p-4 border-2 border-blue-500/80 shadow-lg shadow-blue-600/30 overflow-hidden">
                    {/* Subtle shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center mb-2 shadow-md">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">GPS Tracking</h4>
                    </div>
                  </div>

                  <div className="relative bg-purple-600 rounded-lg p-3 sm:p-4 border-2 border-purple-500/80 shadow-lg shadow-purple-600/30 overflow-hidden">
                    {/* Subtle shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center mb-2 shadow-md">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">Analytics</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-4 flex-wrap">
                <button className="bg-[#3833FF] hover:bg-[#3833FF]/90 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-all flex items-center gap-1.5 border border-[#3833FF]/50 text-xs sm:text-sm whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  Book a demo
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-1.5 backdrop-blur-sm text-xs sm:text-sm whitespace-nowrap">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  Talk to sales
                </button>
              </div>
            </div>

            {/* Sub-Hero Line */}
            <div className="text-center max-w-3xl mx-auto px-4 pb-2 sm:pb-3">
              <p className="text-xs sm:text-sm text-white/80 leading-snug">
                Built for dealerships, fleets, OEM delivery partners, and insurers who need inspection certainty before delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <>
      {/* Features Section */}
      <div id="features" className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 py-20 sm:py-24 scroll-mt-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(56,51,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
                Powerful Features
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need for comprehensive pre-delivery inspections
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Feature 1 */}
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3833FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#3833FF]/10">
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Camera className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Photo Gallery</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Capture and organize inspection photos with GPS metadata and timestamps</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3833FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#3833FF]/10">
                <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30 group-hover:scale-110 transition-transform">
                      <QrCode className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Barcode Scanner</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Quickly scan VINs and product codes for accurate data capture</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3833FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#3833FF]/10">
                <div className="relative h-48 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
                      <MapPin className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">GPS Tracking</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Automatic location tracking for all inspection photos and activities</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3833FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#3833FF]/10">
                <div className="relative h-48 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Analytics Dashboard</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Track inspection metrics and generate comprehensive reports</p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3833FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#3833FF]/10">
                <div className="relative h-48 bg-gradient-to-br from-cyan-50 to-cyan-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                      <Shield className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Secure & Compliant</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Bank-level security with audit trails and compliance records</p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-[#3833FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#3833FF]/10">
                <div className="relative h-48 bg-gradient-to-br from-pink-50 to-pink-100 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-pink-500/30 group-hover:scale-110 transition-transform">
                      <Zap className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Fast & Efficient</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Streamlined workflow reduces inspection time by up to 60%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Predelivery.ai? Section */}
      <div id="benefits" className="relative bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30 py-20 sm:py-24 scroll-mt-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/30 to-amber-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-300/30 to-indigo-300/20 rounded-full blur-3xl"></div>
        </div>
        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(56,51,255,0.5) 10px, rgba(56,51,255,0.5) 20px)'}}></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-black">
                Why Predelivery.ai?
              </h2>
              
              {/* Problem Statement */}
              <p className="text-lg sm:text-xl text-black/80 max-w-3xl mx-auto mb-6">
                Vehicle issues discovered after delivery and registration lead to disputes, rework, warranty friction, and reputational risk.
              </p>
              
              {/* Solution Statement */}
              <p className="text-xl sm:text-2xl font-semibold text-[#3833FF] mb-12">
                Pre-delivery replaces uncertainty with proof.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-8 border-2 border-orange-200/50 hover:border-orange-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-200/50 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-300/50 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-orange-600 transition-colors">Reduce post-delivery disputes</h3>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200/50 hover:border-blue-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-200/50 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-300/50 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">Protect warranty claims</h3>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-green-200/50 hover:border-green-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-200/50 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-green-300/50 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-green-600 transition-colors">Create a defensible delivery record</h3>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-8 border-2 border-purple-200/50 hover:border-purple-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-200/50 overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-300/50 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">Prevent post registration risks</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div id="how-it-works" className="relative bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/30 py-24 scroll-mt-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-0 w-[700px] h-[700px] bg-gradient-to-br from-green-300/30 to-emerald-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-300/30 to-pink-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-300/30 to-cyan-300/20 rounded-full blur-3xl"></div>
        </div>
        {/* Dots pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(56,51,255,0.4) 2px, transparent 0)', backgroundSize: '50px 50px'}}></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                How it works
              </h2>
              <p className="text-xl sm:text-2xl text-[#3833FF] font-semibold mb-2 tracking-wide">
                Inspect → Verify → Sign Off → Deliver
              </p>
            </div>

            {/* Steps Container with Arrows */}
            <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-5">
              {/* Step 1: Inspect */}
              <div className="group relative bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-white rounded-3xl p-6 border-2 border-blue-200/60 hover:border-blue-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-300/40 overflow-visible w-full lg:w-[280px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-cyan-200/20 to-transparent rounded-full blur-2xl -z-0"></div>
                
                {/* Number badge - Fixed positioning */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-blue-500/60 z-30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-white">
                  1
                </div>
                
                <div className="relative z-10 pt-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <ClipboardCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 text-center group-hover:text-blue-600 transition-colors">Inspect</h3>
                  <p className="text-gray-600 text-center leading-snug text-sm">
                    Conduct a structured pre-delivery inspection using a standardised digital checklist.
                  </p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-1">
                <ArrowRight className="w-10 h-10 text-blue-400 drop-shadow-xl" strokeWidth={3} />
              </div>

              {/* Step 2: Verify */}
              <div className="group relative bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-white rounded-3xl p-6 border-2 border-green-200/60 hover:border-green-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-300/40 overflow-visible w-full lg:w-[280px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-2xl -z-0"></div>
                
                {/* Number badge - Fixed positioning */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-green-500/60 z-30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-white">
                  2
                </div>
                
                <div className="relative z-10 pt-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center mb-4 shadow-xl shadow-green-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 text-center group-hover:text-green-600 transition-colors">Verify</h3>
                  <p className="text-gray-600 text-center leading-snug text-sm">
                    Capture photos, VIN and compliance data, documentation, and condition evidence in real time.
                  </p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-1">
                <ArrowRight className="w-10 h-10 text-green-400 drop-shadow-xl" strokeWidth={3} />
              </div>

              {/* Step 3: Sign Off */}
              <div className="group relative bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-white rounded-3xl p-6 border-2 border-purple-200/60 hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-300/40 overflow-visible w-full lg:w-[280px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full blur-2xl -z-0"></div>
                
                {/* Number badge - Fixed positioning */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-purple-500/60 z-30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-white">
                  3
                </div>
                
                <div className="relative z-10 pt-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-xl shadow-purple-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <FileCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 text-center group-hover:text-purple-600 transition-colors">Sign Off</h3>
                  <p className="text-gray-600 text-center leading-snug text-sm">
                    Confirm readiness for delivery with a complete, auditable inspection record.
                  </p>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-1">
                <ArrowRight className="w-10 h-10 text-purple-400 drop-shadow-xl" strokeWidth={3} />
              </div>

              {/* Step 4: Deliver */}
              <div className="group relative bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-white rounded-3xl p-6 border-2 border-orange-200/60 hover:border-orange-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-300/40 overflow-visible w-full lg:w-[280px]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full blur-2xl -z-0"></div>
                
                {/* Number badge - Fixed positioning */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-orange-500/60 z-30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 border-4 border-white">
                  4
                </div>
                
                <div className="relative z-10 pt-2 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 flex items-center justify-center mb-4 shadow-xl shadow-orange-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 text-center group-hover:text-orange-600 transition-colors">Deliver</h3>
                  <p className="text-gray-600 text-center leading-snug text-sm">
                    Hand over the vehicle with confidence — knowing issues were identified and resolved before registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-[#3833FF] via-blue-600 to-purple-600 py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Inspections?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join leading dealerships and fleets who trust our platform for accurate, defensible pre-delivery inspections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-white text-[#3833FF] font-semibold px-8 py-3 rounded-full shadow-xl hover:scale-105 transition-all flex items-center gap-2 hover:shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-full border-2 border-white/30 hover:bg-white/20 transition-all flex items-center gap-2 hover:scale-105">
                <Phone className="w-5 h-5" />
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-black border-t border-[#3833FF]/30 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-4 group">
                <div className="w-10 h-10 rounded-lg bg-[#3833FF] flex items-center justify-center mr-3 border border-[#3833FF]/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-sm">HI</span>
                </div>
                <span className="text-xl font-bold text-white">Pre Delivery</span>
              </Link>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Comprehensive pre-delivery inspection management system for dealerships, fleets, and OEM partners.
              </p>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Features</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">How it Works</a>
                </li>
                <li>
                  <a href="#benefits" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Benefits</a>
                </li>
                <li>
                  <Link href="/login" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Login</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">API Reference</a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Support</a>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Contact Us</h3>
              <ul className="space-y-3">
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>support@predelivery.com</span>
                  </div>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Sales: +1 (555) 123-4567</span>
                  </div>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>123 Business St, Suite 100<br />City, State 12345</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#3833FF]/30 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/70 text-sm text-center md:text-left">
                © 2025 Pre Delivery Inspection. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Terms of Service</a>
                <Link href="/privacy" className="text-white/70 hover:text-[#3833FF] transition-colors text-sm">Privacy Policy</Link>
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


