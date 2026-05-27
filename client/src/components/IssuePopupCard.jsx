import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser } from "../store/slices/authSlice";
import { upvoteIssueThunk } from "../store/slices/issuesSlice";
import { selectIssuesError } from "../store/slices/issuesSlice";
import StatusBadge from "./StatusBadge";

function IssuePopupCard({ issue, onClose }) {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectIssuesError);
  const user = useAppSelector(selectUser);

  const [isUpvoting, setIsUpvoting] = useState(false);

  const isReporter = user && issue.reportedBy._id === user.id;

  const hasUserUpvoted = user && issue.upvotes?.includes(user.id);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsUpvoting(true);

    await dispatch(upvoteIssueThunk(issue._id));

    setIsUpvoting(false);
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="w-80 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200"
    >
      {issue.imageUrls && issue.imageUrls.length > 0 && (
        <div className="relative h-40 overflow-hidden bg-gray-200">
          <img
            src={issue.imageUrls[0]}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
          {issue.imageUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
              +{issue.imageUrls.length - 1} more
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-civic-green-600">
          {issue.title}
        </h3>

        <div className="mb-3">
          <span className="inline-block bg-civic-green-100 text-civic-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            {issue.category}
          </span>
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {truncateText(issue.description, 120)}
        </p>

        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1">Status:</p>
          <StatusBadge status={issue.status} />
        </div>

        <div className="mb-3 pb-3 border-b border-gray-200">
          <p className="text-xs text-gray-500">
            Reported by{" "}
            <span className="font-semibold">
              {issue.reportedBy?.name || "Anonymous"}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {!isReporter && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition-colors text-sm ${
                hasUserUpvoted
                  ? 'bg-civic-green-500 hover:bg-civic-green-600 text-white'
                  : 'bg-civic-green-50 hover:bg-civic-green-100 text-civic-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUpvoting ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  {hasUserUpvoted ? 'Removing...' : 'Upvoting...'}
                </>
              ) : (
                <>
                  {hasUserUpvoted ? '✓ Upvoted' : '👍 ' + (issue.upvotes?.length || 0)}
                </>
              )}
            </motion.button>
          )}

          <Link
            to={`/issue/${issue._id}`}
            className={`${!isReporter ? 'flex-1' : 'w-full'} text-center bg-civic-green-50 hover:bg-civic-green-100 text-civic-green-600 px-3 py-2 rounded-lg font-semibold transition-colors text-sm`}
            onClick={onClose}
          >
            View Details
          </Link>
        </div>

        {error && <p className="text-red-500 text-xs mt-2">Error: {error}</p>}
      </div>
    </motion.div>
  );
}

export default IssuePopupCard;
