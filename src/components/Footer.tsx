import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle, Gamepad2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 px-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">µLearn</span>
              </div>
              <span className="text-xl font-bold text-white dark:text-white">GECI</span>
            </div>
            <p className="text-gray-400 dark:text-gray-400 text-sm leading-relaxed">
              Empowering students through innovation, collaboration, and continuous learning in technology and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/events" className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/theme" className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors">Theme</Link></li>
              <li><Link to="/about" className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 dark:text-gray-400 text-sm"> mulearn@gecidukki.ac.in
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 dark:text-gray-400 text-sm">+91 6282 089 432</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 dark:text-gray-400 text-sm">Government Engineering College Idukki</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">Follow Us</h3>
            <div className="flex space-x-4">
              <a 
                href="https://discord.gg/c25EZQzd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors"
                onClick={() => window.open('https://discord.gg/c25EZQzd', '_blank')}
              >
                <Gamepad2 className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/mulearn.geci?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors"
                onClick={() => window.open('https://www.instagram.com/mulearn.geci?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', '_blank')}
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://chat.whatsapp.com/CR4zAR4yELmClICDZm5vOP?mode=ac_t" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-400 hover:text-white transition-colors"
                onClick={() => window.open('https://chat.whatsapp.com/CR4zAR4yELmClICDZm5vOP?mode=ac_t', '_blank')}
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-400 text-sm">
            © 2025 µLearn Community. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}