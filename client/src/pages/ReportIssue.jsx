import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createIssue, selectIssuesLoading } from "../store/slices/issuesSlice";
import Navbar from "../components/Navbar";
import AiDescriptionImprover from "../components/AiDescriptionImprover";
import {
  Flag,
  Tag,
  FileText,
  ImagePlus,
  MapPin,
  Navigation,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
} from "lucide-react";

const CATEGORIES = [
  { value: "Potholes", label: "Potholes", icon: "🕳️" },
  { value: "Streetlights", label: "Streetlights", icon: "💡" },
  { value: "Garbage", label: "Garbage", icon: "🗑️" },
  { value: "Water leakage", label: "Water leakage", icon: "💧" },
  { value: "Broken footpath", label: "Broken footpath", icon: "🚶" },
  { value: "Open manholes", label: "Open manholes", icon: "⚠️" },
  { value: "Fallen trees", label: "Fallen trees", icon: "🌳" },
  { value: "Other", label: "Other", icon: "📋" },
];

const STEPS = [
  { id: 1, label: "Category", icon: <Tag className="w-4 h-4" /> },
  { id: 2, label: "Details", icon: <FileText className="w-4 h-4" /> },
  { id: 3, label: "Location", icon: <MapPin className="w-4 h-4" /> },
  { id: 4, label: "Photos", icon: <ImagePlus className="w-4 h-4" /> },
];

