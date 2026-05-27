import React from 'react';
import { motion } from 'framer-motion';

function StatusBadge({ status }) {
  const getStatusClasses = () => {
    switch (status) {
      case 'open':
        return 'bg-civic-red text-white';
      case 'in-progress':
        return 'bg-civic-yellow text-gray-800';
      case 'resolved':
        return 'bg-civic-success text-white';
      case 'rejected':
        return 'bg-civic-gray text-white';
      default:
        return 'bg-civic-green-500 text-white';
    }
  };

  const getDisplayText = () => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusClasses()}`}
    >
      {getDisplayText()}
    </motion.span>
  );
}

export default StatusBadge;

