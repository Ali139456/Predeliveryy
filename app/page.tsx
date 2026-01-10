'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Sparkles, Calendar, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-black min-h-screen max-h-screen flex flex-col">
        {/* Hero Background Image */}
        <div className="absolute inset-0 w-full h-full">
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
        <div className="absolute inset-0 opacity-20 z-10">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#3833FF] to-transparent"></div>
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#3833FF] to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-[clamp(1rem,2vw,1.5rem)] py-[clamp(1rem,3vh,2rem)] relative z-20 flex-1 flex items-center justify-center">
          <div className="max-w-[95vw] xl:max-w-7xl mx-auto w-full">
            {/* Main Visual Section - Central UI Window with Pill Buttons */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-[clamp(1rem,2vw,2rem)] mb-[clamp(0.75rem,2vh,1.5rem)]">
              {/* Central UI Window Graphic */}
              <div className="relative w-full max-w-[min(100%,28rem)] lg:max-w-[min(35vw,32rem)]">
                {/* Large semi-transparent rounded UI window */}
                <div className="relative bg-gradient-to-br from-[#3833FF]/50 via-purple-600/40 to-blue-600/30 rounded-3xl p-[clamp(0.75rem,1.5vw,1.25rem)] backdrop-blur-lg border-2 border-[#3833FF]/60 shadow-2xl shadow-[#3833FF]/40 overflow-hidden">
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3833FF]/20 via-purple-500/20 to-transparent rounded-3xl"></div>
                  
                  {/* Smaller window 1 - Top Left */}
                  <div className="relative bg-slate-900/95 rounded-xl p-[clamp(0.75rem,1.2vw,1rem)] mb-[clamp(0.5rem,1vw,0.75rem)] border border-[#3833FF]/50 backdrop-blur-md shadow-xl">
                    <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
                      {/* Abstract colorful pattern area */}
                      <div className="flex-1 relative h-[clamp(3.5rem,8vw,5rem)] rounded-lg bg-gradient-to-br from-[#3833FF]/70 via-blue-500/60 to-purple-500/60 overflow-hidden border border-[#3833FF]/40">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse"></div>
                        <div className="absolute inset-0 opacity-70">
                          <Sparkles className="w-full h-full text-white/80" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] text-white drop-shadow-lg" />
                        </div>
                      </div>
                      {/* Text lines representation */}
                      <div className="flex-1 space-y-[clamp(0.25rem,0.5vw,0.5rem)]">
                        <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-gradient-to-r from-[#3833FF]/60 to-[#3833FF]/40 rounded w-full"></div>
                        <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-gradient-to-r from-[#3833FF]/50 to-[#3833FF]/30 rounded w-3/4"></div>
                        <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-gradient-to-r from-[#3833FF]/40 to-[#3833FF]/20 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  {/* Smaller window 2 - Bottom, slightly overlapping */}
                  <div className="relative -mt-[clamp(0.5rem,1vw,0.75rem)] ml-[clamp(0.5rem,1vw,0.75rem)] bg-slate-900/95 rounded-xl p-[clamp(0.75rem,1.2vw,1rem)] border border-[#3833FF]/50 backdrop-blur-md shadow-xl">
                    <div className="flex items-center gap-[clamp(0.375rem,0.75vw,0.5rem)]">
                      <div className="flex-shrink-0">
                        <Star className="w-[clamp(1rem,2vw,1.25rem)] h-[clamp(1rem,2vw,1.25rem)] text-[#3833FF] drop-shadow-lg" fill="currentColor" />
                      </div>
                      <div className="flex-1 space-y-[clamp(0.25rem,0.5vw,0.5rem)]">
                        <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-gradient-to-r from-[#3833FF]/60 to-[#3833FF]/40 rounded w-full"></div>
                        <div className="h-[clamp(0.25rem,0.5vw,0.5rem)] bg-gradient-to-r from-[#3833FF]/50 to-[#3833FF]/30 rounded w-2/3"></div>
                      </div>
                      {/* Input field representation */}
                      <div className="flex items-center gap-[clamp(0.25rem,0.5vw,0.375rem)] bg-black/70 rounded-lg px-[clamp(0.5rem,1vw,0.625rem)] py-[clamp(0.25rem,0.5vw,0.375rem)] border border-[#3833FF]/50 shadow-inner">
                        <MessageSquare className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)] text-white/80" />
                        <ArrowRight className="w-[clamp(0.75rem,1.5vw,0.875rem)] h-[clamp(0.75rem,1.5vw,0.875rem)] text-[#3833FF]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Stack of Pill Buttons - Right Side */}
              <div className="flex flex-col gap-[clamp(0.375rem,0.75vw,0.5rem)] w-full max-w-[min(100%,18rem)] lg:max-w-[min(20vw,20rem)]">
                <Link href="/inspection/new" className="bg-gradient-to-r from-[#3833FF] via-blue-600 to-purple-600 rounded-full px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] flex items-center gap-[clamp(0.5rem,1vw,0.625rem)] border border-[#3833FF]/60 shadow-lg shadow-[#3833FF]/40 hover:scale-105 transition-transform cursor-pointer text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <FileCheck className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)] text-white" />
                  <span className="text-white font-semibold">New Inspection</span>
                </Link>
                <Link href="/inspections" className="bg-gradient-to-r from-[#3833FF] via-blue-600 to-purple-600 rounded-full px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] flex items-center gap-[clamp(0.5rem,1vw,0.625rem)] border border-[#3833FF]/60 shadow-lg shadow-[#3833FF]/40 hover:scale-105 transition-transform cursor-pointer text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <Search className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)] text-white" />
                  <span className="text-white font-semibold">View Inspections</span>
                </Link>
                <div className="bg-gradient-to-r from-[#3833FF] via-blue-600 to-purple-600 rounded-full px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] flex items-center gap-[clamp(0.5rem,1vw,0.625rem)] border border-[#3833FF]/60 shadow-lg shadow-[#3833FF]/40 hover:scale-105 transition-transform cursor-pointer text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <Camera className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)] text-white" />
                  <span className="text-white font-semibold">Photo Gallery</span>
                </div>
                <div className="bg-gradient-to-r from-[#3833FF] via-blue-600 to-purple-600 rounded-full px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] flex items-center gap-[clamp(0.5rem,1vw,0.625rem)] border border-[#3833FF]/60 shadow-lg shadow-[#3833FF]/40 hover:scale-105 transition-transform cursor-pointer text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <MapPin className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)] text-white" />
                  <span className="text-white font-semibold">GPS Tracking</span>
                </div>
                <div className="bg-gradient-to-r from-[#3833FF] via-blue-600 to-purple-600 rounded-full px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vw,0.75rem)] flex items-center gap-[clamp(0.5rem,1vw,0.625rem)] border border-[#3833FF]/60 shadow-lg shadow-[#3833FF]/40 hover:scale-105 transition-transform cursor-pointer text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <BarChart3 className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)] text-white" />
                  <span className="text-white font-semibold">Analytics</span>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-[clamp(0.75rem,2vh,1.5rem)]">
              <div className="bg-green-500 rounded-full px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.25rem,0.5vw,0.375rem)] border border-green-400/50 shadow-lg">
                <span className="text-white font-bold text-[clamp(0.625rem,1vw,0.75rem)] uppercase tracking-wider">GET STARTED FREE</span>
              </div>
            </div>

            {/* Main Title - Centered */}
            <div className="text-center mb-[clamp(0.5rem,1.5vh,1rem)]">
              <h1 className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold text-white leading-tight mb-[clamp(0.5rem,1.5vh,1rem)]">
                Pre-Delivery Inspections, Digitised
              </h1>
              
              {/* Subtitle */}
              <p className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-white/90 max-w-[min(90vw,64rem)] mx-auto mb-[clamp(0.75rem,2vh,1.5rem)]">
                Verify vehicle condition, compliance, and documentation before handover and registration — with a single, defensible digital record.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-[clamp(0.5rem,1vw,0.75rem)] mb-[clamp(0.5rem,1.5vh,1rem)]">
                <button className="bg-[#3833FF] hover:bg-[#3833FF]/90 text-white font-semibold px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-full shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-all flex items-center gap-[clamp(0.375rem,0.75vw,0.5rem)] border border-[#3833FF]/50 text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <Calendar className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)]" />
                  Book a demo
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-full shadow-lg border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-[clamp(0.375rem,0.75vw,0.5rem)] backdrop-blur-sm text-[clamp(0.75rem,1.2vw,0.875rem)]">
                  <Phone className="w-[clamp(0.875rem,1.5vw,1rem)] h-[clamp(0.875rem,1.5vw,1rem)]" />
                  Talk to sales
                </button>
              </div>
            </div>

            {/* Sub-Hero Line */}
            <div className="text-center max-w-[min(90vw,64rem)] mx-auto mt-[clamp(0.5rem,1.5vh,1rem)]">
              <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-white/80">
                Built for dealerships, fleets, OEM delivery partners, and insurers who need inspection certainty before delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Predelivery.ai? Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
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
      <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-24">
        <div className="container mx-auto px-4 sm:px-6">
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

      {/* Footer */}
      <div className="bg-black border-t border-[#3833FF]/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/70">
            <p>© 2025 Pre delivery inspection. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


