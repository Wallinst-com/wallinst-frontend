import { Mail, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';

type ContactFormData = {
  name: string;
  email: string;
  company: string;
  message: string;
};

export function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      setIsSubmitting(true);
      setSubmitError('');
      setSubmitSuccess(false);
      try {
        const base = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${base}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form_name: 'Request Early Access',
            _subject: 'Wallinst Early Access Request',
            name: formData.name,
            email: formData.email,
            company: formData.company,
            message: formData.message,
            _gotcha: '',
          }),
        });
        const data = await res.json();
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.error || 'Failed to send request.');
        }
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', company: '', message: '' });
      } catch (err: any) {
        setSubmitError(err?.message || 'Failed to send request.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 mb-6 shadow-sm">
                <span className="text-sm font-bold text-indigo-700">Limited Availability</span>
              </div>
              <h2 className="text-5xl sm:text-6xl text-gray-900 mb-6 font-bold">
                Get Early Access to Wallinst
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Be among the first 25 businesses to turn social engagement into qualified leads using AI.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">3 Months Free Access</h3>
                  <p className="text-sm text-gray-600">Full access to all enterprise features</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MessageSquare className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">Dedicated Onboarding</h3>
                  <p className="text-sm text-gray-600">Strategic consulting from our founding team</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">Grandfathered Pricing</h3>
                  <p className="text-sm text-gray-600">Lock in exclusive rates for life</p>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-6">
              <p className="text-sm font-bold text-indigo-900">
                ⚡ Only 25 pilot spots available for Q1 2026
              </p>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-2xl p-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Request Early Access</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your use case
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                  placeholder="How do you plan to use Wallinst?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-5 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : 'Submit Application'}
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {submitSuccess ? (
                <p className="text-sm text-green-600 text-center font-semibold">
                  Thanks! Your request was sent successfully.
                </p>
              ) : submitError ? (
                <p className="text-sm text-red-600 text-center font-semibold">
                  {submitError}
                </p>
              ) : (
                <p className="text-sm text-gray-500 text-center font-medium">
                  We'll review your application and respond within 48 hours
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}