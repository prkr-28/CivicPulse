import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { selectIsAdmin } from "../store/slices/authSlice";
import Navbar from "../components/Navbar";
import {
  Flag,
  Map,
  MapPin,
  LayoutDashboard,
  ClipboardList,
  Info,
  LogOut,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-civic-green-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-civic-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #d1fae5 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              opacity: 0.5,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-md w-full"
          >
            {/* Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-civic-green-600" />

              <div className="p-8">
                {/* Icon + badge row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-civic-green-50 border border-civic-green-100 rounded-2xl flex items-center justify-center">
                    <LayoutDashboard className="w-7 h-7 text-civic-green-600" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-green-700 bg-civic-green-50 border border-civic-green-200 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-civic-green-500 rounded-full animate-pulse" />
                    Admin Access Granted
                  </span>
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Welcome back, Administrator
                </h1>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  You have full administrative privileges — manage issues, view
                  statistics, and update statuses from your dashboard.
                </p>

                {/* Privilege pills */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                  {[
                    {
                      icon: <ClipboardList className="w-4 h-4" />,
                      label: "Manage Issues",
                    },
                    {
                      icon: <Flag className="w-4 h-4" />,
                      label: "Update Status",
                    },
                    { icon: <Info className="w-4 h-4" />, label: "View Stats" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl py-3 px-2 text-center"
                    >
                      <span className="text-civic-green-600">{item.icon}</span>
                      <span className="text-xs font-medium text-gray-600">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center justify-center gap-2 bg-civic-green-600 hover:bg-civic-green-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm mb-3"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Admin Dashboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium py-3 rounded-xl transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign in with a different account
                </motion.button>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400 mt-4">
              CivicPulse Admin · Secure access
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="min-h-screen bg-white">
          <motion.section
            className="relative bg-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Dot grid background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #d1fae5 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: 0.6,
              }}
            />
            {/* Soft green glow top-left */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-civic-green-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
            {/* Soft green glow bottom-right */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-civic-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 bg-civic-green-50 border border-civic-green-200 text-civic-green-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6"
              >
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 bg-civic-green-500 rounded-full inline-block"
                />
                Now live in 12 cities across India
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-6"
              >
                Report local issues.
                <br />
                <span className="text-civic-green-600">Get them fixed.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                CivicPulse connects citizens with local governments. Report
                potholes, broken streetlights, garbage, and other issues in your
                neighborhood. Your voice matters.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-2 bg-civic-green-600 hover:bg-civic-green-500 text-white px-7 py-3 rounded-xl font-bold text-base shadow-md transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Report an Issue
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:border-civic-green-300 hover:bg-civic-green-50 text-gray-700 px-7 py-3 rounded-xl font-semibold text-base transition-all"
                  >
                    <Map className="w-4 h-4" />
                    View Live Map
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust row */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-center gap-6 flex-wrap"
              >
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <span className="text-civic-green-500">✓</span> Free to use
                </div>
                <div className="w-px h-4 bg-gray-200 hidden sm:block" />
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <span className="text-civic-green-500">✓</span> No app
                  download needed
                </div>
                <div className="w-px h-4 bg-gray-200 hidden sm:block" />
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <span className="text-civic-green-500">✓</span> Open source
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Stats Section - Cross Grid */}
          <motion.section
            className="py-10 sm:py-14 px-4 sm:px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-3 divide-x divide-y divide-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {[
                  { number: "2,400+", label: "Issues reported", icon: "🏙️" },
                  { number: "68%", label: "Resolution rate", icon: "✅" },
                  { number: "12", label: "Cities covered", icon: "📍" },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "#f0fdf4" }}
                    className="flex flex-col items-center justify-center py-8 sm:py-10 px-4 bg-white transition-colors duration-200 cursor-default"
                  >
                    <span className="text-2xl mb-2">{stat.icon}</span>
                    <h3 className="text-3xl sm:text-4xl font-bold text-civic-green-600 mb-1">
                      {stat.number}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base text-center">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50"
            id="features"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="max-w-6xl mx-auto">
              {/* Attractive heading block */}
              <motion.div
                variants={itemVariants}
                className="text-center mb-10 sm:mb-14"
              >
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-civic-green-600 uppercase bg-civic-green-50 border border-civic-green-200 px-4 py-1.5 rounded-full mb-4">
                  Built for Citizens
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Everything you need to{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-civic-green-600">
                      take action
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-2 bg-civic-green-100 -z-0 rounded" />
                  </span>
                </h2>
                <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
                  From spotting a pothole to watching it get fixed — CivicPulse
                  gives you the tools to make it happen.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
                {[
                  {
                    icon: "📸",
                    title: "Photo Reports",
                    desc: "Upload photos of issues to provide evidence and help authorities understand the problem better",
                    color: "bg-orange-50 border-orange-100",
                    iconBg: "bg-orange-100",
                  },
                  {
                    icon: "🗺️",
                    title: "Live Map",
                    desc: "See all reported issues on an interactive map. Filter by category and status",
                    color: "bg-blue-50 border-blue-100",
                    iconBg: "bg-blue-100",
                  },
                  {
                    icon: "🔔",
                    title: "Status Alerts",
                    desc: "Get notified via email when your reported issues are reviewed or resolved",
                    color: "bg-yellow-50 border-yellow-100",
                    iconBg: "bg-yellow-100",
                  },
                  {
                    icon: "👍",
                    title: "Upvotes",
                    desc: "Upvote issues to show your support and help prioritize which problems get fixed first",
                    color: "bg-purple-50 border-purple-100",
                    iconBg: "bg-purple-100",
                  },
                  {
                    icon: "📊",
                    title: "Admin Dashboard",
                    desc: "Administrators can track progress and update issue statuses from one central location",
                    color: "bg-civic-green-50 border-civic-green-100",
                    iconBg: "bg-civic-green-100",
                  },
                  {
                    icon: "✅",
                    title: "Verified Updates",
                    desc: "Track progress as authorities update your issues through different stages of resolution",
                    color: "bg-teal-50 border-teal-100",
                    iconBg: "bg-teal-100",
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={featureVariants}
                    whileHover={{
                      y: -6,
                      boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
                    }}
                    className={`bg-white p-5 sm:p-6 md:p-8 rounded-xl border ${feature.color} hover:shadow-xl transition-all duration-200`}
                  >
                    <div
                      className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center text-2xl mb-5`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Steps Section */}
          <motion.section
            className="py-16 sm:py-20 px-4 sm:px-6 bg-white"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                variants={itemVariants}
                className="text-center mb-12 sm:mb-16"
              >
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-civic-green-600 uppercase bg-civic-green-50 border border-civic-green-200 px-4 py-1.5 rounded-full mb-4">
                  How it works
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                  Four steps to a{" "}
                  <span className="text-civic-green-600">cleaner city</span>
                </h2>
              </motion.div>

              {/* Stepper */}
              <div className="relative">
                {/* Connecting line — desktop only */}
                <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-civic-green-100 z-0 mx-16" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                  {[
                    {
                      number: "01",
                      title: "Spot the Problem",
                      desc: "See something broken? A pothole, streetlight out, or garbage pile? Notice it.",
                      icon: "👁️",
                    },
                    {
                      number: "02",
                      title: "Report in Seconds",
                      desc: "Snap a photo, add details, and pin the location on the map in seconds.",
                      icon: "📸",
                    },
                    {
                      number: "03",
                      title: "Track to Resolution",
                      desc: "Watch as local authorities review, prioritize, and fix your reported issues.",
                      icon: "📍",
                    },
                    {
                      number: "04",
                      title: "Build Momentum",
                      desc: "Upvote issues to help your community prioritize what gets fixed first.",
                      icon: "🚀",
                    },
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="flex flex-col items-center text-center group"
                    >
                      {/* Number circle */}
                      <div className="w-16 h-16 rounded-full bg-civic-green-600 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-md group-hover:bg-civic-green-500 transition-colors duration-200">
                        {step.number}
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6 w-full hover:shadow-md transition-all duration-200">
                        <div className="text-2xl mb-3">{step.icon}</div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* What can you report */}
          <motion.section
            className="py-14 sm:py-18 px-4 sm:px-6 bg-gray-50"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="max-w-6xl mx-auto text-center">
              <motion.div variants={itemVariants} className="mb-10">
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-civic-green-600 uppercase bg-civic-green-50 border border-civic-green-200 px-4 py-1.5 rounded-full mb-4">
                  Categories
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                  What can you{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-civic-green-600">
                      report?
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-2 bg-civic-green-100 -z-0 rounded" />
                  </span>
                </h2>
                <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
                  From broken roads to fallen trees — if it affects your
                  neighbourhood, report it.
                </p>
              </motion.div>

              <motion.div className="flex flex-wrap gap-3 justify-center">
                {[
                  { label: "Potholes", icon: "🕳️" },
                  { label: "Streetlights", icon: "💡" },
                  { label: "Garbage", icon: "🗑️" },
                  { label: "Water leakage", icon: "💧" },
                  { label: "Broken footpath", icon: "🚶" },
                  { label: "Open manholes", icon: "⚠️" },
                  { label: "Fallen trees", icon: "🌳" },
                  { label: "Other", icon: "📋" },
                ].map((cat, idx) => (
                  <motion.span
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium hover:border-civic-green-400 hover:text-civic-green-700 hover:bg-civic-green-50 transition-all cursor-pointer text-sm sm:text-base shadow-sm"
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Testimonials */}
          <motion.section
            className="py-16 sm:py-20 px-4 sm:px-6 bg-white"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-widest text-civic-green-600 uppercase bg-civic-green-50 border border-civic-green-200 px-4 py-1.5 rounded-full mb-4">
                  Testimonials
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                  What citizens are{" "}
                  <span className="text-civic-green-600">saying</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    quote:
                      "CivicPulse made it so easy to report that pothole on my street. It got fixed in less than a week!",
                    author: "Rajesh Kumar",
                    city: "New Delhi",
                    initials: "RK",
                    stars: 5,
                  },
                  {
                    quote:
                      "Finally, a platform where our voices are heard. The city government actually responds to our reports.",
                    author: "Priya Mehra",
                    city: "Mumbai",
                    initials: "PM",
                    stars: 5,
                  },
                  {
                    quote:
                      "As an admin, this dashboard helps me manage and prioritize issues efficiently. Game changer for city management.",
                    author: "Vikram Gupta",
                    city: "Bangalore",
                    initials: "VG",
                    stars: 5,
                  },
                ].map((testimonial, idx) => (
                  <motion.div
                    key={idx}
                    variants={featureVariants}
                    whileHover={{ y: -4 }}
                    className="bg-gray-50 border border-gray-100 p-6 sm:p-8 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-200"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-base">
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 flex-1">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-civic-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {testimonial.author}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {testimonial.city}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 bg-civic-green-600 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-civic-green-500 rounded-full opacity-30 pointer-events-none" />
            <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-civic-green-700 rounded-full opacity-30 pointer-events-none" />

            <div className="max-w-3xl mx-auto text-center relative z-10">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-civic-green-500 text-civic-green-100 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              >
                <span className="w-2 h-2 bg-civic-green-200 rounded-full animate-pulse" />
                Join 2,400+ citizens already reporting
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
              >
                Your neighbourhood needs <br className="hidden sm:block" />
                <span className="text-civic-green-200">your voice</span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-civic-green-100 text-base sm:text-lg mb-8 max-w-xl mx-auto"
              >
                Help make your city a better place to live. Start reporting
                issues today — it only takes 30 seconds.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/report"
                    className="bg-white text-civic-green-700 px-8 py-3 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors inline-block shadow-md"
                  >
                    Get started — it's free
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/map"
                    className="border border-civic-green-300 text-white px-8 py-3 rounded-xl font-semibold text-base hover:bg-civic-green-500 transition-colors inline-block"
                  >
                    View live map →
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-civic-green-600 rounded-lg flex items-center justify-center group-hover:bg-civic-green-500 transition-colors">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  CivicPulse
                </span>
              </Link>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-center">
                <span>Built with MERN</span>
                <span className="hidden sm:inline text-gray-600">·</span>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span>Open source</span>
                  <a
                    href="https://github.com/prkr-28/CivicPulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Contribute on GitHub"
                  >
                    <FaGithub className="ml-2 w-5 h-5 cursor-pointer hover:text-gray-300" />
                  </a>
                </div>
                <span className="hidden sm:inline text-gray-600">·</span>
                <span>Made for India 🇮🇳</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

export default Home;
