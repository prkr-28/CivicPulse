import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginAsync, selectAuthError } from '../store/slices/authSlice';
import Navbar from '../components/Navbar';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const error = useAppSelector(selectAuthError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await dispatch(loginAsync({ email, password }));

      if (result.payload && !result.payload.error) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-civic-green-50 to-gray-50 flex items-center justify-center py-8 sm:py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign In to CivicPulse</h2>
            <p className="text-sm sm:text-base text-gray-600">Report issues and make your city better</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-civic-red text-white px-4 py-3 rounded-lg mb-6 text-xs sm:text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-5"
          >
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-green-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-2 sm:py-3 text-base sm:text-lg font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-5 sm:mt-6 text-gray-600 text-sm sm:text-base"
          >
            Don't have an account?{' '}
            <Link to="/register" className="text-civic-green-600 hover:text-civic-green-700 font-semibold">
              Register here
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}

export default Login;
