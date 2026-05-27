import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAllIssues,
  fetchNearbyIssues,
  selectAllIssues,
  selectNearbyIssues,
  selectIssuesLoading,
  selectNearbyLoading,
} from "../store/slices/issuesSlice";
import {
  setCategory,
  setStatus,
  selectSelectedCategory,
  selectSelectedStatus,
} from "../store/slices/filterSlice";
import { selectUser } from "../store/slices/authSlice";
import Navbar from "../components/Navbar";
import IssuePopupCard from "../components/IssuePopupCard";

const MARKER_COLORS = {
  open: "#dc3545", // Red for open issues
  "in-progress": "#ffc107", // Yellow for in-progress
  resolved: "#28a745", // Green for resolved
  rejected: "#6c757d", // Gray for rejected
};

const DEFAULT_MAP_CENTER = [28.6139, 77.209];
const NEARBY_RADIUS = 25;

function MapPage() {
  const dispatch = useAppDispatch();

  const allIssues = useAppSelector(selectAllIssues);
  const nearbyIssues = useAppSelector(selectNearbyIssues);
  const loading = useAppSelector(selectIssuesLoading);
  const nearbyLoading = useAppSelector(selectNearbyLoading);
  const user = useAppSelector(selectUser);

  const selectedCategory = useAppSelector(selectSelectedCategory);
  const selectedStatus = useAppSelector(selectSelectedStatus);

  const [showNearby, setShowNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedPopupIssue, setSelectedPopupIssue] = useState(null);

  useEffect(() => {
    const filters = {};
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedStatus) filters.status = selectedStatus;

    dispatch(fetchAllIssues(filters));
  }, [selectedCategory, selectedStatus, dispatch]);

  const handleGetNearbyIssues = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Show loading state while getting location
    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      // Success callback - got location
      (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ lat: latitude, lng: longitude });

        dispatch(
          fetchNearbyIssues({
            lat: latitude,
            lng: longitude,
            radius: NEARBY_RADIUS,
          }),
        );

        // Show nearby issues view
        setShowNearby(true);

        // Hide loading state
        setGettingLocation(false);
      },
      // Error callback - failed to get location
      (error) => {
        // Hide loading state
        setGettingLocation(false);

        // Show error message based on error type
        if (error.code === error.PERMISSION_DENIED) {
          alert("Please allow location access to find nearby issues");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Location information is unavailable");
        } else if (error.code === error.TIMEOUT) {
          alert("Location request timed out");
        } else {
          alert("An error occurred while getting your location");
        }
      },
    );
  };

  // Function to show all issues again (turn off nearby filter)
  const handleShowAllIssues = () => {
    setShowNearby(false);
    setUserLocation(null);
    setSelectedPopupIssue(null);
  };

  // Determine which issues to display (all or nearby)
  // If showNearby is true, use nearbyIssues; otherwise use allIssues
  // Filter out user's own issues
  const filterOwnIssues = (issues) => {
    if (!user) return issues;
    return issues.filter((issue) => issue.reportedBy._id !== user.id);
  };

  const issuesToDisplay = filterOwnIssues(
    showNearby ? nearbyIssues : allIssues,
  );
  const currentLoading = showNearby ? nearbyLoading : loading;

  // Helper function to create custom marker icon with colored circle
  // Different colors for different statuses
  const getMarkerIcon = (status) => {
    const color = MARKER_COLORS[status] || MARKER_COLORS.rejected;
    return L.divIcon({
      // HTML for the marker - creates a colored circle with pin icon
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍</div>`,
      iconSize: [30, 30],
      className: "custom-marker",
    });
  };

  // Helper function to create user location marker (blue dot)
  const getUserLocationIcon = () => {
    return L.divIcon({
      // Blue circle for user location
      html: `<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);"></div>`,
      iconSize: [20, 20],
      className: "user-marker",
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Top control panel - filters and nearby button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md p-4 sm:p-6 border-b border-gray-200"
        >
          <div className="max-w-6xl mx-auto">
            {/* Header with nearby button */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {showNearby ? "📍 Nearby Issues" : "🗺️ All Issues Map"}
              </h2>

              <div className="flex gap-2">
                {/* Get Nearby Issues Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetNearbyIssues}
                  disabled={gettingLocation}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm flex items-center gap-2"
                >
                  {gettingLocation ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Getting Location...
                    </>
                  ) : (
                    <>📍 Nearby (25km)</>
                  )}
                </motion.button>

                {/* Show All Issues Button - only shows when viewing nearby issues */}
                {showNearby && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShowAllIssues}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Show All
                  </motion.button>
                )}
              </div>
            </div>

            {/* Filter controls - category and status dropdowns */}
            <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
              {/* Category filter dropdown */}
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="category-filter"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
                >
                  Category
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => dispatch(setCategory(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">All Categories</option>
                  <option value="Potholes">Potholes</option>
                  <option value="Streetlights">Streetlights</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Water leakage">Water leakage</option>
                  <option value="Broken footpath">Broken footpath</option>
                  <option value="Open manholes">Open manholes</option>
                  <option value="Fallen trees">Fallen trees</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status filter dropdown */}
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="status-filter"
                  className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => dispatch(setStatus(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Info text showing nearby radius */}
            {showNearby && userLocation && (
              <p className="text-sm text-blue-600 mt-3">
                ✓ Showing issues within {NEARBY_RADIUS}km of your location (
                {nearbyIssues.length} found)
              </p>
            )}
          </div>
        </motion.div>

        {/* Loading state while fetching issues */}
        {currentLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="spinner mb-4"></div>
              <p className="text-gray-600">Loading issues...</p>
            </div>
          </div>
        )}

        {/* Map container - shows map with markers for each issue */}
        {!currentLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-96 sm:h-[600px] md:h-[calc(100vh-280px)] min-h-[600px]"
          >
            <MapContainer
              center={
                userLocation
                  ? [userLocation.lat, userLocation.lng]
                  : DEFAULT_MAP_CENTER
              }
              zoom={userLocation ? 14 : 13}
              className="w-full h-full"
              key={
                userLocation
                  ? `map-${userLocation.lat}-${userLocation.lng}`
                  : "map-default"
              }
            >
              {/* OpenStreetMap tiles - free map background */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* User location marker - blue dot showing where user is */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={getUserLocationIcon()}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-bold text-blue-600">Your Location</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Issue markers - one marker for each issue */}
              {issuesToDisplay.map((issue) => (
                <Marker
                  key={issue._id}
                  position={[
                    issue.location.coordinates[1], // latitude
                    issue.location.coordinates[0], // longitude
                  ]}
                  icon={getMarkerIcon(issue.status)}
                  // When marker is clicked, show custom popup with issue details
                  eventHandlers={{
                    click: () => setSelectedPopupIssue(issue._id),
                  }}
                >
                  {/* Popup shown when marker is clicked */}
                  {selectedPopupIssue === issue._id && (
                    <Popup
                      onClose={() => setSelectedPopupIssue(null)}
                      autoPan={true}
                      maxWidth={320}
                    >
                      <IssuePopupCard
                        issue={issue}
                        onClose={() => setSelectedPopupIssue(null)}
                      />
                    </Popup>
                  )}
                </Marker>
              ))}
            </MapContainer>
          </motion.div>
        )}

        {/* Empty state - shown when no issues are found */}
        {!currentLoading && issuesToDisplay.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-96 bg-white"
          >
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">
                {showNearby
                  ? "No issues found nearby"
                  : "No issues found with selected filters"}
              </p>
              {showNearby && (
                <button
                  onClick={handleShowAllIssues}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Show All Issues Instead
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Legend showing what each color means */}
        <div className="bg-white shadow-md p-3 sm:p-4 border-t border-gray-200">
          <p className="text-center text-gray-600 max-w-6xl mx-auto text-xs sm:text-sm md:text-base">
            🔴 Red = Open | 🟡 Yellow = In Progress | 🟢 Green = Resolved | ⚪
            Gray = Rejected
          </p>
        </div>
      </div>
    </>
  );
}

export default MapPage;
