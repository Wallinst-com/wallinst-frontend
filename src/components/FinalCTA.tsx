import { ArrowRight, Sparkles, CheckCircle2, BadgeCheck } from 'lucide-react';

interface FinalCTAProps {
  onRequestAccess: () => void;
}

export function FinalCTA({ onRequestAccess }: FinalCTAProps) {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/40">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative px-8 py-20 sm:px-12 sm:py-24 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm mb-8">
              <Sparkles className="text-white" size={18} />
              <span className="text-sm font-bold text-white">Limited Availability</span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Get Early Access to Wallinst
            </h2>
            
            {/* Subtext */}
            <p className="text-2xl text-indigo-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Be among the first businesses to turn Instagram engagement into qualified leads using AI.
            </p>

            {/* CTA Button */}
            <div>
              <button
                onClick={onRequestAccess}
                className="group bg-white text-indigo-600 px-12 py-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 font-bold text-xl"
              >
                Request Early Access
                <ArrowRight size={26} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <BadgeCheck className="text-green-300 flex-shrink-0 mt-1" size={26} />
                  <div className="text-left">
                    <div className="text-white font-bold mb-2 text-lg">60-Day Guarantee</div>
                    <div className="text-sm text-indigo-100">Money-back, risk-free trial</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-green-300 flex-shrink-0 mt-1" size={26} />
                  <div className="text-left">
                    <div className="text-white font-bold mb-2 text-lg">Dedicated Support</div>
                    <div className="text-sm text-indigo-100">Strategic onboarding</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-green-300 flex-shrink-0 mt-1" size={26} />
                  <div className="text-left">
                    <div className="text-white font-bold mb-2 text-lg">Locked-in Pricing</div>
                    <div className="text-sm text-indigo-100">Grandfathered rates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="mt-10">
              <p className="text-base text-indigo-200 font-semibold">
                ⚡ Applications reviewed on a rolling basis
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}