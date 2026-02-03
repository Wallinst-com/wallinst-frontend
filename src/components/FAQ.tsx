import React, { useState } from 'react';
import { ChevronDown, Rocket } from 'lucide-react';

const faqs = [
  {
    question: "How does Wallinst access my Instagram data?",
    answer: "Wallinst uses the official Instagram Graph API to securely access engagement data from your Instagram Business account. You maintain full control and can revoke access at any time. We only collect public engagement data and respect all privacy guidelines.",
  },
  {
    question: "What kind of private replies can Wallinst send?",
    answer: "Wallinst sends AI-powered private replies within engagement threads using Instagram Graph API. Replies are contextual and sent only to users who have actively engaged with your content. We never send unsolicited direct messages.",
  },
  {
    question: "How does the AI lead scoring work?",
    answer: "Our AI-powered system analyzes multiple engagement signals including frequency, sentiment, timing, engagement depth, and historical patterns. The algorithm continuously learns and adapts, assigning scores from 0-100 with higher scores indicating stronger purchase intent or conversion likelihood.",
  },
  {
    question: "Can I customize the AI automation rules?",
    answer: "Not fully yet. During the pilot, automation rules are managed by the Wallinst team to keep replies compliant with Meta policies and your brand voice. You can request adjustments, and more self-serve controls are coming soon.",
  },
  {
    question: "Is Wallinst compliant with Instagram's policies?",
    answer: "Absolutely. Wallinst is built on the official Instagram Graph API and follows all Meta platform guidelines. We only use approved API endpoints and ensure all AI-driven automation respects rate limits and user privacy requirements.",
  },
  {
    question: "How long does setup take?",
    answer: "Most teams are up and running within 24 hours. Setup includes connecting your Instagram Business account, configuring AI lead scoring parameters, and setting up your first automation workflow. Our team provides guided onboarding for all pilot participants.",
  },
  {
    question: "What are the pilot program benefits?",
    answer: "Pilot participants receive a 60-day money-back guarantee, unlimited AI features, dedicated onboarding support, priority feature requests, and grandfathered pricing when we launch publicly. Limited availability for Q1 2026.",
  },
  {
    question: "What kind of support do you provide?",
    answer: "All plans include email support. Pilot participants receive dedicated account management and direct access to our founding team for custom configuration and integrations.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl text-gray-900 mb-6 font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Wallinst
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-indigo-200 shadow-xl shadow-indigo-500/10' 
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4 text-lg">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${
                  openIndex === index 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
                    : 'bg-gray-100'
                } flex items-center justify-center transition-all duration-300`}>
                  <ChevronDown
                    size={18}
                    className={`${
                      openIndex === index ? 'text-white rotate-180' : 'text-gray-600'
                    } transition-transform duration-300`}
                  />
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 pt-1">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Rocket className="text-indigo-600" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900"> Support</h3>
                <p className="text-gray-700">
                  Still have questions? Talk to our team.
                </p>
              </div>
            </div>
            <button
              onClick={scrollToContact}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline decoration-2 underline-offset-2"
            >
              Contact our team
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}