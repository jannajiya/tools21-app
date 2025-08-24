// src/components/Footer.tsx
import { motion } from 'framer-motion';
import { FiMail, FiGithub, FiMessageSquare } from 'react-icons/fi';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full border-t border-gray-200 dark:border-gray-800 mt-16 px-4 py-6 bg-gray-50 dark:bg-[#0f172a]"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm gap-4">
        
        {/* Left: Copyright */}
        <p className="text-gray-700 dark:text-gray-400 text-center md:text-left">
          © {new Date().getFullYear()} <span className="font-semibold text-blue-600 dark:text-blue-400">GST Infusion</span>. All rights reserved.
        </p>

        {/* Right: Social Links */}
        <div className="flex gap-4 text-gray-500 dark:text-gray-400 text-xl">
          <a href="mailto:gstinfusion@gmail.com" title="Email" className="hover:text-blue-500 transition">
            <FiMail />
          </a>
          <a href="https://wa.me/919906024765" title="WhatsApp" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
            <FiMessageSquare />
          </a>
          <a href="https://github.com/your-github" title="GitHub" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition">
            <FiGithub />
          </a>
        </div>
      </div>
    </motion.footer>
  );
}