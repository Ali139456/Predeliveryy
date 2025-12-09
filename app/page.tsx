'use client';

import Link from 'next/link';
import { FileCheck, Search, Camera, MapPin, QrCode, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 bg-slate-800/95 mb-6 animate-bounce-slow border-2 border-purple-400/50">
              <FileCheck className="w-10 h-10 text-purple-300" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
              PreDelivery
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto mb-8">
              Professional inspection management system with advanced features
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inspection/new"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/50 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 hover:scale-105"
              >
                Start New Inspection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/inspections"
                className="inline-flex items-center justify-center px-8 py-4 bg-slate-800/80 bg-slate-800/95 text-purple-300 rounded-xl font-semibold text-lg shadow-lg border-2 border-purple-500/50 hover:bg-slate-700/80 transition-all duration-300 hover:scale-105"
              >
                View Inspections
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container mx-auto px-4 -mt-10 mb-20 relative z-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Link
            href="/inspection/new"
            className="group bg-slate-800/95 rounded-2xl shadow-xl p-8 border-2 border-purple-500/30 hover:border-purple-400/50 transition-transform duration-200 hover:scale-105 will-change-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-purple-200">New Inspection</h2>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-slate-300 ml-18">
              Create a comprehensive pre-delivery inspection with full checklist support, photo documentation, and GPS tracking
            </p>
          </Link>

          <Link
            href="/inspections"
            className="group bg-slate-800/95 rounded-2xl shadow-xl p-8 border-2 border-indigo-500/30 hover:border-indigo-400/50 transition-transform duration-200 hover:scale-105 will-change-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/50">
                  <Search className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-indigo-200">View Inspections</h2>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-slate-300 ml-18">
              Search, filter, and manage historical inspection reports with advanced search capabilities
            </p>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
            Powerful Features
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Everything you need for comprehensive vehicle inspections
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-blue-500/30 hover:border-blue-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/50">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-200">Photo Collection</h3>
            <p className="text-slate-300 text-sm">
              Capture and store unlimited inspection photos with cloud storage integration
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-green-500/30 hover:border-green-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/50">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-green-200">Barcode Scanning</h3>
            <p className="text-slate-300 text-sm">
              Real-time barcode and QR code scanning using your device camera
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-purple-500/30 hover:border-purple-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-200">GPS Location</h3>
            <p className="text-slate-300 text-sm">
              Automatic GPS location tracking with address reverse geocoding
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-orange-500/30 hover:border-orange-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/50">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-orange-200">PDF Reports</h3>
            <p className="text-slate-300 text-sm">
              Generate professional PDF reports and email them to multiple recipients
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-indigo-500/30 hover:border-indigo-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-indigo-200">Data Security</h3>
            <p className="text-slate-300 text-sm">
              GDPR-compliant data handling with encryption and privacy controls
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-cyan-200">Cloud Storage</h3>
            <p className="text-slate-300 text-sm">
              Secure cloud storage with AWS S3 integration for all your files
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-teal-500/30 hover:border-teal-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/50">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-teal-200">Advanced Search</h3>
            <p className="text-slate-300 text-sm">
              Powerful search and filter capabilities for finding inspections quickly
            </p>
          </div>

          <div className="bg-slate-800/95 rounded-2xl p-8 text-center border-2 border-pink-500/30 hover:border-pink-400/50 transition-transform duration-200 hover:scale-105 will-change-transform group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/50">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-pink-200">Analytics Ready</h3>
            <p className="text-slate-300 text-sm">
              Export data in multiple formats for analysis and reporting
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-300">
            <p>© 2025 PreDelivery. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


