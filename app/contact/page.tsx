'use client';

import { useState } from 'react';
import { Mail, Send, MessageSquare, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General enquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Here you would typically send the form data to your API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General enquiry',
        message: ''
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#3833FF] via-blue-600 to-purple-600 py-20 sm:py-24 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[900px] h-[900px] bg-gradient-to-br from-white/30 via-blue-300/20 to-cyan-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-purple-300/30 via-pink-300/20 to-indigo-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-blue-400/25 via-cyan-400/15 to-indigo-400/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        {/* Mesh overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/10"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="relative py-20 sm:py-24 overflow-hidden">
        {/* Dynamic gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[850px] h-[850px] bg-gradient-to-br from-blue-400/40 via-cyan-400/30 to-indigo-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[750px] h-[750px] bg-gradient-to-bl from-purple-400/40 via-pink-400/30 to-blue-400/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-[650px] h-[650px] bg-gradient-to-tr from-cyan-400/35 via-blue-400/25 to-indigo-400/35 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        </div>
        {/* Mesh gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-100/25 to-indigo-100/25"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-100/20 to-purple-100/20"></div>
        {/* Animated dot pattern */}
        <div className="absolute inset-0 opacity-[0.12]" style={{backgroundImage: 'radial-gradient(circle at 3px 3px, rgba(56,51,255,0.3) 2px, transparent 0)', backgroundSize: '55px 55px'}}></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-8 sm:p-12">
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800">Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#3833FF]" />
                        <span>Name</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3833FF] focus:border-transparent transition-all outline-none"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#3833FF]" />
                        <span>Email</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3833FF] focus:border-transparent transition-all outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#3833FF]" />
                        <span>Subject</span>
                      </div>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3833FF] focus:border-transparent transition-all outline-none bg-white"
                    >
                      <option value="General enquiry">General enquiry</option>
                      <option value="Sales">Sales</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#3833FF]" />
                        <span>How can we help?</span>
                      </div>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3833FF] focus:border-transparent transition-all outline-none resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#3833FF] to-blue-600 hover:from-[#3833FF]/90 hover:to-blue-600/90 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Contact Information */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Or reach us directly at:</p>
                    <a 
                      href="mailto:info@predelivery.ai" 
                      className="inline-flex items-center gap-2 text-[#3833FF] font-semibold hover:text-blue-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>info@predelivery.ai</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
