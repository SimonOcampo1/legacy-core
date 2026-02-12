import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Home } from "./pages/Home";
import { Directory } from "./pages/Directory";
import { Profile } from "./pages/Profile";
import { Timeline } from "./pages/Timeline";
import { Gallery } from "./pages/Gallery";
import { NarrativeDetail } from "./pages/NarrativeDetail";
import { SharedNarratives } from "./pages/SharedNarratives";
import { AdminConsole } from "./pages/AdminConsole";
import { AnimatePresence } from "framer-motion";
import { GrainOverlay } from "./components/ui/GrainOverlay";
import { SmoothScroll } from "./components/ui/SmoothScroll";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

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
        <Route path="/narratives" element={<SharedNarratives />} />
        <Route path="/narratives/:id" element={<NarrativeDetail />} />

        {/* Standalone Pages */}

        {/* Auth callback handled by session persistence in Context */}

        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<AdminConsole />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <SmoothScroll />
      <GrainOverlay />
      <AuthProvider>
        <AppLayout>
          <AnimatedRoutes />
          <Toaster position="top-center" />
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
