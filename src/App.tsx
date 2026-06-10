import { createTheme, ThemeProvider, CssBaseline, Backdrop, CircularProgress } from '@mui/material';
import AppRouter from './router';


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
import { PortfolioBuilderProvider } from './features/portfoliobuilder';
import { AuthProvider } from './features/auth';
import './features/studio-management/store/studioManagementStore';
import './features/auth/store/userStore';
import { useGlobalLoader } from './core/context/globalLoader';

function App() {
  const { isLoading } = useGlobalLoader();
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <PhotoProofingProvider>
        <PortfolioBuilderProvider>
          <AuthProvider>
            <>

              <AppRouter />
              <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.tooltip + 1 }}
                open={isLoading}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            </>
          </AuthProvider>
        </PortfolioBuilderProvider>
      </PhotoProofingProvider>
    </ThemeProvider>
  );
}

export default App;

