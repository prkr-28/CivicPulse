import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser } from "../store/slices/authSlice";
import {
  fetchAllIssues,
  selectAllIssues,
  selectIssuesLoading,
  upvoteIssueThunk,
} from "../store/slices/issuesSlice";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft,
  ThumbsUp,
  User,
  Calendar,
  MapPin,
  FileText,
  Images,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
} from "lucide-react";

function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const issues = useAppSelector(selectAllIssues);
  const loading = useAppSelector(selectIssuesLoading);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [enlargedImageIndex, setEnlargedImageIndex] = useState(null);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const issue = issues.find((i) => i._id === id);

  useEffect(() => {
    dispatch(fetchAllIssues({}));
  }, [dispatch]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setEnlargedImageIndex(null);
      if (e.key === "ArrowRight" && enlargedImageIndex !== null && issue)
        setEnlargedImageIndex((p) =>
          Math.min(issue.imageUrls.length - 1, p + 1),
        );
      if (e.key === "ArrowLeft" && enlargedImageIndex !== null)
        setEnlargedImageIndex((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enlargedImageIndex, issue]);

  useEffect(() => {
    document.body.style.overflow = enlargedImageIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [enlargedImageIndex]);

  const handleUpvote = async () => {
    setIsUpvoting(true);
    await dispatch(upvoteIssueThunk(id));
    setIsUpvoting(false);
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
  if (!issue)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Issue Not Found
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              This issue may have been removed or doesn't exist.
            </p>
            <Link
              to="/my-issues"
              className="inline-flex items-center gap-2 bg-civic-green-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-civic-green-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to My Issues
            </Link>
          </div>
        </div>
      </>
    );

  const isReporter = user && issue.reportedBy._id === user.id;
  const images = issue.imageUrls || [];
  const hasUpvoted = user && issue.upvotes?.includes(user.id);

  return (
    <>
      <Navbar />

      {/* ── Enlarged modal ── */}
      <AnimatePresence>
        {enlargedImageIndex !== null && images.length > 0 && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setEnlargedImageIndex(null)}
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center"
              style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            >
              <img
                src={images[enlargedImageIndex]}
                alt={`Enlarged ${enlargedImageIndex + 1}`}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl block"
              />
              <button
                onClick={() => setEnlargedImageIndex(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                {enlargedImageIndex + 1} / {images.length}
              </span>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setEnlargedImageIndex((p) => Math.max(0, p - 1))
                    }
                    disabled={enlargedImageIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setEnlargedImageIndex((p) =>
                        Math.min(images.length - 1, p + 1),
                      )
                    }
                    disabled={enlargedImageIndex === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/my-issues")}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-civic-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Issues
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* ── Image gallery ── */}
            {images.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={images[selectedImageIndex]}
                    alt={`Issue ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setEnlargedImageIndex(selectedImageIndex)}
                  />
                  <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedImageIndex((p) => Math.max(0, p - 1))
                        }
                        disabled={selectedImageIndex === 0}
                        className="w-8 h-8 bg-white/90 hover:bg-white disabled:opacity-40 rounded-full flex items-center justify-center shadow transition-all"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((p) =>
                            Math.min(images.length - 1, p + 1),
                          )
                        }
                        disabled={selectedImageIndex === images.length - 1}
                        className="w-8 h-8 bg-white/90 hover:bg-white disabled:opacity-40 rounded-full flex items-center justify-center shadow transition-all"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === selectedImageIndex
                            ? "border-civic-green-500 shadow-md"
                            : "border-transparent hover:border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Main detail card ── */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-civic-green-600" />

              <div className="p-5 sm:p-6">
                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug flex-1">
                    {issue.title}
                  </h1>

                  {/* Upvote button */}
                  {!isReporter && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleUpvote}
                      disabled={isUpvoting}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        hasUpvoted
                          ? "bg-civic-green-50 text-civic-green-700 border border-civic-green-200"
                          : "bg-civic-green-600 hover:bg-civic-green-500 text-white shadow-sm"
                      } disabled:opacity-50`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${isUpvoting ? "animate-bounce" : ""}`}
                      />
                      {isUpvoting
                        ? "Upvoting..."
                        : `Upvote (${issue.upvotes?.length || 0})`}
                    </motion.button>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-civic-green-700 bg-civic-green-50 border border-civic-green-100 px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" /> {issue.category}
                  </span>
                  <StatusBadge status={issue.status} />
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {[
                    {
                      icon: <User className="w-4 h-4" />,
                      label: "Reported by",
                      value: issue.reportedBy.name || issue.reportedBy.email,
                    },
                    {
                      icon: <Calendar className="w-4 h-4" />,
                      label: "Date",
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
                      <span className="text-civic-green-600">{item.icon}</span>
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
                <div className="mb-6">
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

                {/* Location */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Location
                    </h2>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-100 h-64 sm:h-80 mb-2">
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
                  <p className="text-xs text-gray-400">
                    Coordinates: {issue.location.coordinates[1].toFixed(4)},{" "}
                    {issue.location.coordinates[0].toFixed(4)}
                  </p>
                </div>

                {/* All photos grid */}
                {images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Images className="w-4 h-4 text-gray-400" />
                      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        All Photos ({images.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {images.map((img, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setEnlargedImageIndex(idx)}
                          className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                          <img
                            src={img}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                          <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-md">
                            {idx + 1}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default IssueDetail;
