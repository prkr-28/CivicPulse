import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAdmin } from '../store/slices/authSlice';
import { useLogout } from '../store/useLogout';

function Navbar() {
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const getUserName = () => {
    if (user?.name) return user.name;
    if (!user?.email) return 'User';
    return user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        setIsVisible(true);
      }
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const onLogout = () => {
    handleLogout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const navLinkVariants = {
    hover: { scale: 1.05, color: '#7dd3c0' },
    tap: { scale: 0.95 },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.nav
      className="bg-civic-green-500 shadow-lg sticky top-0 z-50"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -80 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="flex items-center gap-2 text-white text-2xl font-bold hover:text-civic-green-200 transition-colors"
            >
              <span className="text-3xl">📍</span>
              <span className="hidden sm:inline">CivicPulse</span>
            </Link>
          </motion.div>

          {!isAdmin && (
            <div className="hidden md:flex items-center gap-8">
              <motion.div
                variants={navLinkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/map" className="text-white font-medium hover:text-civic-green-200 transition-colors">
                  Map
                </Link>
              </motion.div>

              <motion.div
                variants={navLinkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/report" className="text-white font-medium hover:text-civic-green-200 transition-colors">
                  Report
                </Link>
              </motion.div>

              <motion.div
                variants={navLinkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <a href="/#features" className="text-white font-medium hover:text-civic-green-200 transition-colors">
                  About
                </a>
              </motion.div>
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="bg-white text-civic-green-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    👤 {getUserName()}
                    <span className={`text-sm transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </motion.button>

                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-700">{getUserName()}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <p className="text-xs font-semibold text-civic-green-600 mt-1">⭐ Admin</p>
                        )}
                      </div>

                      <div className="py-2">
                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                          >
                            📊 Admin Dashboard
                          </Link>
                        ) : (
                          <Link
                            to="/my-issues"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                          >
                            📋 My Issues
                          </Link>
                        )}

                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-200"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="bg-civic-green-700 hover:bg-civic-green-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </motion.button>
        </div>

        <motion.div
          variants={mobileMenuVariants}
          initial="hidden"
          animate={mobileMenuOpen ? 'visible' : 'hidden'}
          className="md:hidden overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-civic-green-600">
            {!isAdmin && (
              <>
                <Link
                  to="/map"
                  className="block text-white px-3 py-2 rounded-md hover:bg-civic-green-700 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Map
                </Link>
                <Link
                  to="/report"
                  className="block text-white px-3 py-2 rounded-md hover:bg-civic-green-700 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Report
                </Link>
                <a
                  href="/#features"
                  className="block text-white px-3 py-2 rounded-md hover:bg-civic-green-700 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
              </>
            )}

            <div className="border-t border-civic-green-700 my-2 pt-2">
              {user ? (
                <>
                  <p className="text-white text-sm px-3 py-2 font-medium">
                    👤 {getUserName()}
                  </p>
                  <p className="text-gray-100 text-xs px-3 pb-2">
                    {user.email}
                  </p>
                  {isAdmin && (
                    <p className="text-civic-green-200 text-xs px-3 py-1 font-semibold">
                      ⭐ Admin Access
                    </p>
                  )}
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="block bg-white text-civic-green-600 px-3 py-2 rounded-md font-semibold transition-colors mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/my-issues"
                      className="block text-civic-green-200 px-3 py-2 rounded-md hover:bg-civic-green-700 transition-colors font-medium mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Issues
                    </Link>
                  )}
                  <button
                    onClick={onLogout}
                    className="w-full text-left text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors font-medium mt-2"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-white px-3 py-2 rounded-md hover:bg-civic-green-700 transition-colors font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}

export default Navbar;

