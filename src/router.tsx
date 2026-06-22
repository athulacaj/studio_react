import { Box } from '@mui/material';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import About from './pages/About';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { PortfolioBuilderPage, PortfolioViewerPage } from './features/portfoliobuilder';
import { LoginPage, SignupPage, ProtectedRoute } from './features/auth';
import { StudioDashboard, ProjectDetailView, PublicProjectView, SuperAdminDashboard, AdminUserView, AdminProjectDetailWrapper } from './features/studio-management';
import Footer from './core/components/Footer';
import GlobalNavbar from './core/components/GlobalNavbar';

const AppRouter = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/about' || location.pathname.includes('/portfolio');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/private" element={<ProtectedRoute />}>
            <Route path="portfolio-builder" element={<PortfolioBuilderPage />} />
            <Route path="studio" element={<StudioDashboard />} />
            <Route path="studio/:projectId" element={<ProjectDetailView />} />
            <Route path="admin" element={<SuperAdminDashboard />} />
            <Route path="admin/user/:userId" element={<AdminUserView />} />
            <Route path="admin/user/:userId/studio/:projectId" element={<AdminProjectDetailWrapper />} />
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
