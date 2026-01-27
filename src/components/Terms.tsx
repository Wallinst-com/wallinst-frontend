import React from 'react';
import { Link } from 'react-router-dom';

export function TermsSection() {
  return (
    <section className="py-20 bg-white" id="terms">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-10 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
          <p className="text-gray-600 mb-6">
            By using Wallinst, you agree to basic terms that protect your data, your account,
            and the platform. This summary is provided for convenience; the full terms are
            available on the Terms of Service page.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use Wallinst only for accounts you own or are authorized to manage.</li>
            <li>Do not misuse the service or attempt to access other users' data.</li>
            <li>AI insights are informational and should not be treated as legal advice.</li>
            <li>We may suspend access for abuse, security risks, or policy violations.</li>
          </ul>
          <div className="mt-6">
            <Link
              to="/terms"
              className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Read full Terms of Service →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <p className="text-gray-700 mb-4">Last updated: January 2026</p>

        <p className="text-gray-700 mb-6">
          These Terms of Service ("Terms") govern your use of the Wallinst platform. By
          accessing or using Wallinst, you agree to be bound by these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Eligibility</h2>
        <p className="text-gray-700 mb-4">
          You must have authority to connect the social accounts you manage. You are
          responsible for ensuring you comply with Meta platform policies.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. Acceptable Use</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Use Wallinst only for lawful purposes.</li>
          <li>Do not attempt to access data belonging to other users.</li>
          <li>Do not interfere with or disrupt the service.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Data & Privacy</h2>
        <p className="text-gray-700 mb-4">
          We process data in accordance with our Privacy Policy. You retain ownership of
          your content; we use it only to provide the service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. AI Insights</h2>
        <p className="text-gray-700 mb-4">
          AI-generated insights are informational and may not be accurate. You are
          responsible for any decisions based on these insights.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Service Availability</h2>
        <p className="text-gray-700 mb-4">
          We aim for high availability but do not guarantee uninterrupted service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">6. Termination</h2>
        <p className="text-gray-700 mb-4">
          We may suspend or terminate access if we detect abuse, security issues, or
          policy violations.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">7. Contact</h2>
        <p className="text-gray-700 mb-2">Questions about these Terms?</p>
        <p className="text-gray-900 font-semibold">contact@wallinst.com</p>

        <div className="mt-12 text-sm text-gray-400">
          © {new Date().getFullYear()} Wallinst. All rights reserved.
        </div>
      </div>
    </div>
  );
}
