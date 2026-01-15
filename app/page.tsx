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
      {/* Hero Section - SiteGround AI Studio Style */}
      <div className="relative bg-gradient-to-b from-blue-950 via-purple-950 to-blue-950 min-h-screen w-full overflow-hidden">
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
                <button className="bg-[#3833FF] hover:bg-[#3833FF]/90 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-[#3833FF]/30 hover:scale-105 transition-all flex items-center gap-2 border border-[#3833FF]/50">
                  <Calendar className="w-4 h-4" />
                  <span>Book a demo</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-2.5 rounded-full border-2 border-white/30 hover:scale-105 transition-all flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Talk to sales</span>
                </button>
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


