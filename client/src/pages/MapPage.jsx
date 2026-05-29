import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  MapPin,
  Navigation,
  SlidersHorizontal,
  X,
  Layers,
  AlertCircle,
  Clock,
  CheckCircle,
  Map,
} from "lucide-react";

const MARKER_COLORS = {
  open: "#ef4444",
  "in-progress": "#f59e0b",
  resolved: "#10b981",
  rejected: "#6b7280",
};

const STATUS_LEGEND = [
  {
    status: "open",
    label: "Open",
    color: "#ef4444",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  {
    status: "in-progress",
    label: "In Progress",
    color: "#f59e0b",
    icon: <Clock className="w-3 h-3" />,
  },
  {
    status: "resolved",
    label: "Resolved",
    color: "#10b981",
    icon: <CheckCircle className="w-3 h-3" />,
  },
];

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
  const [showFilters, setShowFilters] = useState(false);

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
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserLocation({ lat: latitude, lng: longitude });
        dispatch(
          fetchNearbyIssues({
            lat: latitude,
            lng: longitude,
            radius: NEARBY_RADIUS,
          }),
        );
        setShowNearby(true);
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED)
          alert("Please allow location access to find nearby issues");
        else if (error.code === error.POSITION_UNAVAILABLE)
          alert("Location information is unavailable");
        else if (error.code === error.TIMEOUT)
          alert("Location request timed out");
        else alert("An error occurred while getting your location");
      },
    );
  };

  const handleShowAllIssues = () => {
    setShowNearby(false);
    setUserLocation(null);
    setSelectedPopupIssue(null);
  };

  const filterOwnIssues = (issues) =>
    !user ? issues : issues.filter((i) => i.reportedBy._id !== user.id);

  const issuesToDisplay = filterOwnIssues(
    showNearby ? nearbyIssues : allIssues,
  );
  const currentLoading = showNearby ? nearbyLoading : loading;

  const hasActiveFilters = selectedCategory || selectedStatus;

  const getMarkerIcon = (status) => {
    const color = MARKER_COLORS[status] || MARKER_COLORS.rejected;
    return L.divIcon({
      html: `<div style="
        background:${color};
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="transform:rotate(45deg);color:white;font-size:13px;line-height:1;">📍</div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: "custom-marker",
    });
  };

  const getUserLocationIcon = () =>
    L.divIcon({
      html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#3b82f6;border:3px solid white;
      box-shadow:0 0 0 4px rgba(59,130,246,0.25);
    "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      className: "user-marker",
    });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* ── Top control bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-100 shadow-sm z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Title */}
              <div className="flex items-center gap-2 mr-2">
                <div className="w-8 h-8 bg-civic-green-600 rounded-lg flex items-center justify-center">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {showNearby ? "Nearby Issues" : "All Issues Map"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {issuesToDisplay.length} issue
                    {issuesToDisplay.length !== 1 ? "s" : ""} shown
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    hasActiveFilters
                      ? "bg-civic-green-50 border-civic-green-200 text-civic-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-civic-green-500 rounded-full" />
                  )}
                </button>

                {/* Nearby button */}
                <button
                  onClick={handleGetNearbyIssues}
                  disabled={gettingLocation}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors shadow-sm"
                >
                  {gettingLocation ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      Nearby ({NEARBY_RADIUS}km)
                    </>
                  )}
                </button>

                {/* Show all */}
                {showNearby && (
                  <button
                    onClick={handleShowAllIssues}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Show All
                  </button>
                )}
              </div>
            </div>

            {/* Expandable filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pb-1 flex flex-col sm:flex-row gap-3">
                    {/* Category */}
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => dispatch(setCategory(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-gray-700"
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

                    {/* Status */}
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => dispatch(setStatus(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-gray-700"
                      >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Clear filters */}
                    {hasActiveFilters && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            dispatch(setCategory(""));
                            dispatch(setStatus(""));
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Clear
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nearby info pill */}
            {showNearby && userLocation && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Showing issues within {NEARBY_RADIUS}km of your location
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Map area ── */}
        <div className="flex-1 relative">
          {/* Loading overlay */}
          {currentLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-civic-green-200 border-t-civic-green-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-500">
                Loading issues...
              </p>
            </div>
          )}

          {/* Empty state overlay */}
          {!currentLoading && issuesToDisplay.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8 text-center max-w-sm mx-4 pointer-events-auto"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  No issues found
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {showNearby
                    ? `No issues found within ${NEARBY_RADIUS}km of your location.`
                    : "No issues match the selected filters."}
                </p>
                {showNearby ? (
                  <button
                    onClick={handleShowAllIssues}
                    className="text-sm font-semibold text-civic-green-600 hover:text-civic-green-500 transition-colors"
                  >
                    View all issues instead →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      dispatch(setCategory(""));
                      dispatch(setStatus(""));
                    }}
                    className="text-sm font-semibold text-civic-green-600 hover:text-civic-green-500 transition-colors"
                  >
                    Clear filters →
                  </button>
                )}
              </motion.div>
            </div>
          )}

          {/* Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full"
            style={{ height: "calc(100vh - 180px)", minHeight: "500px" }}
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
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={getUserLocationIcon()}
                >
                  <Popup>
                    <div className="text-center py-1">
                      <p className="font-semibold text-blue-600 text-sm">
                        📍 Your Location
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {issuesToDisplay.map((issue) => (
                <Marker
                  key={issue._id}
                  position={[
                    issue.location.coordinates[1],
                    issue.location.coordinates[0],
                  ]}
                  icon={getMarkerIcon(issue.status)}
                  eventHandlers={{
                    click: () => setSelectedPopupIssue(issue._id),
                  }}
                >
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

          {/* ── Legend — bottom-right overlay ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Legend
            </p>
            <div className="flex flex-col gap-1.5">
              {STATUS_LEGEND.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Issue count badge — bottom-left ── */}
          {!currentLoading && issuesToDisplay.length > 0 && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-gray-100 rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-civic-green-600" />
              <span className="text-xs font-semibold text-gray-700">
                {issuesToDisplay.length} issue
                {issuesToDisplay.length !== 1 ? "s" : ""} on map
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MapPage;
