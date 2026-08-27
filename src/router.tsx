import { Box } from '@mui/material';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import About from './pages/About';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import VividView from './pages/VividView';
import { LoginPage, SignupPage, ProtectedRoute } from './features/auth';
import { StudioDashboard, ProjectDetailView, PublicProjectView } from './features/studio-management';
import { SuperAdminDashboard, AdminUserView, AdminProjectDetailWrapper } from './features/user-management';
import { ManageStudioPortfolioViewProvider } from './features/portfolio-management';
import Footer from './core/components/Footer';
import GlobalNavbar from './core/components/GlobalNavbar';
import { DriveConnectPage, DriveSuccessPage } from './features/drive-integration';
import AdminUserWrapper from './features/auth/components/AdminUserWrapper';

const AppRouter = () => {
  const location = useLocation();
  // const isPublicRoute = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/about' || location.pathname.includes('/portfolio') || location.pathname.includes('/p/');



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/private" element={<ProtectedRoute />}>
            <Route path="admin" element={<SuperAdminDashboard />} />
            <Route path="studio/:userId" element={<AdminUserWrapper />}>
              <Route path="studio" element={<StudioDashboard />} />
              <Route path="studio/:projectId" element={<AdminProjectDetailWrapper />} />
              <Route index element={<AdminUserView />} />
              <Route path="studio/portfolio/manage" element={<ManageStudioPortfolioViewProvider />} />
            </Route>
          </Route>


          <Route path="/drive/connect/:userId/:projectId" element={<DriveConnectPage />} />
          <Route path="/drive/success" element={<DriveSuccessPage />} />
          <Route path="/view/vivid/vivid" element={<VividView />} />
          <Route path="/view/:userId/:projectId" element={<PublicProjectView />} />
          <Route path="/share/:linkId" element={<PublicProjectView />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      {!location.pathname.includes('/portfolio') && !location.pathname.includes('/view/vivid/vivid') && <Footer />}
    </Box>
  );
};

export default AppRouter;
