import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { restoreAuthFromStorage } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import AiChatWidget from './components/AiChatWidget';

import Home from './pages/Home';
import MapPage from './pages/MapPage';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyIssues from './pages/MyIssues';
import AdminDashboard from './pages/AdminDashboard';
import AdminIssueDetail from './pages/AdminIssueDetail';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreAuthFromStorage());
  }, [dispatch]);

  return (
    <Router>
      <AiChatWidget />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/issue/:id" element={<IssueDetail />} />

        <Route
          path="/report"
          element={
            <ProtectedRoute adminCanAccess={false}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-issues"
          element={
            <ProtectedRoute adminCanAccess={false}>
              <MyIssues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/issue/:id"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminIssueDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
