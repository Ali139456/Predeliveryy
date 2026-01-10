'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check, Star, MessageSquare, Sparkles } from 'lucide-react';

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
            {/* Main Visual Section - Central UI Window with Pill Buttons */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-12">
              {/* Central UI Window Graphic */}
              <div className="relative w-full max-w-2xl">
                {/* Large semi-transparent rounded UI window */}
                <div className="relative bg-gradient-to-br from-[#3833FF]/30 via-[#3833FF]/20 to-[#3833FF]/10 rounded-3xl p-6 lg:p-8 backdrop-blur-sm border border-[#3833FF]/40 shadow-2xl">
                  {/* Smaller window 1 - Top Left */}
                  <div className="relative bg-slate-800/80 rounded-2xl p-6 mb-4 border border-[#3833FF]/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      {/* Abstract colorful pattern area */}
                      <div className="flex-1 relative h-24 rounded-xl bg-gradient-to-br from-[#3833FF]/40 via-blue-500/30 to-purple-500/30 overflow-hidden">
                        <div className="absolute inset-0 opacity-50">
                          <Sparkles className="w-full h-full text-[#3833FF]/50" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white/60" />
                        </div>
                      </div>
                      {/* Text lines representation */}
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-[#3833FF]/40 rounded w-full"></div>
                        <div className="h-2 bg-[#3833FF]/30 rounded w-3/4"></div>
                        <div className="h-2 bg-[#3833FF]/20 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  {/* Smaller window 2 - Bottom, slightly overlapping */}
                  <div className="relative -mt-3 ml-4 bg-slate-800/80 rounded-2xl p-6 border border-[#3833FF]/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[#3833FF]" fill="currentColor" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 bg-[#3833FF]/40 rounded w-full"></div>
                        <div className="h-2 bg-[#3833FF]/30 rounded w-2/3"></div>
                      </div>
                      {/* Input field representation */}
                      <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 border border-[#3833FF]/30">
                        <MessageSquare className="w-4 h-4 text-white/60" />
                        <ArrowRight className="w-4 h-4 text-[#3833FF]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Stack of Pill Buttons - Right Side */}
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link href="/inspection/new" className="bg-gradient-to-r from-[#3833FF] to-blue-600 rounded-full px-6 py-4 flex items-center gap-3 border border-[#3833FF]/50 shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-transform cursor-pointer">
                  <FileCheck className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">New Inspection</span>
                </Link>
                <Link href="/inspections" className="bg-gradient-to-r from-[#3833FF] to-blue-600 rounded-full px-6 py-4 flex items-center gap-3 border border-[#3833FF]/50 shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-transform cursor-pointer">
                  <Search className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">View Inspections</span>
                </Link>
                <div className="bg-gradient-to-r from-[#3833FF] to-blue-600 rounded-full px-6 py-4 flex items-center gap-3 border border-[#3833FF]/50 shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-transform cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Photo Gallery</span>
                </div>
                <div className="bg-gradient-to-r from-[#3833FF] to-blue-600 rounded-full px-6 py-4 flex items-center gap-3 border border-[#3833FF]/50 shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-transform cursor-pointer">
                  <MapPin className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">GPS Tracking</span>
                </div>
                <div className="bg-gradient-to-r from-[#3833FF] to-blue-600 rounded-full px-6 py-4 flex items-center gap-3 border border-[#3833FF]/50 shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-transform cursor-pointer">
                  <BarChart3 className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Analytics</span>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="bg-green-500 rounded-full px-6 py-2 border border-green-400/50 shadow-lg">
                <span className="text-white font-bold text-sm uppercase tracking-wider">GET STARTED FREE</span>
              </div>
            </div>

            {/* Main Title - Centered */}
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Introducing Pre Delivery Inspection
              </h1>
            </div>

            {/* Subtitle */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-lg sm:text-xl text-white/90">
                Manage comprehensive vehicle inspections with advanced digital tools. Streamline your workflow with real-time documentation, GPS tracking, and professional reporting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 -mt-10 mb-20 relative z-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Link
            href="/inspection/new"
            className="group bg-white rounded-2xl shadow-xl p-8 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-xl bg-[#3833FF] flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black">New Inspection</h2>
              </div>
              <ArrowRight className="w-6 h-6 text-black/60 group-hover:text-[#3833FF] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-black/70 ml-18">
              Create a comprehensive pre-delivery inspection with full checklist support, photo documentation, and GPS tracking
            </p>
          </Link>

          <Link
            href="/inspections"
            className="group bg-white rounded-2xl shadow-xl p-8 border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-xl bg-[#3833FF] flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black">View Inspections</h2>
              </div>
              <ArrowRight className="w-6 h-6 text-black/60 group-hover:text-[#3833FF] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-black/70 ml-18">
              Search, filter, and manage historical inspection reports with advanced search capabilities
            </p>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Powerful Features
          </h2>
          <p className="text-xl text-black/70 max-w-2xl mx-auto">
            Everything you need for comprehensive vehicle inspections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Photo Collection</h3>
            <p className="text-black/70 text-sm">
              Capture and store unlimited inspection photos with cloud storage integration
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Barcode Scanning</h3>
            <p className="text-black/70 text-sm">
              Real-time barcode and QR code scanning using your device camera
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">GPS Location</h3>
            <p className="text-black/70 text-sm">
              Automatic GPS location tracking with address reverse geocoding
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">PDF Reports</h3>
            <p className="text-black/70 text-sm">
              Generate professional PDF reports and email them to multiple recipients
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Data Security</h3>
            <p className="text-black/70 text-sm">
              GDPR-compliant data handling with encryption and privacy controls
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Cloud Storage</h3>
            <p className="text-black/70 text-sm">
              Secure cloud storage with AWS S3 integration for all your files
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Advanced Search</h3>
            <p className="text-black/70 text-sm">
              Powerful search and filter capabilities for finding inspections quickly
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#3833FF]/50">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">Analytics Ready</h3>
            <p className="text-black/70 text-sm">
              Export data in multiple formats for analysis and reporting
            </p>
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


