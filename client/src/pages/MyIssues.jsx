import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchMyIssues,
  deleteIssue,
  selectMyIssues,
  selectIssuesLoading,
  selectIssuesError,
} from '../store/slices/issuesSlice';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

function MyIssues() {
  const dispatch = useAppDispatch();

  // Get user's issues from Redux
  const issues = useAppSelector(selectMyIssues);
  const loading = useAppSelector(selectIssuesLoading);
  const error = useAppSelector(selectIssuesError);

  // Fetch user's issues on component mount
  useEffect(() => {
    dispatch(fetchMyIssues());
  }, [dispatch]);

  const handleDelete = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      // Dispatch thunk to delete issue (Redux handles cache update)
      await dispatch(deleteIssue(issueId));
      alert('Issue deleted successfully');
    } catch (err) {
      alert('Failed to delete issue');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Issues</h2>
            <Link
              to="/report"
              className="btn-primary text-center"
            >
              Report New Issue
            </Link>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-civic-red text-white px-4 py-3 rounded-lg mb-6 text-sm sm:text-base"
            >
              {error}
            </motion.div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          )}

          {/* Issues list */}
          {!loading && issues.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {issues.map((issue) => (
                <Link key={issue._id} to={`/issue/${issue._id}`} className="block">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
                    className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-civic-green-500 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                      {/* Left side - issue info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:text-civic-green-600 transition-colors break-words">
                          {issue.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                          <span className="inline-block bg-civic-green-100 text-civic-green-700 px-2 py-1 rounded text-xs font-semibold mr-3">
                            {issue.category}
                          </span>
                          <span className="text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {issue.description.substring(0, 100)}...
                        </p>
                      </div>

                      {/* Right side - status and actions */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
                        <StatusBadge status={issue.status} />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(issue._id);
                          }}
                          className="bg-civic-red hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : !loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center"
            >
              <p className="text-gray-600 text-base sm:text-lg mb-6">You haven't reported any issues yet.</p>
              <Link
                to="/report"
                className="btn-primary inline-block"
              >
                Report Your First Issue
              </Link>
            </motion.div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default MyIssues;
