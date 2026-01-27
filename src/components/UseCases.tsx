import { Megaphone, ShoppingBag, Rocket, Store } from 'lucide-react';

const useCases = [
  {
    icon: Megaphone,
    title: "Marketing Agencies",
    description: "Manage multiple client accounts, prove ROI with AI-driven insights, and scale engagement campaigns efficiently.",
    benefits: ["Multi-client dashboard", "White-label reports", "AI campaign ROI tracking"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Brands",
    description: "Convert engaged followers into customers by identifying purchase intent signals with AI and responding at the right moment.",
    benefits: ["AI purchase intent scoring", "Product mention tracking", "Conversion attribution"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Rocket,
    title: "Growth Teams",
    description: "Automate lead qualification from Instagram engagement using AI and integrate high-intent users into your sales funnel.",
    benefits: ["AI-automated lead scoring", "CRM integration ready", "Growth metrics"],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Store,
    title: "Local Service Businesses",
    description: "Build relationships with local customers through timely, AI-powered responses to engagement and inquiries.",
    benefits: ["Local engagement focus", "AI response automation", "Customer relationship tracking"],
    gradient: "from-violet-500 to-purple-500",
  },
];

export function UseCases() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl text-gray-900 mb-6 font-bold">
            Built for Modern Teams
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Wallinst scales with your business — from agencies to enterprise brands
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-transparent overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20"
              >
                {/* Hover Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="text-white" size={26} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {useCase.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mt-6 space-y-3 pl-[72px]">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${useCase.gradient}`}></div>
                        <span className="font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}