function ReportIssue() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.209);
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectIssuesLoading);

  /* ── Dropzone ── */
  const onDrop = (acceptedFiles) => {
    setPhotos((prev) => [...prev, ...acceptedFiles].slice(0, 5));
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
  });
  const removePhoto = (idx) => setPhotos(photos.filter((_, i) => i !== idx));

  /* ── Location ── */
  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setLatitude(lat);
        setLongitude(lng);
        setGettingLocation(false);
      },
      (e) => {
        setGettingLocation(false);
        setError(
          e.code === e.PERMISSION_DENIED
            ? "Please allow location access"
            : e.code === e.POSITION_UNAVAILABLE
              ? "Location unavailable"
              : e.code === e.TIMEOUT
                ? "Location request timed out"
                : "Failed to get your location",
        );
      },
    );
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      },
    });
    return <Marker position={[latitude, longitude]} />;
  }

  /* ── Step validation ── */
  const canProceed = () => {
    if (step === 1) return !!category;
    if (step === 2)
      return title.trim().length > 0 && description.trim().length > 0;
    return true;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError("");
    if (!title || !description || !category) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      photos.forEach((p) => formData.append("photos", p));
      const result = await dispatch(createIssue(formData));
      if (!result.payload?.error) {
        setSubmitted(true);
        setTimeout(() => navigate("/my-issues"), 3000);
      }
    } catch {
      setError("Failed to report issue. Please try again.");
    }
  };

  /* ── Success screen ── */
  if (submitted)
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-xl p-10 text-center max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 bg-civic-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-9 h-9 text-civic-green-600" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Issue Reported!
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Your issue has been submitted successfully.
            </p>
            <p className="text-xs text-gray-400">Redirecting to My Issues...</p>
            <div className="mt-5 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-civic-green-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </>
    );

  const selectedCat = CATEGORIES.find((c) => c.value === category);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-9 h-9 bg-civic-green-600 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Report an Issue
              </h1>
              <p className="text-xs text-gray-500">
                Help make your city better — it takes 2 minutes
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step > s.id
                          ? "bg-civic-green-600 text-white"
                          : step === s.id
                            ? "bg-civic-green-600 text-white ring-4 ring-civic-green-100"
                            : "bg-white border-2 border-gray-200 text-gray-400"
                      }`}
                    >
                      {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        step >= s.id ? "text-civic-green-600" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="h-full bg-civic-green-500 transition-all duration-500"
                        style={{ width: step > s.id ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
                <button onClick={() => setError("")} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="h-1 w-full bg-civic-green-600" />

            <div className="p-5 sm:p-7">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Category ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                      What type of issue is it?
                    </h2>
                    <p className="text-sm text-gray-500 mb-5">
                      Select the category that best describes the problem.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                            category === cat.value
                              ? "border-civic-green-500 bg-civic-green-50 shadow-sm"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                          }`}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span
                            className={`text-xs font-medium leading-tight ${
                              category === cat.value
                                ? "text-civic-green-700"
                                : "text-gray-600"
                            }`}
                          >
                            {cat.label}
                          </span>
                          {category === cat.value && (
                            <div className="w-4 h-4 bg-civic-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Details ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-base font-semibold text-gray-900 mb-1">
                        Tell us about the issue
                      </h2>
                      <p className="text-sm text-gray-500 mb-5">
                        Be as specific as possible — this helps authorities
                        understand and fix it faster.
                      </p>
                    </div>

                    {selectedCat && (
                      <div className="inline-flex items-center gap-2 bg-civic-green-50 border border-civic-green-100 px-3 py-1.5 rounded-full text-sm text-civic-green-700 font-medium">
                        <span>{selectedCat.icon}</span> {selectedCat.label}
                      </div>
                    )}

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Issue Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Large pothole on Main Street near the school"
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-civic-green-500 focus:border-transparent focus:bg-white transition-all placeholder-gray-400"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue in detail — size, severity, how long it's been there..."
                        rows={5}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-civic-green-500 focus:border-transparent focus:bg-white transition-all placeholder-gray-400 resize-none"
                      />
                      <AiDescriptionImprover
                        description={description}
                        category={category}
                        onAccept={(improved) => setDescription(improved)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Location ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                      Where is the issue?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Click on the map to pin the exact location, or use your
                      current location.
                    </p>

                    <button
                      type="button"
                      onClick={handleGetUserLocation}
                      disabled={gettingLocation}
                      className="flex items-center gap-2 px-4 py-2.5 mb-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
                    >
                      {gettingLocation ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          Use my current location
                        </>
                      )}
                    </button>

                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm h-72 sm:h-80 mb-3">
                      <MapContainer
                        center={[latitude, longitude]}
                        zoom={13}
                        className="w-full h-full"
                        key={`map-${latitude}-${longitude}`}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                      <MapPin className="w-4 h-4 text-civic-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">
                          Selected coordinates
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {latitude.toFixed(5)}, {longitude.toFixed(5)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 4: Photos ── */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-base font-semibold text-gray-900 mb-1">
                      Add photos{" "}
                      <span className="text-gray-400 font-normal text-sm">
                        (optional)
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 mb-5">
                      Photos help authorities understand the problem better. Max
                      5 images.
                    </p>

                    {/* Dropzone */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive
                          ? "border-civic-green-500 bg-civic-green-50"
                          : "border-gray-200 bg-gray-50 hover:border-civic-green-300 hover:bg-civic-green-50/30"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Upload
                          className={`w-6 h-6 ${isDragActive ? "text-civic-green-500" : "text-gray-400"}`}
                        />
                      </div>
                      {photos.length === 0 ? (
                        <>
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {isDragActive
                              ? "Drop images here"
                              : "Drag & drop images, or click to browse"}
                          </p>
                          <p className="text-xs text-gray-400">
                            JPG, PNG, GIF · Max 5 images · 10MB each
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-civic-green-600">
                          ✓ {photos.length} image{photos.length > 1 ? "s" : ""}{" "}
                          selected — click to add more
                        </p>
                      )}
                    </div>

                    {/* Photo previews */}
                    {photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                        {photos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="relative group aspect-square"
                          >
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover rounded-xl border border-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Summary before submit */}
                    <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Summary
                      </p>
                      {[
                        {
                          label: "Category",
                          value: selectedCat
                            ? `${selectedCat.icon} ${selectedCat.label}`
                            : "—",
                        },
                        { label: "Title", value: title || "—" },
                        {
                          label: "Location",
                          value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                        },
                        {
                          label: "Photos",
                          value: `${photos.length} image${photos.length !== 1 ? "s" : ""}`,
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex gap-2 text-sm">
                          <span className="text-gray-400 w-20 flex-shrink-0">
                            {item.label}
                          </span>
                          <span className="text-gray-700 font-medium truncate">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation footer */}
            <div className="px-5 sm:px-7 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep((s) => s - 1);
                    setError("");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!canProceed()) {
                      setError("Please complete this step before continuing");
                      return;
                    }
                    setError("");
                    setStep((s) => s + 1);
                  }}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-civic-green-600 hover:bg-civic-green-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-civic-green-600 hover:bg-civic-green-500 disabled:opacity-50 rounded-xl transition-all shadow-sm"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Step hint */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Step {step} of {STEPS.length} · {STEPS[step - 1].label}
          </p>
        </div>
      </div>
    </>
  );
}

export default ReportIssue;
