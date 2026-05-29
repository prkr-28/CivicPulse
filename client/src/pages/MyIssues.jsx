import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchMyIssues,
  deleteIssue,
  selectMyIssues,
  selectIssuesLoading,
  selectIssuesError,
} from "../store/slices/issuesSlice";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import {
  ClipboardList,
  Plus,
  Trash2,
  Tag,
  Calendar,
  ThumbsUp,
  ChevronRight,
  AlertCircle,
  Inbox,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const STATUS_TABS = [
  { key: "all", label: "All", icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { key: "open", label: "Open", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  {
    key: "in-progress",
    label: "In Progress",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    key: "resolved",
    label: "Resolved",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
];

const CATEGORY_COLORS = {
  Potholes: "bg-orange-50 text-orange-700 border-orange-100",
  Streetlights: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Garbage: "bg-red-50 text-red-700 border-red-100",
  "Water leakage": "bg-blue-50 text-blue-700 border-blue-100",
  "Broken footpath": "bg-purple-50 text-purple-700 border-purple-100",
  "Open manholes": "bg-gray-50 text-gray-700 border-gray-200",
  "Fallen trees": "bg-green-50 text-green-700 border-green-100",
  Other: "bg-civic-green-50 text-civic-green-700 border-civic-green-100",
};

function MyIssues() {
  const dispatch = useAppDispatch();
  const issues = useAppSelector(selectMyIssues);
  const loading = useAppSelector(selectIssuesLoading);
  const error = useAppSelector(selectIssuesError);
  const [activeTab, setActiveTab] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyIssues());
  }, [dispatch]);

  const handleDelete = async (issueId) => {
    setDeletingId(issueId);
    try {
      await dispatch(deleteIssue(issueId));
    } catch {
      alert("Failed to delete issue");
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  };

  const filtered =
    activeTab === "all" ? issues : issues.filter((i) => i.status === activeTab);

  const tabCount = (key) =>
    key === "all"
      ? issues.length
      : issues.filter((i) => i.status === key).length;

  /* ── Loading ── */
  if (loading)
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="w-10 h-10 border-4 border-civic-green-200 border-t-civic-green-600 rounded-full animate-spin" />
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-civic-green-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  My Issues
                </h1>
                <p className="text-sm text-gray-500">
                  {issues.length} issue{issues.length !== 1 ? "s" : ""} reported
                </p>
              </div>
            </div>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-civic-green-600 hover:bg-civic-green-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Report New Issue
            </Link>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Filter tabs */}
          {issues.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide"
            >
              {STATUS_TABS.map((tab) => {
                const count = tabCount(tab.key);
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-civic-green-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-civic-green-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Issues list */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filtered.map((issue, idx) => {
                  const catColor =
                    CATEGORY_COLORS[issue.category] || CATEGORY_COLORS["Other"];
                  const isConfirming = confirmingId === issue._id;
                  const isDeleting = deletingId === issue._id;

                  return (
                    <motion.div
                      key={issue._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                    >
                      <Link
                        to={`/issue/${issue._id}`}
                        className="block p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-4">
                          {/* Color dot accent */}
                          <div className="w-1 self-stretch rounded-full bg-civic-green-500 flex-shrink-0 hidden sm:block" />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-civic-green-600 transition-colors leading-snug line-clamp-2">
                                {issue.title}
                              </h3>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-civic-green-500 flex-shrink-0 mt-0.5 transition-colors" />
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                              {issue.description}
                            </p>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${catColor}`}
                              >
                                <Tag className="w-3 h-3" />
                                {issue.category}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <ThumbsUp className="w-3 h-3" />
                                {issue.upvotes?.length || 0}
                              </span>
                              <span className="ml-auto">
                                <StatusBadge status={issue.status} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Delete row */}
                      <div className="px-4 sm:px-5 pb-3 flex justify-end">
                        <AnimatePresence mode="wait">
                          {isConfirming ? (
                            <motion.div
                              key="confirm"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-xs text-gray-500 mr-1">
                                Delete this issue?
                              </span>
                              <button
                                onClick={() => handleDelete(issue._id)}
                                disabled={isDeleting}
                                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isDeleting ? "Deleting..." : "Yes, delete"}
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="delete-btn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={(e) => {
                                e.preventDefault();
                                setConfirmingId(issue._id);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* Empty state */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 sm:p-16 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-gray-300" />
                </div>
                {activeTab === "all" ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      No issues yet
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      You haven't reported any issues yet. Be the first to make
                      a difference!
                    </p>
                    <Link
                      to="/report"
                      className="inline-flex items-center gap-2 bg-civic-green-600 hover:bg-civic-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Report Your First Issue
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      No {activeTab.replace("-", " ")} issues
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      You don't have any issues with this status.
                    </p>
                    <button
                      onClick={() => setActiveTab("all")}
                      className="text-sm font-medium text-civic-green-600 hover:text-civic-green-500 transition-colors"
                    >
                      View all issues →
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default MyIssues;
