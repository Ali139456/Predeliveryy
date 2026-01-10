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
              <div className="bg-white rounded-2xl p-6 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#3833FF] flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-black">Reduce post-delivery disputes</h3>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#3833FF] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-black">Protect warranty claims</h3>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#3833FF] flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-black">Create a defensible delivery record</h3>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#3833FF] flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-black">Prevent post registration risks</h3>
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
              <div className="bg-white rounded-2xl p-8 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg relative w-full lg:w-auto lg:flex-1">
                <div className="absolute -top-4 left-8 bg-[#3833FF] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  1
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg shadow-[#3833FF]/50">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black text-center">Inspect</h3>
                <p className="text-black/70 text-center">
                  Conduct a structured pre-delivery inspection using a standardised digital checklist.
                </p>
              </div>

              {/* Arrow 1 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-[#3833FF] drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Step 2: Verify */}
              <div className="bg-white rounded-2xl p-8 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg relative w-full lg:w-auto lg:flex-1">
                <div className="absolute -top-4 left-8 bg-[#3833FF] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  2
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg shadow-[#3833FF]/50">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black text-center">Verify</h3>
                <p className="text-black/70 text-center">
                  Capture photos, VIN and compliance data, documentation, and condition evidence in real time.
                </p>
              </div>

              {/* Arrow 2 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-[#3833FF] drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Step 3: Sign Off */}
              <div className="bg-white rounded-2xl p-8 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg relative w-full lg:w-auto lg:flex-1">
                <div className="absolute -top-4 left-8 bg-[#3833FF] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  3
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg shadow-[#3833FF]/50">
                  <FileCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black text-center">Sign Off</h3>
                <p className="text-black/70 text-center">
                  Confirm readiness for delivery with a complete, auditable inspection record.
                </p>
              </div>

              {/* Arrow 3 */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-[#3833FF] drop-shadow-lg" strokeWidth={2.5} />
              </div>

              {/* Step 4: Deliver */}
              <div className="bg-white rounded-2xl p-8 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-all hover:scale-105 shadow-lg relative w-full lg:w-auto lg:flex-1">
                <div className="absolute -top-4 left-8 bg-[#3833FF] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  4
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg shadow-[#3833FF]/50">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black text-center">Deliver</h3>
                <p className="text-black/70 text-center">
                  Hand over the vehicle with confidence — knowing issues were identified and resolved before registration.
                </p>
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


