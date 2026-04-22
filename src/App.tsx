import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
        </Route>

      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
