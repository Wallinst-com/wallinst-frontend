import { Database, TrendingUp, BarChart3, MessageSquare, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: "Engagement Ingestion",
    description: "Automatically collect and structure engagement data from Instagram posts and reels in real-time.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Lead Scoring",
    description: "Advanced AI scoring system identifies high-intent users based on engagement patterns and sentiment analysis.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Media & Campaign Analytics",
    description: "Track performance across posts, stories, and campaigns with AI-driven metrics and conversion attribution.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: MessageSquare,
    title: "Reply Automation",
    description: "Send contextual private replies to engagement threads automatically using Instagram Graph API integration.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Job Tracking",
    description: "Monitor all automation jobs, reply schedules, and engagement workflows in a unified dashboard.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage team access, roles, and permissions with enterprise-grade security and collaboration tools.",
    color: "from-indigo-500 to-purple-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl text-gray-900 mb-6 font-bold">
            Features
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to turn Instagram engagement into qualified leads
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50/50 p-8 rounded-2xl border-2 border-gray-100 hover:border-transparent overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
              >
                {/* Hover Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-indigo-500/20`}>
                    <Icon className="text-white" size={26} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}