// src/components/ToolCard.tsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';

interface ToolCardProps {
  title: string;
  description: string;
  icon: IconType;
  to?: string;
  onClick?: () => void;
  hoverAnimation?: any; // animation object passed from parent
}

export default function ToolCard({
  title,
  description,
  icon: Icon,
  to,
  onClick,
  hoverAnimation,
}: ToolCardProps) {
  const content = (
    <div
      onClick={onClick}
      className="cursor-pointer w-64 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition duration-300 group"
    >
      <motion.div
        className="text-blue-600 dark:text-blue-400 mb-4 inline-block"
        whileHover={hoverAnimation}
      >
        <Icon size={36} />
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );

  return to ? (
    <Link to={to} className="focus:outline-none">{content}</Link>
  ) : (
    <div className="focus:outline-none">{content}</div>
  );
}
