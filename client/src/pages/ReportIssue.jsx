import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createIssue, selectIssuesLoading } from '../store/slices/issuesSlice';
import Navbar from '../components/Navbar';
import AiDescriptionImprover from '../components/AiDescriptionImprover';

function ReportIssue() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState([]);
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.209);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectIssuesLoading);

  const onDrop = (acceptedFiles) => {
    const newPhotos = [...photos, ...acceptedFiles].slice(0, 5);
    setPhotos(newPhotos);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }
  });

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setError('Please allow location access to use your current location');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError('Location information is unavailable');
        } else if (error.code === error.TIMEOUT) {
          setError('Location request timed out');
        } else {
          setError('Failed to get your location');
        }
      }
    );
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      }
    });
    return <Marker position={[latitude, longitude]} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      // Add multiple photos
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      // Dispatch createIssue thunk (Redux handles API call and cache update)
      const result = await dispatch(createIssue(formData));

      // Check if successful
      if (!result.payload?.error) {
        alert('Issue reported successfully!');
        navigate('/my-issues');
      }
    } catch (err) {
      setError('Failed to report issue. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-5 sm:p-8"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Report an Issue</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-civic-red text-white px-4 py-3 rounded-lg mb-6 text-sm sm:text-base"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Title input */}
            <div>
              <label htmlFor="title" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Large pothole on Main Street"
                required
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Category dropdown */}
            <div>
              <label htmlFor="category" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select a category</option>
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

            {/* Description textarea */}
            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail"
                rows="5"
                required
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent text-sm sm:text-base"
              />
              <AiDescriptionImprover
                description={description}
                category={category}
                onAccept={(improvedText) => setDescription(improvedText)}
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Upload Photos (Optional - Max 5 images)
              </label>
              <motion.div
                {...getRootProps()}
                whileHover={{ borderColor: '#1d9e75', backgroundColor: '#f0fdf9' }}
                className={`p-6 sm:p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-civic-green-500 bg-civic-green-50'
                    : 'border-gray-300 hover:border-civic-green-500'
                }`}
              >
                <input {...getInputProps()} />
                {photos.length === 0 ? (
                  <>
                    <p className="text-2xl sm:text-3xl mb-2">📷</p>
                    <p className="text-gray-700 font-semibold text-sm sm:text-base">Drag and drop images here, or click to select</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Supported formats: JPG, PNG, GIF (Max 5 images, 10MB each)</p>
                  </>
                ) : (
                  <p className="text-civic-green-600 font-semibold text-sm sm:text-base">✓ {photos.length} image(s) selected</p>
                )}
              </motion.div>

              {/* Display selected images with remove option */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Selected ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <p className="text-xs mt-1 truncate text-gray-600">{photo.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map for location picker */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Select Location (Click on map) *
              </label>
              <div className="flex gap-2 mb-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleGetUserLocation}
                  disabled={gettingLocation}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {gettingLocation ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Getting Location...
                    </>
                  ) : (
                    <>📍 Use My Location</>
                  )}
                </motion.button>
              </div>
              <div className="rounded-lg overflow-hidden shadow-md h-80 sm:h-96 border border-gray-300">
                <MapContainer center={[latitude, longitude]} zoom={13} className="w-full h-full" key={`map-${latitude}-${longitude}`}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                </MapContainer>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                Selected: <span className="font-semibold">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              </p>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2 sm:py-3"
            >
              {loading ? 'Reporting...' : 'Report Issue'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default ReportIssue;
