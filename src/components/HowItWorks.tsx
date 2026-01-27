import { Database, Target, MessageSquare } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: "AI analyzes Instagram engagement in real-time",
    description: "Connect your Instagram Business account and our AI automatically collects and structures engagement data from posts, stories, and reels as they happen.",
    step: "01",
  },
  {
    icon: Target,
    title: "AI scores users based on intent signals",
    description: "Our AI analyzes engagement patterns, sentiment, timing, and behavior to identify high-intent users and assign predictive conversion scores.",
    step: "02",
  },
  {
    icon: MessageSquare,
    title: "Send private replies within engagement threads",
    description: "Respond automatically in the context of user engagement via Instagram Graph API — private, contextual, and compliant.",
    step: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl text-gray-900 mb-6 font-bold">
            AI-Powered Engagement Automation
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Three simple steps to turn engagement into revenue
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Connector Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-transparent"></div>
                )}

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 relative z-10 hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-5 -right-5 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-indigo-100">
                    <Icon className="text-indigo-600" size={32} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Note */}
        <div className="mt-20 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-10 max-w-4xl mx-auto shadow-lg">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageSquare className="text-indigo-600" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-indigo-900 mb-3">Privacy First</h4>
              <p className="text-base text-indigo-800 leading-relaxed">
                Wallinst uses the official Instagram Graph API to send private replies within engagement threads. We respect user privacy and only engage with users who have actively interacted with your content. We never send unsolicited direct messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}