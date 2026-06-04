import { Box } from '@mui/material';
import { Routes, Route, useLocation } from 'react-router-dom';
import PhotoProofingPage from './features/photoproofing';
import About from './pages/About';
import NotFound from './pages/NotFound';
import { PortfolioBuilderPage, PortfolioViewerPage } from './features/portfoliobuilder';
import { LoginPage, SignupPage, ProtectedRoute } from './features/auth';
import { StudioDashboard, PublicProjectView } from './features/studio-management';
import Footer from './core/components/Footer';

const AppRouter = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<PhotoProofingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/private" element={<ProtectedRoute />}>
            <Route path="portfolio-builder" element={<PortfolioBuilderPage />} />
            <Route path="studio" element={<StudioDashboard />} />
          </Route>

          <Route path="/portfolio/:domain" element={<PortfolioViewerPage />} />
          <Route path="/view/:userId/:projectId" element={<PublicProjectView />} />
          <Route path="/share/:userId/:projectId/:linkId" element={<PublicProjectView />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      {!location.pathname.includes('/portfolio') && <Footer />}
    </Box>
  );
};

export default AppRouter;
