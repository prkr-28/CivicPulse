import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import axiosInstance from '../api/axiosInstance';
import {
  fetchAdminIssues,
  updateIssueStatus,
  selectAdminIssues,
  selectIssuesLoading,
} from '../store/slices/issuesSlice';
import { fetchAdminStats, selectAdminStats } from '../store/slices/adminSlice';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get stats from Redux
  const stats = useAppSelector(selectAdminStats);

  // Get admin issues from Redux
  const issues = useAppSelector(selectAdminIssues);
  const loading = useAppSelector(selectIssuesLoading);

  // State for priority calculation
  const [calculatingPriorities, setCalculatingPriorities] = useState(false);
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'date', 'upvotes'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'Critical', 'High', 'Medium', 'Low'

  // Fetch admin data on component mount
  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminIssues());
  }, [dispatch]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await dispatch(updateIssueStatus({ issueId, newStatus }));
      alert('Status updated successfully');
      dispatch(fetchAdminStats());
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCalculatePriorities = async () => {
    setCalculatingPriorities(true);
    try {
      const response = await axiosInstance.post('/admin/calculate-priorities');

      if (response.data.issues) {
        alert(`✅ Priority scores calculated for ${response.data.count} issues!`);
        // Refresh issues to show updated priorities
        dispatch(fetchAdminIssues());
      }
    } catch (error) {
      console.error('Error calculating priorities:', error);
      alert('Failed to calculate priorities. Please try again.');
      console.error('Calculate priorities error:', error);
    } finally {
      setCalculatingPriorities(false);
    }
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Sort issues
  const activeIssues = issues.filter(i => ['open', 'in-progress'].includes(i.status));
  const resolvedIssues = issues.filter(i => ['resolved', 'rejected'].includes(i.status));

  const sortedIssues = [...activeIssues].sort((a, b) => {
    if (sortBy === 'priority') {
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    } else if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'upvotes') {
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    }
    return 0;
  });

  // Filter by priority
  const filteredActiveIssues = filterPriority === 'all'
    ? sortedIssues
    : sortedIssues.filter(issue => issue.priorityLevel === filterPriority);

  const sortedResolvedIssues = [...resolvedIssues].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getStatCardColor = (type) => {
    switch (type) {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8"
          >
            Admin Dashboard
          </motion.h2>

          {/* Priority Calculation & Sorting Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCalculatePriorities}
                disabled={calculatingPriorities}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap"
              >
                {calculatingPriorities ? '⏳ Calculating...' : '🤖 Calculate Priorities'}
              </motion.button>

              {/* Sort Options */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm"
                  >
                    <option value="priority">Priority Score</option>
                    <option value="date">Most Recent</option>
                    <option value="upvotes">Most Upvotes</option>
                  </select>
                </div>

                {/* Filter Options */}
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Filter By Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          )}

          {/* Statistics cards */}
          {!loading && stats && (
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
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12"
            >
              {[
                { label: 'Total Issues', value: stats.issues.total, type: 'default' },
                { label: 'Open', value: stats.issues.open, type: 'open' },
                { label: 'In Progress', value: stats.issues['in-progress'], type: 'in-progress' },
                { label: 'Resolved', value: stats.issues.resolved, type: 'resolved' },
                { label: 'Rejected', value: stats.issues.rejected, type: 'rejected' },
                { label: 'Resolution Rate', value: stats.resolutionRate, type: 'default' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={statCardVariants}
                  className={`rounded-lg shadow-md p-3 sm:p-4 md:p-6 ${getStatCardColor(stat.type)}`}
                >
                  <h3 className="text-xs sm:text-sm font-semibold opacity-90 mb-1 sm:mb-2">{stat.label}</h3>
                  <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Issues table */}
          {!loading && filteredActiveIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Active Issues</h3>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredActiveIssues.map((issue) => (
                  <Link key={issue._id} to={`/admin/issue/${issue._id}`} className="block">
                    <motion.div
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-semibold">Title</p>
                          <p className="font-medium text-gray-900 text-sm break-words">{issue.title}</p>
                        </div>
                        {issue.priorityLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${getPriorityColor(issue.priorityLevel)}`}>
                            {issue.priorityLevel}
                          </span>
                        )}
                      </div>

                      {issue.priorityReason && (
                        <p className="text-xs text-gray-600 italic">{issue.priorityReason}</p>
                      )}

                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Category</p>
                          <span className="bg-civic-green-100 text-civic-green-700 px-2 py-1 rounded text-xs font-semibold inline-block">
                            {issue.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Upvotes</p>
                          <p className="font-semibold text-gray-600 text-sm">{issue.upvotes?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Reported By</p>
                          <p className="text-gray-600 text-sm">{issue.reportedBy?.name || 'Unknown'}</p>
                        </div>
                        <select
                          value={issue.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(issue._id, e.target.value);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-civic-green-500 focus:border-transparent"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Priority</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Reported By</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">Upvotes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredActiveIssues.map((issue) => (
                      <motion.tr
                        key={issue._id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/issue/${issue._id}`)}
                      >
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm font-medium text-gray-900 max-w-xs truncate">
                          {issue.title}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600">
                          <span className="bg-civic-green-100 text-civic-green-700 px-2 py-1 rounded text-xs font-semibold">
                            {issue.category}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm">
                          {issue.priorityLevel ? (
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded text-xs font-bold border text-center ${getPriorityColor(issue.priorityLevel)}`}>
                                {issue.priorityLevel}
                              </span>
                              <span className="text-xs text-gray-600">{issue.priorityScore}/10</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm">
                          <select
                            value={issue.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(issue._id, e.target.value);
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-civic-green-500 focus:border-transparent"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600">
                          {issue.reportedBy?.name || 'Unknown'}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-500">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600 text-center font-semibold">
                          {issue.upvotes?.length || 0}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Resolved Issues Section */}
          {!loading && sortedResolvedIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Resolved Issues</h3>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {sortedResolvedIssues.map((issue) => (
                  <Link key={issue._id} to={`/admin/issue/${issue._id}`} className="block">
                    <motion.div
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-semibold">Title</p>
                          <p className="font-medium text-gray-900 text-sm break-words">{issue.title}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${issue.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                          {issue.status === 'resolved' ? 'Resolved' : 'Rejected'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Category</p>
                          <span className="bg-civic-green-100 text-civic-green-700 px-2 py-1 rounded text-xs font-semibold inline-block">
                            {issue.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Upvotes</p>
                          <p className="font-semibold text-gray-600 text-sm">{issue.upvotes?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Reported By</p>
                          <p className="text-gray-600 text-sm">{issue.reportedBy?.name || 'Unknown'}</p>
                        </div>
                        <select
                          value={issue.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(issue._id, e.target.value);
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-civic-green-500 focus:border-transparent"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Reported By</th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">Upvotes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedResolvedIssues.map((issue) => (
                      <motion.tr
                        key={issue._id}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/issue/${issue._id}`)}
                      >
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm font-medium text-gray-900 max-w-xs truncate">
                          {issue.title}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600">
                          <span className="bg-civic-green-100 text-civic-green-700 px-2 py-1 rounded text-xs font-semibold">
                            {issue.category}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${issue.status === 'resolved' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                            {issue.status === 'resolved' ? 'Resolved' : 'Rejected'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600">
                          {issue.reportedBy?.name || 'Unknown'}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-500">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-xs md:text-sm text-gray-600 text-center font-semibold">
                          {issue.upvotes?.length || 0}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && filteredActiveIssues.length === 0 && sortedResolvedIssues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center"
            >
              <p className="text-gray-500 text-base sm:text-lg">
                {issues.length === 0 ? 'No issues found' : 'No issues match the selected filters'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
