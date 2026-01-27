import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { DashboardPreview } from './DashboardPreview';

interface HeroProps {
  onRequestAccess: () => void;
}

export function Hero({ onRequestAccess }: HeroProps) {
  return (
    <section id="product" className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50/30"></div>
      
      {/* Animated Glow Effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10 z-10">
            <div className="space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-2 border-indigo-200 shadow-lg shadow-indigo-500/20">
                <Sparkles size={20} className="text-indigo-600" />
                <span className="text-sm font-bold text-gray-800">AI-Powered</span>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <ShieldCheck size={20} className="text-blue-600" />
                <span className="text-sm font-bold text-gray-800">Meta Verified</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                <span className="block text-gray-900">Turn Instagram</span>
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent py-2">
                  Engagement
                </span>
                <span className="block text-gray-900">into Qualified Leads</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl font-light">
                AI-powered engagement analysis that identifies high-intent users and helps convert them into customers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={onRequestAccess}
                className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-12 py-6 rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-3 font-bold text-xl"
              >
                Request Early Access
                <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>

            {/* Key Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-base font-bold text-gray-800">AI Lead Scoring</span>
              </div>
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-base font-bold text-gray-800">Automated Replies</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="lg:pl-8 z-10">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}