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
      if (e.key === "ArrowRight" && enlargedImageIndex !== null && issue) {
        setEnlargedImageIndex((prev) =>
          Math.min(issue.imageUrls.length - 1, prev + 1),
        );
      }
      if (e.key === "ArrowLeft" && enlargedImageIndex !== null) {
        setEnlargedImageIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enlargedImageIndex, issue]);

  useEffect(() => {
    if (enlargedImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [enlargedImageIndex, issue]); // ✅ issue is now defined above

  const handleUpvote = async () => {
    setIsUpvoting(true);
    await dispatch(upvoteIssueThunk(id));
    setIsUpvoting(false);
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

  if (!issue) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Issue Not Found
            </h1>
            <Link to="/my-issues" className="btn-primary inline-block">
              Back to My Issues
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isReporter = user && issue.reportedBy._id === user.id;
  const images = issue.imageUrls || [];

  return (
    <>
      <Navbar />

      {/* ── Enlarged Image Modal — rendered at root so nothing clips it ── */}
      <AnimatePresence>
        {enlargedImageIndex !== null && images.length > 0 && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setEnlargedImageIndex(null)}
            style={{ position: "fixed", inset: 0, zIndex: 9999 }}
            className="bg-black bg-opacity-90 flex items-center justify-center p-4"
          >
            {/* Inner box — click doesn't bubble up to close */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center"
              style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            >
              <img
                src={images[enlargedImageIndex]}
                alt={`Enlarged ${enlargedImageIndex + 1}`}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  display: "block",
                }}
              />

              <button
                onClick={() => setEnlargedImageIndex(null)}
                className="absolute top-3 right-3 bg-civic-green-500 hover:bg-civic-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-sm px-4 py-1.5 rounded-full">
                {enlargedImageIndex + 1} / {images.length}
              </div>

              {images.length > 1 && (
                <button
                  onClick={() =>
                    setEnlargedImageIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={enlargedImageIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-civic-green-500 hover:bg-civic-green-600 disabled:opacity-30 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors"
                  aria-label="Previous"
                >
                  ‹
                </button>
              )}

              {images.length > 1 && (
                <button
                  onClick={() =>
                    setEnlargedImageIndex((prev) =>
                      Math.min(images.length - 1, prev + 1),
                    )
                  }
                  disabled={enlargedImageIndex === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-civic-green-500 hover:bg-civic-green-600 disabled:opacity-30 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors"
                  aria-label="Next"
                >
                  ›
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/my-issues")}
            className="mb-6 text-civic-green-600 hover:text-civic-green-700 font-semibold flex items-center gap-2"
          >
            ← Back to My Issues
          </motion.button>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {images.length > 0 && (
              <>
                <div className="relative h-64 sm:h-96 md:h-[500px] bg-gray-900 overflow-hidden">
                  <img
                    src={images[selectedImageIndex]}
                    alt={`Issue ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setEnlargedImageIndex(selectedImageIndex)}
                  />

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-xs sm:text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </span>
                    {images.length > 1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              Math.max(0, prev - 1),
                            )
                          }
                          disabled={selectedImageIndex === 0}
                          className="bg-civic-green-500 hover:bg-civic-green-600 disabled:opacity-40 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              Math.min(images.length - 1, prev + 1),
                            )
                          }
                          disabled={selectedImageIndex === images.length - 1}
                          className="bg-civic-green-500 hover:bg-civic-green-600 disabled:opacity-40 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="bg-gray-100 p-3 sm:p-4 border-b border-gray-200">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`flex-shrink-0 h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === selectedImageIndex
                              ? "border-civic-green-500 shadow-lg w-20 sm:w-24"
                              : "border-gray-300 w-16 sm:w-20 opacity-70 hover:opacity-100"
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
                  </div>
                )}
              </>
            )}

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                      {issue.title}
                    </h1>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-civic-green-100 text-civic-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {issue.category}
                      </span>
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    {!isReporter && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                        className="flex items-center justify-center gap-2 bg-civic-green-600 hover:bg-civic-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm whitespace-nowrap"
                      >
                        {isUpvoting ? (
                          <>
                            <span className="inline-block animate-spin">
                              ⏳
                            </span>
                            Upvoting...
                          </>
                        ) : (
                          <>👍 Upvote ({issue.upvotes?.length || 0})</>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Reported by:</strong>{" "}
                  {issue.reportedBy.name || issue.reportedBy.email}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Date:</strong>{" "}
                  {new Date(issue.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Upvotes:</strong> {issue.upvotes?.length || 0} 👍
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Location
                </h2>
                <div className="rounded-lg overflow-hidden shadow-md h-80 border border-gray-300">
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
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Coordinates:</strong>{" "}
                  {issue.location.coordinates[1].toFixed(4)},{" "}
                  {issue.location.coordinates[0].toFixed(4)}
                </p>
              </div>

              {images.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    All Photos ({images.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <motion.img
                        key={idx}
                        src={img}
                        alt={`Issue photo ${idx + 1}`}
                        whileHover={{ scale: 1.04 }}
                        onClick={() => setEnlargedImageIndex(idx)}
                        className="w-full h-32 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default IssueDetail;
