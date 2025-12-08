import React from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import { Routes, Route, useLocation } from 'react-router-dom';
import PhotoProofingPage from './features/photoproofing';
import About from './pages/About';
import NotFound from './pages/NotFound';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo 500
    },
    secondary: {
      main: '#a855f7', // Purple 500
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});


import { PhotoProofingProvider } from './features/photoproofing';
import { PortfolioBuilderProvider, PortfolioBuilderPage, PortfolioViewerPage } from './features/portfoliobuilder';
import { AuthProvider, LoginPage, SignupPage, ProtectedRoute } from './features/auth';
import { StudioManagementProvider, StudioDashboard, PublicProjectView } from './features/studio-management';
import Footer from './core/components/Footer';

const AppContent = () => {
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
      {
        !location.pathname.includes('/portfolio') && (
          <Footer />
        )
      }
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <PhotoProofingProvider>
        <PortfolioBuilderProvider>
          <AuthProvider>
            <StudioManagementProvider>
              <AppContent />
            </StudioManagementProvider>
          </AuthProvider>
        </PortfolioBuilderProvider>
      </PhotoProofingProvider>
    </ThemeProvider>
  );
}

export default App;

