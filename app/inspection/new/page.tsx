'use client';

import InspectionForm from '@/components/InspectionForm';
import { ArrowLeft, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function NewInspectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 overflow-x-hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 mb-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 hover:text-white rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="bg-slate-800/90 bg-slate-800/95 rounded-2xl shadow-2xl p-8 md:p-12 max-w-7xl mx-auto animate-slide-up border-2 border-purple-500/30">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-lg shadow-purple-500/50">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 mb-2">New Hazard Inspection</h1>
              <p className="text-purple-200">Complete the form below to create a new inspection report</p>
            </div>
          </div>
          <InspectionForm />
        </div>
      </div>
    </div>
  );
}


