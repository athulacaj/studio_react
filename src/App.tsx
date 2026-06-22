import { createTheme, ThemeProvider, CssBaseline, Backdrop, CircularProgress } from '@mui/material';
import AppRouter from './router';


const mizhivTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9D4EDD',
      light: '#C084FC',
      dark: '#7C3AED',
    },
    secondary: {
      main: '#A855F7',
      light: '#C084FC',
      dark: '#7C3AED',
    },
    background: {
      default: '#030912',
      paper: '#0F1A2E',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#38BDF8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Sora", "Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700, lineHeight: 1.1 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
          boxShadow: '0 0 20px rgba(157, 78, 221, 0.25)',
          '&:hover': {
            background: 'linear-gradient(90deg, #6D28D9 0%, #9D4EDD 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 0 40px rgba(157, 78, 221, 0.35)',
          },
        },
        outlined: {
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.08)',
          '&:hover': {
            background: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(157, 78, 221, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          background: 'rgba(15, 26, 46, 0.72)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
  },
});



import { PortfolioBuilderProvider } from './features/portfoliobuilder';
import { AuthProvider } from './features/auth';
import './features/studio-management/store/studioManagementStore';
import './features/auth/store/userStore';
import { useGlobalLoader } from './core/context/globalLoader';
import GlobalToast from './shared/components/GlobalToast';

function App() {
  const { isLoading } = useGlobalLoader();
  return (
    <ThemeProvider theme={mizhivTheme}>
      <CssBaseline />
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
            <GlobalToast />
          </>
        </AuthProvider>
      </PortfolioBuilderProvider>
    </ThemeProvider>
  );
}

export default App;

