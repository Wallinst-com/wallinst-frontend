import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onSignIn: () => void;
  onRequestAccess: () => void;
}

export function Navbar({ onSignIn, onRequestAccess }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-gray-200/50' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Wallinst
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('product')}
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Contact
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              FAQ
            </button>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onSignIn}
              className="text-gray-600 hover:text-gray-900 transition-colors px-5 py-2.5 font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={onRequestAccess}
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-7 py-2.5 rounded-xl hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 font-bold flex items-center gap-2"
            >
              Request Early Access
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <button
              onClick={() => scrollToSection('product')}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
            >
              Contact
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-medium"
            >
              FAQ
            </button>
            <div className="pt-2 space-y-2">
              <button
                onClick={onSignIn}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={onRequestAccess}
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
              >
                Request Early Access
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}