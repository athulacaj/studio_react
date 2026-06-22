import React from 'react';
import { Snackbar, Alert, alpha, useTheme, Slide } from '@mui/material';
import { SlideProps } from '@mui/material/Slide';
import { useToastStore } from '../hooks/useToastStore';
import { CheckCircleOutline, InfoOutlined, WarningAmber, ErrorOutline } from '@mui/icons-material';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const GlobalToast: React.FC = () => {
  const { open, message, severity, hideToast } = useToastStore();
  const theme = useTheme();

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideToast();
  };

  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleOutline />;
      case 'warning':
        return <WarningAmber />;
      case 'error':
        return <ErrorOutline />;
      case 'info':
      default:
        return <InfoOutlined />;
    }
  };

  const getColor = () => {
    switch (severity) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{
        bottom: { xs: 24, sm: 32 },
      }}
    >
      <Alert
        onClose={handleClose}
        icon={getIcon()}
        severity={severity}
        sx={{
          width: '100%',
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: alpha(getColor(), 0.3),
          boxShadow: `0 8px 32px ${alpha(getColor(), 0.15)}`,
          color: theme.palette.text.primary,
          borderRadius: '16px',
          fontWeight: 500,
          '& .MuiAlert-icon': {
            color: getColor(),
            alignItems: 'center',
            padding: 0,
            marginRight: 1.5,
          },
          '& .MuiAlert-message': {
            padding: '8px 0',
          },
          '& .MuiAlert-action': {
            paddingTop: 0,
            alignItems: 'center',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalToast;
