import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import { injectDataIntoTemplate, createBlobUrl, revokeBlobUrl, isValidTemplate } from '../utils/templateUtils';

/**
 * HtmlTemplateRenderer Component
 * 
 * Safely renders HTML templates with injected portfolio data using an iframe.
 * The iframe provides isolation from the main application while allowing the template
 * to execute its own JavaScript with the injected portfolio data.
 * 
 * @param {string} htmlContent - The HTML template content
 * @param {object} portfolioData - The portfolio data to inject into the template
 */
const HtmlTemplateRenderer = ({ htmlContent, portfolioData }) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef(null);
    const previousBlobUrl = useRef(null);

    useEffect(() => {
        const processTemplate = async () => {
            setError(null);

            try {
                // Validate the HTML content
                if (!isValidTemplate(htmlContent)) {
                    throw new Error('Invalid template format');
                }

                // Inject the portfolio data into the template
                const htmlContentWithInjectedData = injectDataIntoTemplate(htmlContent, portfolioData);

                // Clean up previous blob URL if it exists
                if (previousBlobUrl.current) {
                    revokeBlobUrl(previousBlobUrl.current);
                }

                // Create a new blob URL for the iframe
                const newBlobUrl = createBlobUrl(htmlContentWithInjectedData);
                setBlobUrl(newBlobUrl);
                previousBlobUrl.current = newBlobUrl;
                setLoading(true);

            } catch (err) {
                console.error('Error processing template:', err);
                setError(err.message || 'Failed to render template');
            } finally {
                setLoading(false);
            }
        };

        if (htmlContent && portfolioData) {
            processTemplate();
        }

        // Cleanup function to revoke blob URL when component unmounts
        return () => {
            if (previousBlobUrl.current) {
                revokeBlobUrl(previousBlobUrl.current);
            }
        };
    }, [htmlContent, portfolioData]);

    // Handle iframe load event
    const handleIframeLoad = () => {
        setLoading(false);
    };

    if (error) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #450a0a 100%)',
                    p: 4
                }}
            >
                <Alert
                    severity="error"
                    icon={<AlertCircle size={24} />}
                    sx={{
                        maxWidth: 600,
                        background: 'rgba(30, 41, 59, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f8fafc',
                        '& .MuiAlert-icon': {
                            color: '#ef4444'
                        }
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Template Rendering Error
                    </Typography>
                    <Typography variant="body2">
                        {error}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
                        Please try refreshing the page or contact support if the issue persists.
                    </Typography>
                </Alert>
            </Box>
        );
    }

    if (loading || !blobUrl) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
                    gap: 3
                }}
            >
                <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{
                        color: '#6366f1'
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                        color: '#f8fafc',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Loading Portfolio Template...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <iframe
                ref={iframeRef}
                src={blobUrl}
                onLoad={handleIframeLoad}

                title="Portfolio Template"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"

                loading="eager"
            />
        </Box>
    );
};

export default HtmlTemplateRenderer;
