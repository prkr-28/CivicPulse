import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import axiosInstance from "../api/axiosInstance";
import {
  fetchAdminIssues,
  updateIssueStatus,
  selectAdminIssues,
  selectIssuesLoading,
} from "../store/slices/issuesSlice";
import { fetchAdminStats, selectAdminStats } from "../store/slices/adminSlice";
import Navbar from "../components/Navbar";
import {
  LayoutDashboard,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bot,
  SlidersHorizontal,
  Filter,
  ThumbsUp,
  User,
  Calendar,
  Tag,
  ChevronRight,
  Inbox,
} from "lucide-react";

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const stats = useAppSelector(selectAdminStats);
  const issues = useAppSelector(selectAdminIssues);
  const loading = useAppSelector(selectIssuesLoading);

  const [calculatingPriorities, setCalculatingPriorities] = useState(false);
  const [sortBy, setSortBy] = useState("priority");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminIssues());
  }, [dispatch]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await dispatch(updateIssueStatus({ issueId, newStatus }));
      dispatch(fetchAdminStats());
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCalculatePriorities = async () => {
    setCalculatingPriorities(true);
    try {
      const response = await axiosInstance.post("/admin/calculate-priorities");
      if (response.data.issues) {
        dispatch(fetchAdminIssues());
      }
    } catch (error) {
      alert("Failed to calculate priorities. Please try again.");
    } finally {
      setCalculatingPriorities(false);
    }
  };

  const getPriorityBadge = (level) => {
    switch (level) {
      case "Critical":
        return "bg-red-50 text-red-700 border border-red-200";
      case "High":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Low":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700 border border-red-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "resolved":
        return "bg-green-50 text-green-700 border border-green-200";
      case "rejected":
        return "bg-gray-50 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const activeIssues = issues.filter((i) =>
    ["open", "in-progress"].includes(i.status),
  );
  const resolvedIssues = issues.filter((i) =>
    ["resolved", "rejected"].includes(i.status),
  );

  const sortedIssues = [...activeIssues].sort((a, b) => {
    if (sortBy === "priority")
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "upvotes")
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    return 0;
  });

  const filteredActiveIssues =
    filterPriority === "all"
      ? sortedIssues
      : sortedIssues.filter((i) => i.priorityLevel === filterPriority);

  const sortedResolvedIssues = [...resolvedIssues].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const statCards = stats
    ? [
        {
          label: "Total Issues",
          value: stats.issues.total,
          icon: <LayoutDashboard className="w-5 h-5" />,
          color: "text-civic-green-600",
          bg: "bg-civic-green-50",
          border: "border-civic-green-100",
        },
        {
          label: "Open",
          value: stats.issues.open,
          icon: <AlertCircle className="w-5 h-5" />,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-100",
        },
        {
          label: "In Progress",
          value: stats.issues["in-progress"],
          icon: <Clock className="w-5 h-5" />,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-100",
        },
        {
          label: "Resolved",
          value: stats.issues.resolved,
          icon: <CheckCircle className="w-5 h-5" />,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-100",
        },
        {
          label: "Rejected",
          value: stats.issues.rejected,
          icon: <XCircle className="w-5 h-5" />,
          color: "text-gray-500",
          bg: "bg-gray-50",
          border: "border-gray-100",
        },
        {
          label: "Resolution Rate",
          value: stats.resolutionRate,
          icon: <TrendingUp className="w-5 h-5" />,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
        },
      ]
    : [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-civic-green-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-12">
              Manage issues, update statuses, and monitor resolution progress.
            </p>
          </motion.div>

          {/* Controls bar */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-5 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* AI button */}
              <button
                onClick={handleCalculatePriorities}
                disabled={calculatingPriorities}
                className="flex items-center gap-2 px-4 py-2.5 bg-civic-green-600 hover:bg-civic-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                <Bot className="w-4 h-4" />
                {calculatingPriorities
                  ? "Calculating..."
                  : "Calculate Priorities"}
              </button>

              <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
                {/* Sort */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1.5">
                    <SlidersHorizontal className="w-3 h-3" /> Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-civic-green-500 focus:border-transparent bg-gray-50 text-gray-700"
                  >
                    <option value="priority">Priority Score</option>
                    <option value="date">Most Recent</option>
                    <option value="upvotes">Most Upvotes</option>
                  </select>
                </div>

                {/* Filter */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1.5">
                    <Filter className="w-3 h-3" /> Filter priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-civic-green-500 focus:border-transparent bg-gray-50 text-gray-700"
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

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-civic-green-200 border-t-civic-green-600 rounded-full animate-spin" />
            </div>
          )}

          {/* Stat cards */}
          {!loading && stats && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8"
            >
              {statCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={`bg-white border ${card.border} rounded-2xl p-4 flex flex-col gap-3`}
                >
                  <div
                    className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {card.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Issues table helper */}
          {!loading && filteredActiveIssues.length > 0 && (
            <IssueTable
              title="Active Issues"
              titleIcon={<AlertCircle className="w-5 h-5 text-red-500" />}
              issues={filteredActiveIssues}
              navigate={navigate}
              handleStatusChange={handleStatusChange}
              getPriorityBadge={getPriorityBadge}
              getStatusBadge={getStatusBadge}
            />
          )}

          {!loading && sortedResolvedIssues.length > 0 && (
            <IssueTable
              title="Resolved Issues"
              titleIcon={<CheckCircle className="w-5 h-5 text-green-500" />}
              issues={sortedResolvedIssues}
              navigate={navigate}
              handleStatusChange={handleStatusChange}
              getPriorityBadge={getPriorityBadge}
              getStatusBadge={getStatusBadge}
              className="mt-6"
            />
          )}

          {/* Empty state */}
          {!loading &&
            filteredActiveIssues.length === 0 &&
            sortedResolvedIssues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  {issues.length === 0
                    ? "No issues found"
                    : "No issues match the selected filters"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or check back later.
                </p>
              </motion.div>
            )}
        </div>
      </div>
    </>
  );
}

/* ── Shared table component ───────────────────────────────── */
function IssueTable({
  title,
  titleIcon,
  issues,
  navigate,
  handleStatusChange,
  getPriorityBadge,
  getStatusBadge,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      {/* Table header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        {titleIcon}
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
          {issues.length}
        </span>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {issues.map((issue) => (
          <Link
            key={issue._id}
            to={`/admin/issue/${issue._id}`}
            className="block"
          >
            <div className="p-4 hover:bg-gray-50 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-gray-900 leading-snug flex-1 min-w-0 truncate">
                  {issue.title}
                </p>
                {issue.priorityLevel && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${getPriorityBadge(issue.priorityLevel)}`}
                  >
                    {issue.priorityLevel}
                  </span>
                )}
              </div>

              {issue.priorityReason && (
                <p className="text-xs text-gray-400 italic">
                  {issue.priorityReason}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-civic-green-700 bg-civic-green-50 border border-civic-green-100 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" /> {issue.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <ThumbsUp className="w-3 h-3" /> {issue.upvotes?.length || 0}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <User className="w-3 h-3" />{" "}
                  {issue.reportedBy?.name || "Unknown"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />{" "}
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <select
                  value={issue.status}
                  onClick={(e) => e.preventDefault()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(issue._id, e.target.value);
                  }}
                  className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-civic-green-500 focus:border-transparent"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Title",
                "Category",
                "Priority",
                "Status",
                "Reported By",
                "Date",
                "Upvotes",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {issues.map((issue) => (
              <motion.tr
                key={issue._id}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className="cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/issue/${issue._id}`)}
              >
                <td className="px-5 py-3.5 max-w-[200px]">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {issue.title}
                  </p>
                  {issue.priorityReason && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {issue.priorityReason}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-civic-green-700 bg-civic-green-50 border border-civic-green-100 px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" /> {issue.category}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {issue.priorityLevel ? (
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit ${getPriorityBadge(issue.priorityLevel)}`}
                      >
                        {issue.priorityLevel}
                      </span>
                      <span className="text-xs text-gray-400">
                        {issue.priorityScore}/10
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td
                  className="px-5 py-3.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={issue.status}
                    onChange={(e) =>
                      handleStatusChange(issue._id, e.target.value)
                    }
                    className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-civic-green-500 focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {issue.reportedBy?.name || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-gray-400">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600">
                    <ThumbsUp className="w-3.5 h-3.5 text-gray-300" />
                    {issue.upvotes?.length || 0}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;
