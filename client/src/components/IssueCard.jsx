import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

function IssueCard({ issue, onUpvote }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const upvoteVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <Link to={`/issue/${issue._id}`} className="block">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 cursor-pointer"
      >
        {issue.imageUrls && issue.imageUrls.length > 0 && (
          <div className="h-48 overflow-hidden bg-gray-200">
            <img
              src={issue.imageUrls[0]}
              alt={issue.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-5">
          <span className="inline-block bg-civic-green-100 text-civic-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-3 hover:bg-civic-green-200 transition-colors">
            {issue.category}
          </span>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-civic-green-600 transition-colors">
            {issue.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {issue.description.length > 100
              ? issue.description.substring(0, 100) + '...'
              : issue.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <StatusBadge status={issue.status} />

            <motion.button
              variants={upvoteVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={(e) => {
                e.preventDefault();
                onUpvote && onUpvote(issue._id);
              }}
              className="flex items-center gap-2 bg-civic-green-50 hover:bg-civic-green-100 text-civic-green-600 px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              👍 {issue.upvotes ? issue.upvotes.length : 0}
            </motion.button>
          </div>

          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Reported by {issue.reportedBy?.name || 'Unknown'}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export default IssueCard;

