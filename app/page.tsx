'use client';

import Link from 'next/link';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight, Check } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        {/* Subtle light streaks effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#3833FF] to-transparent"></div>
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-[#3833FF] to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight">
                Pre Delivery Inspection Platform
              </h1>
              
              {/* Bullet Points */}
              <div className="space-y-4 mb-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3833FF] flex items-center justify-center mr-4 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl text-white/90">
                    Comprehensive digital inspection management with advanced features
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3833FF] flex items-center justify-center mr-4 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl text-white/90">
                    Streamlined workflow for efficient vehicle pre-delivery inspections
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3833FF] flex items-center justify-center mr-4 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl text-white/90">
                    Real-time documentation with photos, GPS tracking, and digital signatures
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Visual Element */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-[#3833FF]/20 rounded-2xl blur-2xl transform rotate-6"></div>
                <div className="relative bg-gradient-to-br from-[#3833FF]/10 to-black/50 rounded-2xl p-8 border border-[#3833FF]/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-2xl bg-[#3833FF] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#3833FF]/50">
                        <FileCheck className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-white/80 text-lg">Digital Inspection Management</p>
                    </div>
                  </div>
                </div>
              </div>
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


