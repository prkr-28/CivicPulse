import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { selectIsAdmin } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';

function Home() {
  const isAdmin = useAppSelector(selectIsAdmin);
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <Navbar />
      {isAdmin ? (
        <div className="min-h-screen bg-gradient-to-br from-civic-green-500 to-civic-green-600 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center"
          >
            <div className="text-6xl mb-6">⭐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, Administrator
            </h1>
            <div className="bg-civic-green-100 border border-civic-green-300 text-civic-green-800 px-4 py-3 rounded-lg mb-8 text-sm">
              <p className="font-semibold mb-2">✓ Admin Access Granted</p>
              <p>You have administrative privileges. You can manage issues, view statistics, and update issue statuses.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="w-full bg-civic-green-600 hover:bg-civic-green-700 text-white font-bold py-3 rounded-lg transition-colors mb-4"
            >
              Go to Admin Dashboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="w-full border-2 border-civic-green-600 text-civic-green-600 hover:bg-civic-green-50 font-semibold py-3 rounded-lg transition-colors"
            >
              Sign in with Different Account
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <div className="min-h-screen bg-white">
        <motion.section
          className="bg-gradient-to-r from-civic-green-600 to-civic-green-500 text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="inline-block bg-civic-green-700 text-civic-green-200 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6"
          >
            Your city, your voice
          </motion.div>

          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            Report local issues.
            <br />
            <span className="text-civic-green-200">Get them fixed.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-sm sm:text-base md:text-lg lg:text-xl text-civic-green-100 max-w-2xl mx-auto mb-6 sm:mb-8"
          >
            CivicPulse connects citizens with local governments. Report potholes, broken streetlights, garbage, and other issues in your neighborhood. Your voice matters.
          </motion.p>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-3 sm:gap-4 justify-center flex-wrap"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/report"
                className="bg-white text-civic-green-600 px-5 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors inline-block"
              >
                Report an Issue
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/map"
                className="border-2 border-white text-white px-5 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-civic-green-700 transition-colors inline-block"
              >
                View Map
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          className="bg-gray-50 py-8 sm:py-12 px-4 sm:px-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { number: '2,400+', label: 'Issues reported' },
              { number: '68%', label: 'Resolution rate' },
              { number: '12', label: 'Cities covered' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center"
              >
                <h3 className="text-3xl sm:text-4xl font-bold text-civic-green-600 mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600 text-base sm:text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="py-12 sm:py-16 px-4 sm:px-6"
          id="features"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12"
            >
              Everything you need to take action
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {[
                { icon: '📸', title: 'Photo Reports', desc: 'Upload photos of issues to provide evidence and help authorities understand the problem better' },
                { icon: '🗺️', title: 'Live Map', desc: 'See all reported issues on an interactive map. Filter by category and status' },
                { icon: '🔔', title: 'Status Alerts', desc: 'Get notified via email when your reported issues are reviewed or resolved' },
                { icon: '👍', title: 'Upvotes', desc: 'Upvote issues to show your support and help prioritize which problems get fixed first' },
                { icon: '📊', title: 'Admin Dashboard', desc: 'Administrators can track progress and update issue statuses from one central location' },
                { icon: '✅', title: 'Verified Updates', desc: 'Track progress as authorities update your issues through different stages of resolution' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={featureVariants}
                  whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
                  className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12"
            >
              Three steps to a cleaner city
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
              {[
                { number: '1', title: 'Spot the Problem', desc: 'See something broken? A pothole, streetlight out, or garbage pile? Notice it.' },
                { number: '2', title: 'Report in Seconds', desc: 'Use CivicPulse to snap a photo, add details, and pin the location on the map' },
                { number: '3', title: 'Track to Resolution', desc: 'Watch as local authorities review, prioritize, and fix your reported issues' },
                { number: '4', title: 'Build Momentum', desc: 'Upvote issues to help your community prioritize what gets fixed first' },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white p-5 sm:p-6 rounded-lg shadow-md border-l-4 border-civic-green-500"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-civic-green-600 mb-3 bg-civic-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                    {step.number}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-12 sm:py-16 px-4 sm:px-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-10"
            >
              What can you report?
            </motion.h2>

            <motion.div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
              {['Potholes', 'Streetlights', 'Garbage', 'Water leakage', 'Broken footpath', 'Open manholes', 'Fallen trees', 'Other'].map((cat, idx) => (
                <motion.span
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, backgroundColor: '#1d9e75' }}
                  className="bg-civic-green-100 text-civic-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold hover:text-white transition-all cursor-pointer text-sm sm:text-base"
                >
                  {cat}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12"
            >
              What citizens are saying
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {[
                { quote: 'CivicPulse made it so easy to report that pothole on my street. It got fixed in less than a week!', author: 'Rajesh Kumar', city: 'New Delhi', initials: 'RK' },
                { quote: 'Finally, a platform where our voices are heard. The city government actually responds to our reports.', author: 'Priya Mehra', city: 'Mumbai', initials: 'PM' },
                { quote: 'As an admin, this dashboard helps me manage and prioritize issues efficiently. Game changer for city management.', author: 'Vikram Gupta', city: 'Bangalore', initials: 'VG' },
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={featureVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-md border border-gray-100"
                >
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg italic mb-4 sm:mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-civic-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.author}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{testimonial.city}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="bg-gradient-to-r from-civic-green-600 to-civic-green-500 text-white py-12 sm:py-16 px-4 sm:px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
          >
            Your neighbourhood needs your voice
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-civic-green-100 mb-6 sm:mb-8"
          >
            Help make your city a better place to live. Start reporting issues today.
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/report"
              className="bg-white text-civic-green-600 px-5 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Get started — it's free
            </Link>
          </motion.div>
        </motion.section>

        <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center flex-col sm:flex-row gap-4">
            <span className="text-lg font-bold">📍 CivicPulse</span>
            <p className="text-sm sm:text-base text-center sm:text-right">Built with MERN · Open source · Made for India</p>
          </div>
        </footer>
        </div>
      )}
    </>
  );
}

export default Home;
