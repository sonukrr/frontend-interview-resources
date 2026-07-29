import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import ChallengePage from './pages/ChallengePage';
import DrillsPage from './pages/DrillsPage';
import FlashcardsPage from './pages/FlashcardsPage';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer + scroll to top on navigation
  useEffect(() => {
    setNavOpen(false);
    document.querySelector('.content')?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app">
      <button
        className="nav-toggle"
        onClick={() => setNavOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
      <Sidebar open={navOpen} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:id" element={<LessonPage section="js" />} />
          <Route path="/sd/:id" element={<LessonPage section="sd" />} />
          <Route path="/kit/:id" element={<LessonPage section="kit" />} />
          <Route path="/challenge/:id" element={<ChallengePage />} />
          <Route path="/drills" element={<DrillsPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
