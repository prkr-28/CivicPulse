import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { selectUser, selectIsAdmin } from "../store/slices/authSlice";
import { useLogout } from "../store/useLogout";
import {
  MapPin,
  Map,
  Flag,
  Info,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Bell,
} from "lucide-react";

function Navbar() {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const getUserName = () => {
    if (user?.name) return user.name;
    if (!user?.email) return "User";
    return (
      user.email.split("@")[0].charAt(0).toUpperCase() +
      user.email.split("@")[0].slice(1)
    );
  };

  const getInitials = () => {
    const name = getUserName();
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onLogout = () => {
    handleLogout();
    navigate("/");
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-civic-green-600 rounded-lg flex items-center justify-center group-hover:bg-civic-green-500 transition-colors">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Civic<span className="text-civic-green-600">Pulse</span>
            </span>
          </Link>

          {/* Center nav links - desktop */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/map"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-civic-green-600 hover:bg-civic-green-50 transition-all"
              >
                <Map className="w-4 h-4" />
                Map
              </Link>
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-civic-green-600 hover:bg-civic-green-50 transition-all"
              >
                <Flag className="w-4 h-4" />
                Report
              </Link>
              <a
                href="/#features"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-civic-green-600 hover:bg-civic-green-50 transition-all"
              >
                <Info className="w-4 h-4" />
                About
              </a>
            </div>
          )}

          {/* Right side - desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* GitHub link */}
            <a
              href="https://github.com/prkr-28/CivicPulse"
              target="_blank"
              rel="noopener noreferrer"
              title="Contribute on GitHub"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-bold"
            >
              GH
            </a>
            {user ? (
              <div className="flex items-center gap-2">
                {/* Bell */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-civic-green-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-civic-green-500 rounded-full" />
                </button>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-gray-200 hover:border-civic-green-300 hover:bg-gray-50 transition-all"
                  >
                    <div className="w-7 h-7 bg-civic-green-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                      {getInitials()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {getUserName()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-800">
                            {getUserName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                          {isAdmin && (
                            <span className="inline-block mt-1 text-xs font-semibold text-civic-green-700 bg-civic-green-100 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="py-1.5">
                          {isAdmin ? (
                            <Link
                              to="/admin"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-gray-400" />
                              Admin Dashboard
                            </Link>
                          ) : (
                            <Link
                              to="/my-issues"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <ClipboardList className="w-4 h-4 text-gray-400" />
                              My Issues
                            </Link>
                          )}
                          <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-civic-green-600 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-civic-green-600 hover:bg-civic-green-500 rounded-lg transition-colors shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-3 space-y-1">
                {!isAdmin && (
                  <>
                    <Link
                      to="/map"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-civic-green-600 transition-all"
                    >
                      <Map className="w-4 h-4" />
                      Map
                    </Link>
                    <Link
                      to="/report"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-civic-green-600 transition-all"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </Link>
                    <a
                      href="/#features"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-civic-green-600 transition-all"
                    >
                      <Info className="w-4 h-4" />
                      About
                    </a>

                    {/* GitHub - mobile */}
                    <a
                      href="https://github.com/prkr-28/CivicPulse"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
                    >
                      Contribute on GitHub
                    </a>
                  </>
                )}

                <div className="border-t border-gray-100 pt-3 mt-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-9 h-9 bg-civic-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {getInitials()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {getUserName()}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/my-issues"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <ClipboardList className="w-4 h-4" />
                          My Issues
                        </Link>
                      )}
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 px-1">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 text-sm font-semibold text-center text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 text-sm font-semibold text-center text-white bg-civic-green-600 rounded-lg hover:bg-civic-green-500 transition-colors"
                      >
                        Get started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

export default Navbar;
