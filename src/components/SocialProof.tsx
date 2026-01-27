import { Rocket, Users, Zap, Lock, ArrowRight } from 'lucide-react';

const benefits = [
  {
    icon: Rocket,
    title: "3 Months Free Access",
    description: "Full access to all enterprise features during the pilot program at no cost",
  },
  {
    icon: Users,
    title: "Dedicated Onboarding",
    description: "1-on-1 setup assistance and strategic consulting from our founding team",
  },
  {
    icon: Zap,
    title: "Unlimited Enterprise Features",
    description: "No feature restrictions — unlimited accounts, engagement, and AI automation",
  },
  {
    icon: Lock,
    title: "Grandfathered Pricing",
    description: "Lock in exclusive pilot pricing for life when we launch publicly",
  },
];

interface SocialProofProps {
  onRequestAccess: () => void;
}

export function SocialProof({ onRequestAccess }: SocialProofProps) {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 mb-6 shadow-sm">
            <span className="text-sm font-bold text-indigo-700">Limited Pilot Program — Now Open</span>
          </div>
          <h2 className="text-5xl sm:text-6xl text-gray-900 mb-6 font-bold">
            Join the Wallinst Pilot
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Only <span className="font-bold text-gray-900">25 companies</span> will be accepted for Q1 2026. Be among the first to turn engagement into qualified leads with AI.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                  <Icon className="text-white" size={26} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-5 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 font-bold text-lg mb-4" onClick={onRequestAccess}>
            Request Early Access
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 font-medium">Applications close when all 25 spots are filled</p>
        </div>
      </div>
    </section>
  );
}