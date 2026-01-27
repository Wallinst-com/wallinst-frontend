// src/components/Footer.tsx
import React from 'react';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * If you're not on "/", navigate home first, then scroll.
   * This avoids "element not found" when Footer is used on other routes.
   */
  const goHomeAndScroll = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      // wait for route render, then scroll
      setTimeout(() => scrollToSection(id), 50);
    } else {
      scrollToSection(id);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t-4 border-indigo-600">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Company */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Company</h3>
            <div className="space-y-2">
              <button
                onClick={() => goHomeAndScroll('product')}
                className="block w-full text-left text-gray-400 hover:text-white transition-colors text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                About
              </button>
              <button
                onClick={() => goHomeAndScroll('contact')}
                className="block w-full text-left text-gray-400 hover:text-white transition-colors text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Product</h3>
            <div className="space-y-2">
              <button
                onClick={() => goHomeAndScroll('features')}
                className="block w-full text-left text-gray-400 hover:text-white transition-colors text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Features
              </button>
              <button
                onClick={() => goHomeAndScroll('how-it-works')}
                className="block w-full text-left text-gray-400 hover:text-white transition-colors text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Legal</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="block w-full text-left text-gray-400 hover:text-white transition-colors text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/terms')}
                className="block w-full text-left text-gray-400 hover:text-white transition-colors text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Wallinst
            </button>
            <div className="text-sm text-gray-400 font-medium">
              © {currentYear} Wallinst. All rights reserved.
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61581048805381#"
              target="_blank"
              rel="noreferrer"
              aria-label="Wallinst on Facebook"
              className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 hover:scale-110 flex items-center justify-center transition-all duration-300 group shadow-lg backdrop-blur-sm border border-white/10 hover:border-transparent"
            >
              <Facebook size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>
            <a
              href="https://www.linkedin.com/company/wallinst"
              target="_blank"
              rel="noreferrer"
              aria-label="Wallinst on LinkedIn"
              className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 hover:scale-110 flex items-center justify-center transition-all duration-300 group shadow-lg backdrop-blur-sm border border-white/10 hover:border-transparent"
            >
              <Linkedin size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>
            <a
              href="https://www.instagram.com/wallinst.ltd/"
              target="_blank"
              rel="noreferrer"
              aria-label="Wallinst on Instagram"
              className="w-11 h-11 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-600 hover:scale-110 flex items-center justify-center transition-all duration-300 group shadow-lg backdrop-blur-sm border border-white/10 hover:border-transparent"
            >
              <Instagram size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}