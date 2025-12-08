'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileText, Trash2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 mb-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-xl p-8 max-w-4xl border-2 border-purple-500/30">
          <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">Privacy & Data Protection</h1>

          <div className="space-y-8">
            <section>
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-2xl font-semibold text-purple-200">Data Collection</h2>
              </div>
              <p className="text-slate-300 mb-4">
                We collect inspection data including inspector information, vehicle details,
                inspection checklists, photos, GPS locations, and barcodes. All data is
                collected with explicit consent and stored securely.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-4">
                <Lock className="w-6 h-6 text-indigo-400 mr-2" />
                <h2 className="text-2xl font-semibold text-indigo-200">Data Security</h2>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
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
              <p className="text-slate-300 mb-4">
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
              <p className="text-slate-300 mb-4">
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


