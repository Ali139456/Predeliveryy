'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Sparkles, Calendar, Phone, AlertTriangle, ShieldCheck, FileText, Lock, ClipboardCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-black">
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
        
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 relative z-20">
          <div className="max-w-7xl mx-auto">
            {/* Main Title - Centered */}
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Pre-Delivery Inspections, Digitised
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-10">
                Verify vehicle condition, compliance, and documentation before handover and registration — with a single, defensible digital record.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button className="bg-[#3833FF] hover:bg-[#3833FF]/90 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-all flex items-center gap-2 border border-[#3833FF]/50">
                  <Calendar className="w-5 h-5" />
                  Book a demo
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full shadow-lg border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-2 backdrop-blur-sm">
                  <Phone className="w-5 h-5" />
                  Talk to sales
                </button>
              </div>
            </div>

            {/* Sub-Hero Line */}
            <div className="text-center max-w-4xl mx-auto mt-12">
              <p className="text-base sm:text-lg text-white/80">
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
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black">
                How it works
              </h2>
              <p className="text-lg sm:text-xl text-[#3833FF] font-semibold mb-2">
                Inspect → Verify → Sign Off → Deliver
              </p>
            </div>

            {/* Steps Container with Arrows */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4">
              {/* Step 1: Inspect */}
              <div className="group relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl p-8 border-2 border-blue-200/50 hover:border-blue-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-200/50 overflow-hidden w-full lg:w-auto lg:flex-1">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-200/30 to-transparent rounded-full blur-2xl"></div>
                
                {/* Number badge */}
                <div className="absolute -top-3 left-6 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-xl shadow-blue-400/50 z-20 group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-6 mt-2 shadow-xl shadow-blue-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <ClipboardCheck className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center group-hover:text-blue-600 transition-colors">Inspect</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Conduct a structured pre-delivery inspection using a standardised digital checklist.
                  </p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-blue-400 drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Step 2: Verify */}
              <div className="group relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-green-200/50 hover:border-green-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-200/50 overflow-hidden w-full lg:w-auto lg:flex-1">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-200/40 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-2xl"></div>
                
                {/* Number badge */}
                <div className="absolute -top-3 left-6 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-xl shadow-green-400/50 z-20 group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center mx-auto mb-6 mt-2 shadow-xl shadow-green-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center group-hover:text-green-600 transition-colors">Verify</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Capture photos, VIN and compliance data, documentation, and condition evidence in real time.
                  </p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-green-400 drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Step 3: Sign Off */}
              <div className="group relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-8 border-2 border-purple-200/50 hover:border-purple-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-200/50 overflow-hidden w-full lg:w-auto lg:flex-1">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full blur-2xl"></div>
                
                {/* Number badge */}
                <div className="absolute -top-3 left-6 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-xl shadow-purple-400/50 z-20 group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6 mt-2 shadow-xl shadow-purple-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <FileCheck className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center group-hover:text-purple-600 transition-colors">Sign Off</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Confirm readiness for delivery with a complete, auditable inspection record.
                  </p>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-purple-400 drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Step 4: Deliver */}
              <div className="group relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-8 border-2 border-orange-200/50 hover:border-orange-400/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-200/50 overflow-hidden w-full lg:w-auto lg:flex-1">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/40 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-2xl"></div>
                
                {/* Number badge */}
                <div className="absolute -top-3 left-6 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-xl shadow-orange-400/50 z-20 group-hover:scale-110 transition-transform duration-300">
                  4
                </div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 flex items-center justify-center mx-auto mb-6 mt-2 shadow-xl shadow-orange-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Zap className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center group-hover:text-orange-600 transition-colors">Deliver</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
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


