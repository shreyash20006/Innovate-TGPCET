import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import Courses from './pages/Courses';
import AiUpdates from './pages/AiUpdates';
import Resources from './pages/Resources';
import About from './pages/About';
import CgpaCalculator from './pages/CgpaCalculator';
import MusicHub from './pages/MusicHub';
import SpotifyCallback from './pages/SpotifyCallback';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('admin_auth') === 'true';
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="courses" element={<Courses />} />
          <Route path="ai-updates" element={<AiUpdates />} />
          <Route path="resources" element={<Resources />} />
          <Route path="cgpa-calculator" element={<CgpaCalculator />} />
          <Route path="about" element={<About />} />
          <Route path="music-hub" element={<MusicHub />} />
          <Route path="admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Spotify OAuth callback — outside Layout so there's no nav chrome */}
        <Route path="/callback" element={<SpotifyCallback />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
