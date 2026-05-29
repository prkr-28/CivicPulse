import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectIsAdmin } from "../store/slices/authSlice";
import {
  fetchAllIssues,
  selectAllIssues,
  selectIssuesLoading,
  updateIssueStatus,
} from "../store/slices/issuesSlice";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft,
  Bot,
  Send,
  MapPin,
  User,
  Calendar,
  ThumbsUp,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Shield,
} from "lucide-react";

function AdminIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const issues = useAppSelector(selectAllIssues);
  const loading = useAppSelector(selectIssuesLoading);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    dispatch(fetchAllIssues({}));
  }, [dispatch, isAdmin, navigate]);

  const issue = issues.find((i) => i._id === id);

  useEffect(() => {
    if (issue && !newStatus) setNewStatus(issue.status);
  }, [issue, newStatus]);

  useEffect(() => {
    if (issue && chatMessages.length === 0) {
      setChatMessages([
        {
          id: "system",
          role: "assistant",
          lines: [
            {
              type: "intro",
              text: "I'm your AI resolution assistant. Here's a summary of this issue:",
            },
            { type: "row", label: "Issue", value: issue.title },
            { type: "row", label: "Category", value: issue.category },
            { type: "row", label: "Status", value: issue.status },
            { type: "row", label: "Description", value: issue.description },
            {
              type: "row",
              label: "Location",
              value: `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`,
            },
            {
              type: "row",
              label: "Reporter",
              value: issue.reportedBy.name || issue.reportedBy.email,
            },
            {
              type: "row",
              label: "Photos",
              value: `${issue.imageUrls?.length || 0} uploaded`,
            },
            {
              type: "outro",
              text: "How can I help you resolve this efficiently?",
            },
          ],
          timestamp: new Date(),
        },
      ]);
    }
  }, [issue, chatMessages.length]);

  const getPriorityBadge = (level) => {
    switch (level) {
      case "Critical":
        return {
          cls: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };
      case "High":
        return {
          cls: "bg-orange-50 text-orange-700 border-orange-200",
          dot: "bg-orange-500",
        };
      case "Medium":
        return {
          cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
          dot: "bg-yellow-500",
        };
      case "Low":
        return {
          cls: "bg-green-50 text-green-700 border-green-200",
          dot: "bg-green-500",
        };
      default:
        return {
          cls: "bg-gray-50 text-gray-600 border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setNewStatus(status);
      await dispatch(updateIssueStatus({ issueId: id, newStatus: status }));
      dispatch(fetchAllIssues({}));
    } catch {
      alert("Failed to update status");
    }
  };

  const parseAIResponse = (text) => {
    if (!text) return [];
    const cleaned = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/__/g, "")
      .replace(/_/g, "")
      .replace(/#{1,6}\s?/g, "");
    return cleaned
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        if (/^\d+\.\s/.test(line)) return { type: "numbered", text: line };
        if (/^[-•]\s/.test(line))
          return { type: "bullet", text: line.replace(/^[-•]\s/, "") };
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx <= 35 && colonIdx < line.length - 1)
          return {
            type: "row",
            label: line.substring(0, colonIdx).trim(),
            value: line.substring(colonIdx + 1).trim(),
          };
        return { type: "text", text: line };
      });
  };

  const renderLines = (lines) => (
    <div className="flex flex-col gap-1.5 text-sm">
      {lines.map((line, idx) => {
        switch (line.type) {
          case "intro":
          case "outro":
          case "text":
            return (
              <p key={idx} className="leading-relaxed">
                {line.text}
              </p>
            );
          case "row":
            return (
              <div key={idx} className="flex gap-1.5 leading-snug">
                <span className="font-semibold shrink-0 min-w-[80px]">
                  {line.label}:
                </span>
                <span className="opacity-90">{line.value}</span>
              </div>
            );
          case "bullet":
            return (
              <div key={idx} className="flex gap-2 leading-snug">
                <span className="shrink-0 mt-0.5 opacity-60">•</span>
                <span>{line.text}</span>
              </div>
            );
          case "numbered":
            return (
              <div key={idx} className="leading-snug">
                {line.text}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const messageText = chatInput;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content: messageText,
        timestamp: new Date(),
      },
    ]);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await axiosInstance.post("/ai/resolve-issue", {
        issueId: id,
        message: messageText,
        issueDetails: {
          title: issue.title,
          description: issue.description,
          category: issue.category,
          location: issue.location,
          imageCount: issue.imageUrls?.length || 0,
          images: issue.imageUrls,
          status: issue.status,
        },
      });
      const parsedLines = parseAIResponse(response.data.response);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          lines: parsedLines.length
            ? parsedLines
            : [
                {
                  type: "text",
                  text: "I encountered an issue processing your request.",
                },
              ],
          timestamp: new Date(),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          lines: [
            {
              type: "text",
              text: "Sorry, I encountered an error. Please try again.",
            },
          ],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

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

  /* ── Not found ── */
  if (!issue || !isAdmin)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Issue Not Found or Access Denied
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              You may not have permission to view this issue.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-civic-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-civic-green-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );

  const priorityStyle = issue.priorityLevel
    ? getPriorityBadge(issue.priorityLevel)
    : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/admin")}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-civic-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left col ── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Image gallery */}
              {issue.imageUrls && issue.imageUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Main image */}
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={issue.imageUrls[selectedImageIndex]}
                      alt={`Issue ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setEnlargedImageIndex(selectedImageIndex)}
                    />
                    {/* Counter */}
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                      {selectedImageIndex + 1} / {issue.imageUrls.length}
                    </span>
                    {/* Nav arrows */}
                    {issue.imageUrls.length > 1 && (
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              Math.max(0, selectedImageIndex - 1),
                            )
                          }
                          className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              Math.min(
                                issue.imageUrls.length - 1,
                                selectedImageIndex + 1,
                              ),
                            )
                          }
                          className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {issue.imageUrls.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {issue.imageUrls.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImageIndex === idx
                              ? "border-civic-green-500 shadow-md"
                              : "border-transparent hover:border-gray-200"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Issue details card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Top accent */}
                <div className="h-1 w-full bg-civic-green-600" />

                <div className="p-5 sm:p-6">
                  {/* Title + badges */}
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-snug">
                    {issue.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-civic-green-700 bg-civic-green-50 border border-civic-green-100 px-2.5 py-1 rounded-full">
                      <Tag className="w-3 h-3" /> {issue.category}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>

                  {/* Status update */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Update Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Priority card */}
                  {issue.priorityLevel && (
                    <div
                      className={`border rounded-xl p-4 mb-5 ${priorityStyle.cls}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${priorityStyle.dot}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                              Priority
                            </span>
                            <span className="font-bold text-base">
                              {issue.priorityLevel}
                            </span>
                            <span className="text-xs opacity-60 ml-auto">
                              {issue.priorityScore}/10
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed opacity-80 italic">
                            {issue.priorityReason}
                          </p>
                          {issue.priorityCalculatedAt && (
                            <p className="text-xs opacity-50 mt-1.5">
                              Calculated{" "}
                              {new Date(
                                issue.priorityCalculatedAt,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {[
                      {
                        icon: <User className="w-4 h-4" />,
                        label: "Reporter",
                        value: issue.reportedBy.name || issue.reportedBy.email,
                      },
                      {
                        icon: <Calendar className="w-4 h-4" />,
                        label: "Reported",
                        value: new Date(issue.createdAt).toLocaleDateString(),
                      },
                      {
                        icon: <ThumbsUp className="w-4 h-4" />,
                        label: "Upvotes",
                        value: issue.upvotes?.length || 0,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2.5"
                      >
                        <span className="text-civic-green-600">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Description
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-4">
                      {issue.description}
                    </p>
                  </div>

                  {/* Map */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Location
                      </h2>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-100 h-56 sm:h-64">
                      <MapContainer
                        center={[
                          issue.location.coordinates[1],
                          issue.location.coordinates[0],
                        ]}
                        zoom={15}
                        className="w-full h-full"
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker
                          position={[
                            issue.location.coordinates[1],
                            issue.location.coordinates[0],
                          ]}
                        />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Right col — AI Chat ── */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col sticky top-20"
                style={{ height: "680px" }}
              >
                {/* Chat header */}
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2.5 flex-shrink-0">
                  <div className="w-8 h-8 bg-civic-green-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      AI Resolution Assistant
                    </p>
                    <p className="text-xs text-civic-green-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-civic-green-500 rounded-full animate-pulse inline-block" />
                      Online
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 bg-civic-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                          <Bot className="w-3 h-3 text-civic-green-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "bg-civic-green-600 text-white rounded-tr-sm"
                            : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "assistant"
                          ? renderLines(
                              msg.lines || [
                                { type: "text", text: msg.content || "" },
                              ],
                            )
                          : msg.content}
                        <p
                          className={`text-xs mt-1.5 ${msg.role === "user" ? "text-civic-green-200" : "text-gray-400"}`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start items-end gap-2">
                      <div className="w-6 h-6 bg-civic-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-civic-green-600" />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <span
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-3 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder="Ask for resolution ideas..."
                      disabled={chatLoading}
                      className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-civic-green-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="w-10 h-10 bg-civic-green-600 hover:bg-civic-green-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    AI has access to all issue details and images
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged image modal */}
      {enlargedImageIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setEnlargedImageIndex(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh]"
          >
            <img
              src={issue.imageUrls[enlargedImageIndex]}
              alt={`Enlarged ${enlargedImageIndex + 1}`}
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setEnlargedImageIndex(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              {enlargedImageIndex + 1} / {issue.imageUrls.length}
            </span>
            {issue.imageUrls.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setEnlargedImageIndex(Math.max(0, enlargedImageIndex - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setEnlargedImageIndex(
                      Math.min(
                        issue.imageUrls.length - 1,
                        enlargedImageIndex + 1,
                      ),
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default AdminIssueDetail;
