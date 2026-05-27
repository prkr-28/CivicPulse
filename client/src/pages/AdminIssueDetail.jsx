import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectIsAdmin } from '../store/slices/authSlice';
import { fetchAllIssues, selectAllIssues, selectIssuesLoading, updateIssueStatus } from '../store/slices/issuesSlice';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

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
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    dispatch(fetchAllIssues({}));
  }, [dispatch, isAdmin, navigate]);

  const issue = issues.find(i => i._id === id);

  useEffect(() => {
    if (issue && !newStatus) {
      setNewStatus(issue.status);
    }
  }, [issue, newStatus]);

  // Initialize AI chat with issue context — no markdown, plain structured lines
  useEffect(() => {
    if (issue && chatMessages.length === 0) {
      const systemMessage = {
        id: 'system',
        role: 'assistant',
        // Array of plain strings, rendered as clean key-value rows
        lines: [
          { type: 'intro', text: "I'm an AI assistant ready to help resolve this issue. Here are the details:" },
          { type: 'row', label: 'Issue', value: issue.title },
          { type: 'row', label: 'Category', value: issue.category },
          { type: 'row', label: 'Status', value: issue.status },
          { type: 'row', label: 'Description', value: issue.description },
          { type: 'row', label: 'Location', value: `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}` },
          { type: 'row', label: 'Reported by', value: issue.reportedBy.name || issue.reportedBy.email },
          { type: 'row', label: 'Images', value: `${issue.imageUrls?.length || 0} photo(s)` },
          { type: 'outro', text: 'How can I help you resolve this issue efficiently?' },
        ],
        timestamp: new Date()
      };
      setChatMessages([systemMessage]);
    }
  }, [issue, chatMessages.length]);

  const getPriorityColor = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High':     return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':   return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':      return 'bg-green-100 text-green-700 border-green-300';
      default:         return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setNewStatus(status);
      await dispatch(updateIssueStatus({ issueId: id, newStatus: status }));
      dispatch(fetchAllIssues({}));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  /**
   * Strip all markdown from AI text response and convert to
   * an array of plain line objects ready for rendering.
   */
  const parseAIResponse = (text) => {
    if (!text) return [];

    // Remove all markdown bold/italic/heading markers
    const cleaned = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/__/g, '')
      .replace(/_/g, '')
      .replace(/#{1,6}\s?/g, '');

    return cleaned
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        // Numbered list:  "1. Some text"
        if (/^\d+\.\s/.test(line)) {
          return { type: 'numbered', text: line };
        }
        // Bullet list:  "- text" or "• text"
        if (/^[-•]\s/.test(line)) {
          return { type: 'bullet', text: line.replace(/^[-•]\s/, '') };
        }
        // Key: Value  (colon within first 35 chars)
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && colonIdx <= 35 && colonIdx < line.length - 1) {
          return {
            type: 'row',
            label: line.substring(0, colonIdx).trim(),
            value: line.substring(colonIdx + 1).trim(),
          };
        }
        // Plain text
        return { type: 'text', text: line };
      });
  };

  /**
   * Render a structured lines array (used by both the system message
   * and AI reply bubbles) into clean JSX — no asterisks, no raw markdown.
   */
  const renderLines = (lines) => (
    <div className="flex flex-col gap-1.5 text-sm">
      {lines.map((line, idx) => {
        switch (line.type) {
          case 'intro':
          case 'outro':
          case 'text':
            return (
              <p key={idx} className="text-gray-800 leading-relaxed">
                {line.text}
              </p>
            );
          case 'row':
            return (
              <div key={idx} className="flex gap-1.5 leading-snug">
                <span className="font-semibold text-gray-700 shrink-0 min-w-[80px]">
                  {line.label}:
                </span>
                <span className="text-gray-800">{line.value}</span>
              </div>
            );
          case 'bullet':
            return (
              <div key={idx} className="flex gap-2 leading-snug">
                <span className="text-gray-500 shrink-0 mt-0.5">•</span>
                <span className="text-gray-800">{line.text}</span>
              </div>
            );
          case 'numbered':
            return (
              <div key={idx} className="flex gap-2 leading-snug">
                <span className="text-gray-800">{line.text}</span>
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
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await axiosInstance.post('/ai/resolve-issue', {
        issueId: id,
        message: messageText,
        issueDetails: {
          title: issue.title,
          description: issue.description,
          category: issue.category,
          location: issue.location,
          imageCount: issue.imageUrls?.length || 0,
          images: issue.imageUrls,
          status: issue.status
        }
      });

      // Parse the AI response into structured lines (strips all markdown)
      const parsedLines = parseAIResponse(response.data.response);

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        lines: parsedLines.length
          ? parsedLines
          : [{ type: 'text', text: 'I encountered an issue processing your request.' }],
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          lines: [{ type: 'text', text: 'Sorry, I encountered an error. Please try again.' }],
          timestamp: new Date()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!issue || !isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Issue Not Found or Access Denied</h1>
            <Link to="/admin" className="btn-primary inline-block">
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/admin')}
            className="mb-6 text-civic-green-600 hover:text-civic-green-700 font-semibold flex items-center gap-2"
          >
            ← Back to Dashboard
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Issue Details */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Image Gallery */}
                {issue.imageUrls && issue.imageUrls.length > 0 && (
                  <>
                    {/* Main image */}
                    <div className="relative h-64 sm:h-96 bg-gray-900 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={issue.imageUrls[selectedImageIndex]}
                        alt={`Issue ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setEnlargedImageIndex(selectedImageIndex)}
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-xs sm:text-sm">
                          {selectedImageIndex + 1} / {issue.imageUrls.length}
                        </span>
                        {issue.imageUrls.length > 1 && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                              className="bg-civic-green-500 hover:bg-civic-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                            >
                              ← Prev
                            </button>
                            <button
                              onClick={() => setSelectedImageIndex(Math.min(issue.imageUrls.length - 1, selectedImageIndex + 1))}
                              className="bg-civic-green-500 hover:bg-civic-green-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {issue.imageUrls.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-6 px-4">
                        {issue.imageUrls.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === idx
                                ? 'border-civic-green-500 shadow-lg'
                                : 'border-gray-300 hover:border-civic-green-300'
                            }`}
                          >
                            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Enlarged modal */}
                    {enlargedImageIndex !== null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEnlargedImageIndex(null)}
                        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="relative max-w-4xl max-h-[90vh] bg-black rounded-lg overflow-hidden"
                        >
                          <img
                            src={issue.imageUrls[enlargedImageIndex]}
                            alt={`Enlarged view ${enlargedImageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                          <button
                            onClick={() => setEnlargedImageIndex(null)}
                            className="absolute top-4 right-4 bg-civic-green-500 hover:bg-civic-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors text-xl font-bold"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
                            {enlargedImageIndex + 1} / {issue.imageUrls.length}
                          </div>
                          {issue.imageUrls.length > 1 && (
                            <>
                              <button
                                onClick={() => setEnlargedImageIndex(Math.max(0, enlargedImageIndex - 1))}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-civic-green-500 hover:bg-civic-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors text-xl font-bold"
                              >
                                ‹
                              </button>
                              <button
                                onClick={() => setEnlargedImageIndex(Math.min(issue.imageUrls.length - 1, enlargedImageIndex + 1))}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-civic-green-500 hover:bg-civic-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors text-xl font-bold"
                              >
                                ›
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Issue Details */}
                <div className="p-5 sm:p-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{issue.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-civic-green-100 text-civic-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {issue.category}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>

                  {/* Status Update */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Priority */}
                  {issue.priorityLevel && (
                    <div className={`p-4 rounded-lg mb-6 border-2 ${getPriorityColor(issue.priorityLevel)}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold mb-1">Priority Assessment</p>
                          <p className="text-2xl font-bold">{issue.priorityLevel}</p>
                          <p className="text-xs opacity-80 mt-1">Score: {issue.priorityScore}/10</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">AI Reason:</p>
                          <p className="text-sm italic">{issue.priorityReason}</p>
                          {issue.priorityCalculatedAt && (
                            <p className="text-xs opacity-75 mt-2">
                              Calculated: {new Date(issue.priorityCalculatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reporter Info */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Reported by:</strong> {issue.reportedBy.name || issue.reportedBy.email}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Date:</strong> {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Upvotes:</strong> {issue.upvotes?.length || 0} 👍
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
                  </div>

                  {/* Map */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Location</h2>
                    <div className="rounded-lg overflow-hidden shadow-md h-64 border border-gray-300">
                      <MapContainer
                        center={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                        zoom={15}
                        className="w-full h-full"
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[issue.location.coordinates[1], issue.location.coordinates[0]]} />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right — AI Chat */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg flex flex-col h-[600px]"
              >
                <div className="bg-civic-green-500 text-white p-4 font-semibold rounded-t-lg">
                  🤖 AI Resolution Assistant
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-civic-green-500 text-white text-sm'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.role === 'assistant'
                          ? renderLines(msg.lines || [{ type: 'text', text: msg.content || '' }])
                          : msg.content
                        }
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <span className="animate-pulse">●</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask for resolution ideas..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={chatLoading}
                      className="bg-civic-green-500 hover:bg-civic-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-semibold"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    AI has access to all issue details and images
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminIssueDetail;