import { useState, useEffect } from 'react';
import HeroCanvas from './components/HeroCanvas';
import TeacherDashboard from './components/TeacherDashboard';
import QuestionForge from './components/QuestionForge.jsx'; // <--- ADD THIS IMPORT

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ROUTER LOGIC
  if (currentHash === '#teacher') {
    return <TeacherDashboard />;
  }

  if (currentHash === '#forge') { // <--- THE SECRETE ADMIN BACKDOOR
    return <QuestionForge />;
  }

  return <HeroCanvas />; // Your normal student flow
}