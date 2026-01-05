'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, Trash2, Check } from 'lucide-react';

export default function PrivacyPage() {
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
                Privacy & Data Protection
              </h1>
              
              {/* Bullet Points */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3833FF] flex items-center justify-center mr-4 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl text-white/90">
                    GDPR-compliant data handling and protection
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3833FF] flex items-center justify-center mr-4 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl text-white/90">
                    Encrypted data storage and secure transmission
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3833FF] flex items-center justify-center mr-4 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg sm:text-xl text-white/90">
                    Your rights to access, modify, and delete your data
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
                        <Shield className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-white/80 text-lg">Data Security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 mb-6 bg-[#3833FF]/10 hover:bg-[#3833FF]/20 text-black rounded-xl border-2 border-[#3833FF]/30 hover:border-[#3833FF]/50 shadow-lg transition-all duration-300 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#3833FF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl border-2 border-[#3833FF]/30">
          <h1 className="text-3xl font-bold mb-8 text-black">Privacy & Data Protection</h1>

          <div className="space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-[#3833FF] mr-2" />
                <h2 className="text-2xl font-semibold text-black">Data Collection</h2>
              </div>
              <p className="text-black/70 mb-4">
                We collect inspection data including inspector information, vehicle details,
                inspection checklists, photos, GPS locations, and barcodes. All data is
                collected with explicit consent and stored securely.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-[#3833FF] mr-2" />
                <h2 className="text-2xl font-semibold text-black">Data Security</h2>
              </div>
              <ul className="list-disc list-inside text-black/70 space-y-2">
                <li>All data is encrypted in transit and at rest</li>
                <li>Cloud storage uses industry-standard security practices</li>
                <li>Access controls limit data access to authorized personnel only</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <FileText className="w-6 h-6 text-blue-400 mr-2" />
                <h2 className="text-2xl font-semibold text-blue-200">Data Retention</h2>
              </div>
              <p className="text-black/70 mb-4">
                Inspection data is retained for a configurable period (default: 365 days).
                After the retention period expires, data is automatically deleted in
                accordance with our data retention policy.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Trash2 className="w-6 h-6 text-red-400 mr-2" />
                <h2 className="text-2xl font-semibold text-red-200">Your Rights</h2>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>
                  <strong className="text-red-300">Right to Access:</strong> You can request a copy of your inspection data
                </li>
                <li>
                  <strong className="text-red-300">Right to Rectification:</strong> You can update or correct your data
                </li>
                <li>
                  <strong className="text-red-300">Right to Erasure:</strong> You can request deletion of your data
                </li>
                <li>
                  <strong className="text-red-300">Right to Data Portability:</strong> You can export your data in a
                  machine-readable format
                </li>
                <li>
                  <strong className="text-red-300">Right to Object:</strong> You can object to certain processing of your
                  data
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-green-200">GDPR Compliance</h2>
              <p className="text-black/70 mb-4">
                This application is designed to comply with the General Data Protection
                Regulation (GDPR) and other applicable data protection laws. We implement
                appropriate technical and organizational measures to ensure data protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-200">Contact</h2>
              <p className="text-slate-300">
                For privacy-related inquiries or to exercise your rights, please contact the
                data protection officer or system administrator.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


