// frontend/src/components/Footer.jsx

import React from 'react';
import { Pill, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-2">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">PharmaCare</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted pharmacy management solution for seamless healthcare delivery
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-blue-400 p-2 rounded-full transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-pink-600 p-2 rounded-full transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 hover:bg-blue-700 p-2 rounded-full transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Partner With Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Phone</div>
                  <a href="tel:+919876543210" className="hover:text-white transition-colors">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Email</div>
                  <a href="mailto:support@pharmacare.com" className="hover:text-white transition-colors">
                    support@pharmacare.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Location</div>
                  <span>Delhi, India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="font-semibold text-lg mb-2">Subscribe to Our Newsletter</h4>
              <p className="text-gray-400 text-sm">
                Get the latest updates on health tips, medicine alerts, and special offers
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2025 PharmaCare. All rights reserved. Made with ❤️ in India
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Sitemap
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Accessibility
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Legal
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500 text-xs">
            <div className="flex items-center space-x-2">
              <div className="bg-green-500 rounded-full p-1">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>100% Genuine Medicines</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 rounded-full p-1">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-purple-500 rounded-full p-1">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 rounded-full p-1">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <span>Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;