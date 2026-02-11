import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./pages/Home";
import { Directory } from "./pages/Directory";
import { Profile } from "./pages/Profile";
import { Timeline } from "./pages/Timeline";
import { Gallery } from "./pages/Gallery";
import { NarrativeDetail } from "./pages/NarrativeDetail";
import { AnimatePresence } from "framer-motion";
import { GrainOverlay } from "./components/ui/GrainOverlay";
import { SmoothScroll } from "./components/ui/SmoothScroll";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/directory/:id" element={<Profile />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/narratives/:id" element={<NarrativeDetail />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <SmoothScroll />
      <GrainOverlay />
      <AppLayout>
        <AnimatedRoutes />
      </AppLayout>
    </Router>
  );
}

export default App;
