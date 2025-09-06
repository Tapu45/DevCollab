import React from 'react';
import { motion } from 'framer-motion';
import { usePage } from '@/context/PageContext';

export default function PageHeader() {
  const { title, description } = usePage();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-center mr-4 p-2   "
    >
      <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight font-medium">
        {description}
      </p>
    </motion.div>
  );
}