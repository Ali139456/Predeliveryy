'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Sparkles, Calendar, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck, CheckCircle, ScanLine, Building2, Users, Truck, CreditCard, Fingerprint } from 'lucide-react';

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
      <div className="relative bg-gradient-to-b from-blue-950 via-purple-950 to-blue-950 min-h-screen w-full overflow-hidden">
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
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-purple-950/70 to-blue-950/80"></div>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-blue-900/50"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 relative z-20 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Side - Main Content with Overlapping Windows */}
              <div className="lg:col-span-7 space-y-6">
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Pre-Delivery Inspections, Digitised
                </h1>
                
                {/* Description */}
                <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
                  Verify vehicle condition, compliance, and documentation before handover and registration — with a single, defensible digital record.
                </p>

                {/* Overlapping Windows/Cards Design */}
                <div className="relative mt-8 space-y-4">
                  {/* Large Window - Main Inspection Interface */}
                  <div className="relative bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl overflow-hidden">
                    {/* Decorative content inside window */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                    
                    {/* Left side - Abstract visual */}
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-lg flex items-center justify-center">
                          <FileCheck className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" strokeWidth={2} />
                        </div>
                      </div>
                      
                      {/* Right side - Content lines */}
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/40 rounded w-full"></div>
                        <div className="h-3 bg-white/30 rounded w-3/4"></div>
                        <div className="h-3 bg-white/25 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  {/* Smaller Window - Chat/Input Interface (overlapping) */}
                  <div className="relative -mt-6 ml-4 sm:ml-8 bg-slate-900/95 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 shadow-2xl z-20">
                    <div className="flex items-start gap-3">
                      {/* Sparkle icon */}
                      <div className="flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-purple-400" strokeWidth={2} />
                      </div>
                      
                      {/* Chat lines */}
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-white/30 rounded w-full"></div>
                        <div className="h-2 bg-white/20 rounded w-2/3"></div>
                      </div>
                      
                      {/* Input field with arrow */}
                      <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 border border-purple-500/50">
                        <div className="h-2 bg-white/40 rounded w-16"></div>
                        <ArrowRight className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link 
                      href="/inspection/new"
                      className="group relative bg-gradient-to-r from-[#3833FF] to-blue-600 hover:from-[#3833FF]/90 hover:to-blue-600/90 text-white font-semibold px-6 py-3 rounded-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 border border-[#3833FF]/50"
                    >
                      <FileCheck className="w-5 h-5" />
                      <span>New Inspection</span>
                    </Link>
                    <Link 
                      href="/inspections"
                      className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg border-2 border-white/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>View Inspections</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side - Feature List (AI Models Style) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-purple-600/30 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 shadow-lg hover:bg-purple-600/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">Photo Gallery</span>
                  </div>
                </div>

                <div className="bg-purple-600/30 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 shadow-lg hover:bg-purple-600/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">Barcode Scanner</span>
                  </div>
                </div>

                <div className="bg-purple-600/30 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 shadow-lg hover:bg-purple-600/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">GPS Tracking</span>
                  </div>
                </div>

                <div className="bg-purple-600/30 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 shadow-lg hover:bg-purple-600/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">Analytics Dashboard</span>
                  </div>
                </div>

                <div className="bg-purple-600/30 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 shadow-lg hover:bg-purple-600/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">Secure & Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Section */}
            <div className="mt-12 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
                <Link href="/contact" className="bg-[#3833FF] hover:bg-[#3833FF]/90 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-all flex items-center gap-2 border border-[#3833FF]/50">
                  <Calendar className="w-4 h-4" />
                  <span>Book a demo</span>
                </Link>
                <Link href="/contact" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-2.5 rounded-full border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Talk to sales</span>
                </Link>
              </div>
              <p className="text-white/70 text-sm mt-4 max-w-2xl mx-auto">
                Built for dealerships, fleets, OEM delivery partners, and insurers who need inspection certainty before delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isLoggedIn && (
        <>
      {/* Why Predelivery.ai? Section */}
      <div id="benefits" className="relative bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900 py-24 sm:py-32 scroll-mt-20 overflow-hidden">
        {/* Automotive pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 100px)'}}></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="text-red-600 font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">Why Choose Us</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white">
                Why Predelivery.ai?
              </h2>
              
              {/* Problem Statement */}
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                Vehicle issues discovered after delivery and registration lead to disputes, rework, warranty friction, and reputational risk.
              </p>
              
              {/* Solution Statement */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  Pre-delivery replaces uncertainty with proof.
                </p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-red-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-6 shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">Reduce post-delivery disputes</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Document everything before handover to prevent costly disputes.</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-orange-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-600/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center mb-6 shadow-lg shadow-orange-600/30 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-orange-400 transition-colors">Protect warranty claims</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Create verifiable records that support warranty and insurance claims.</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-amber-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-600/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-amber-400 transition-colors">Create a defensible delivery record</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Build comprehensive digital records that stand up in any dispute.</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">Prevent post registration risks</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Identify and resolve issues before vehicle registration and delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div id="how-it-works" className="relative bg-gradient-to-b from-white via-gray-50 to-white py-24 sm:py-32 scroll-mt-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="text-red-600 font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">Simple Process</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
                How it works
              </h2>
              {/* Process Flow Description */}
              <div className="max-w-4xl mx-auto mb-12">
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                  Start with a <span className="font-semibold text-red-600">comprehensive inspection</span>, then <span className="font-semibold text-orange-600">verify all vehicle details</span> with digital documentation, <span className="font-semibold text-amber-600">obtain approval</span> through digital signatures, and finally <span className="font-semibold text-red-600">deliver with confidence</span> knowing every detail is recorded and verified.
                </p>
              </div>
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
              {/* Step 1: Inspect */}
              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-red-600/50 z-30 group-hover:scale-110 transition-all duration-300 border-4 border-white">
                  1
                </div>
                
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-6 shadow-xl shadow-red-600/30 group-hover:scale-110 transition-transform duration-300">
                    <ClipboardCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-red-600 transition-colors">Inspect</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Complete a comprehensive digital inspection checklist covering all vehicle components and systems.
                  </p>
                </div>
              </div>

              {/* Step 2: Verify */}
              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-600/20">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-orange-600/50 z-30 group-hover:scale-110 transition-all duration-300 border-4 border-white">
                  2
                </div>
                
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center mb-6 shadow-xl shadow-orange-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-orange-600 transition-colors">Verify</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Document vehicle condition with photos, capture VIN data, and record compliance information automatically.
                  </p>
                </div>
              </div>

              {/* Step 3: Sign Off */}
              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-amber-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-600/20">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-amber-600/50 z-30 group-hover:scale-110 transition-all duration-300 border-4 border-white">
                  3
                </div>
                
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-6 shadow-xl shadow-amber-600/30 group-hover:scale-110 transition-transform duration-300">
                    <FileCheck className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-amber-600 transition-colors">Sign Off</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Approve the inspection with digital signatures, creating a complete and legally defensible record.
                  </p>
                </div>
              </div>

              {/* Step 4: Deliver */}
              <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-2xl shadow-red-600/50 z-30 group-hover:scale-110 transition-all duration-300 border-4 border-white">
                  4
                </div>
                
                <div className="relative z-10 pt-6 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-6 shadow-xl shadow-red-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 text-center group-hover:text-red-600 transition-colors">Deliver</h3>
                  <p className="text-gray-600 text-center leading-relaxed text-sm">
                    Hand over the vehicle with complete confidence, backed by a verified digital inspection record.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Powerful Features Section */}
      <div id="features" className="relative bg-gradient-to-b from-slate-50 via-white to-gray-50 py-24 sm:py-32 scroll-mt-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="text-red-600 font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">Core Features</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
                Powerful Features
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                Everything you need for comprehensive vehicle inspections
              </p>
              <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Our tech verifies your new vehicle before handover and registration — capturing condition, compliance, and proof so issues are identified and resolved before the keys are released.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-600 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80"
                    alt="Photo Gallery - Vehicle inspection photography"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">Photo Gallery</div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-600 transition-colors">Photo Gallery</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Capture and organize inspection photos with GPS metadata and timestamps</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-600 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-600/20">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80"
                    alt="Vehicle Identity Capture - VIN scanning"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">VIN Capture</div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Vehicle Identity Capture</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Digitally extract VIN and compliance information from vehicle labels to create a verified pre-delivery record</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-amber-600 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-600/20">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80"
                    alt="GPS Tracking - Location services"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">GPS Tracking</div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-amber-600 transition-colors">GPS Tracking</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Automatic location tracking for all inspection photos and activities</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-600 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80"
                    alt="Analytics Dashboard - Data visualization"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">Analytics</div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-600 transition-colors">Analytics Dashboard</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Track inspection metrics and generate comprehensive reports</p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-600 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-600/20">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80"
                    alt="Secure & Compliant - Data security"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">Security</div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Secure & Compliant</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Bank-level security with audit trails and compliance records</p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-amber-600 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-600/20">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80"
                    alt="Fast & Efficient - Streamlined workflow"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">Efficiency</div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-amber-600 transition-colors">Fast & Efficient</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">Streamlined workflow reduces inspection time by up to 60%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Who It's For? Section */}
      <div className="relative bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900 py-24 sm:py-32 scroll-mt-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="text-red-600 font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">Target Audience</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white">
                Who It's For?
              </h2>
            </div>

            {/* Who It's For Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-red-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/30">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop&q=80"
                    alt="Dealerships - Car showroom"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">Dealerships</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">Dealerships</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">Reduce post-delivery disputes and protect handover quality.</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-600/30">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80"
                    alt="Fleet & Leasing Companies - Commercial vehicles"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">Fleet & Leasing</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-orange-400 transition-colors">Fleet & Leasing Companies</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">Standardise vehicle delivery across locations and suppliers.</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-amber-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-600/30">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80"
                    alt="OEM & Delivery Partners - Manufacturing and delivery"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">OEM Partners</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-amber-400 transition-colors">OEM & Delivery Partners</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">Enforce consistent pre-delivery inspection standards at scale.</p>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80"
                    alt="Insurers & Financiers - Insurance and finance"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">Insurance</div>
                </div>
                <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">Insurers & Financiers</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">Access verified condition records that stand up in claims and disputes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance and Trust Section */}
      <div className="relative bg-gradient-to-b from-white via-gray-50 to-white py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="text-red-600 font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">Trust & Security</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900">
                Compliance and Trust
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-red-600 shadow-lg hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-6 shadow-lg shadow-red-600/30">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Enterprise-grade data security</h3>
                <p className="text-gray-600 text-sm">Bank-level encryption and security protocols</p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-orange-600 shadow-lg hover:shadow-2xl hover:shadow-orange-600/20 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center mb-6 shadow-lg shadow-orange-600/30">
                  <Lock className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Role-based access controls</h3>
                <p className="text-gray-600 text-sm">Granular permissions and access management</p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-amber-600 shadow-lg hover:shadow-2xl hover:shadow-amber-600/20 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/30">
                  <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Audit trails, analytics and inspection history</h3>
                <p className="text-gray-600 text-sm">Complete transparency and traceability</p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-red-500 shadow-lg hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                  <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">Built by automotive experts</h3>
                <p className="text-gray-600 text-sm">Deep inspection and automotive data experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900 py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <span className="text-red-600 font-bold text-sm uppercase tracking-wider px-4 py-2 bg-red-600/10 rounded-full border border-red-600/20">Flexible Pricing</span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white">
                Pricing
              </h2>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 md:p-14 border-2 border-slate-700 shadow-2xl hover:border-red-600/50 transition-all duration-300">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/30">
                  <CreditCard className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xl sm:text-2xl text-white font-semibold leading-relaxed">
                  Flexible plans based on vehicle volume and business needs.
                </p>
                <p className="text-lg sm:text-xl text-gray-300">
                  Per-vehicle and enterprise options available.
                </p>
                <div className="pt-6">
                  <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <Phone className="w-5 h-5" />
                    Contact sales for pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-orange-600 py-24 sm:py-32 overflow-hidden">
        {/* Speed lines effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255,255,255,0.1) 100px, rgba(255,255,255,0.1) 200px)'}}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">
              Ready to Transform Your Inspections?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join leading dealerships and fleets who trust our platform for accurate, defensible pre-delivery inspections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-white text-red-600 font-bold px-10 py-4 rounded-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-2 hover:shadow-red-900/50 text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="bg-white/10 backdrop-blur-md text-white font-bold px-10 py-4 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-all flex items-center gap-2 hover:scale-105 text-lg">
                <Phone className="w-5 h-5" />
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-b from-slate-950 via-black to-black border-t border-red-600/20 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center mb-4 group">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mr-3 border border-red-600/30 group-hover:scale-110 transition-transform shadow-lg shadow-red-600/30">
                  <span className="text-white font-bold text-sm">PD</span>
                </div>
                <span className="text-xl font-bold text-white">Pre Delivery</span>
              </Link>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Comprehensive pre-delivery inspection management system for dealerships, fleets, and OEM partners.
              </p>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-red-500" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-white/70 hover:text-red-500 transition-colors text-sm">Features</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-white/70 hover:text-red-500 transition-colors text-sm">How it Works</a>
                </li>
                <li>
                  <a href="#benefits" className="text-white/70 hover:text-red-500 transition-colors text-sm">Benefits</a>
                </li>
                <li>
                  <Link href="/login" className="text-white/70 hover:text-red-500 transition-colors text-sm">Login</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-white/70 hover:text-red-500 transition-colors text-sm">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-red-500 transition-colors text-sm">API Reference</a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-red-500 transition-colors text-sm">Support</a>
                </li>
                <li>
                  <Link href="/privacy" className="text-white/70 hover:text-red-500 transition-colors text-sm">Privacy Policy</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Contact Us</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className="text-white/70 hover:text-red-500 transition-colors text-sm">
                    Contact Form
                  </Link>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                    <a href="mailto:info@predelivery.ai" className="hover:text-red-500 transition-colors">info@predelivery.ai</a>
                  </div>
                </li>
                <li className="text-white/70 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                    <span>Sales: +1 (555) 123-4567</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-red-600/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/70 text-sm text-center md:text-left">
                © 2025 Pre Delivery Inspection. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-white/70 hover:text-red-500 transition-colors text-sm">Terms of Service</a>
                <Link href="/privacy" className="text-white/70 hover:text-red-500 transition-colors text-sm">Privacy Policy</Link>
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


