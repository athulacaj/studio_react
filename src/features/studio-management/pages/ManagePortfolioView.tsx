import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Tabs,
    Tab,
    Alert,
    IconButton,
} from '@mui/material';
import { 
    CloudUpload as UploadIcon, 
    ArrowBack as ArrowBackIcon,
    Smartphone as MobileIcon,
    DesktopMac as DesktopIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DynamicPortfolioForm from '../components/DynamicPortfolioForm';

const ManagePortfolioView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState<string | null>(null);
    
    // State for the uploaded template
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    
    // State for tabs
    const [activeTab, setActiveTab] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // State for resizer
    const [sidebarWidth, setSidebarWidth] = useState(500);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!isDragging) return;
        
        const handleMouseMove = (e: MouseEvent) => {
            // Constrain width between 300px and window.innerWidth - 300px
            const newWidth = Math.min(Math.max(e.clientX, 300), window.innerWidth - 300);
            setSidebarWidth(newWidth);
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = event.target.files?.[0];
        if (!file) return;
        
        if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
            setError('Please upload a valid HTML file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                try {
                    // Try to extract portfolioData using regex
                    const match = content.match(/let\s+portfolioData\s*=\s*(\{[\s\S]*?\});/);
                    if (match && match[1]) {
                        // eslint-disable-next-line no-new-func
                        const parsedData = new Function('return ' + match[1])();
                        setPortfolioData(parsedData);
                        setHtmlContent(content);
                        setStep(2);
                    } else {
                        setError('Could not find portfolioData in the uploaded template. Make sure the file contains "let portfolioData = {...};".');
                    }
                } catch (err) {
                    console.error('Error parsing portfolioData:', err);
                    setError('Failed to parse portfolioData. It might contain syntax errors.');
                }
            }
        };
        reader.readAsText(file);
    };

    // Update blob URL when HTML content changes
    useEffect(() => {
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            
            return () => URL.revokeObjectURL(url);
        }
    }, [htmlContent]);

    // Send postMessage to iframe when portfolioData changes
    const handleDataChange = (newData: any) => {
        setPortfolioData(newData);
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_DATA', data: newData }, '*');
        }
    };

    if (step === 1) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#030912', pt: 8, pb: 4 }}>
                <Container maxWidth="sm">
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate('/private/studio')}
                        sx={{ color: '#94A3B8', mb: 4 }}
                    >
                        Back to Dashboard
                    </Button>
                    <Paper 
                        sx={{ 
                            p: 6, 
                            borderRadius: 4, 
                            bgcolor: 'rgba(15, 26, 46, 0.6)', 
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                            Upload Template
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4 }}>
                            Please upload your vanilla JS HTML template containing the portfolioData configuration.
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 4, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ffb4ab' }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<UploadIcon />}
                            size="large"
                            sx={{
                                borderRadius: '12px',
                                background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                                px: 4,
                                py: 1.5,
                            }}
                        >
                            Select HTML File
                            <input
                                type="file"
                                hidden
                                accept=".html,text/html"
                                onChange={handleFileUpload}
                            />
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#030912', overflow: 'hidden' }}>
            {/* Left Sidebar - Editor */}
            <Box 
                sx={{ 
                    width: sidebarWidth, 
                    flexShrink: 0,
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(15, 26, 46, 0.95)'
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button 
                            startIcon={<ArrowBackIcon />} 
                            onClick={() => setStep(1)}
                            sx={{ color: '#94A3B8', mr: 2 }}
                        >
                            Back
                        </Button>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Manage Portfolio
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                            onClick={() => setPreviewMode('desktop')}
                            sx={{ 
                                color: previewMode === 'desktop' ? '#C084FC' : '#64748B',
                                bgcolor: previewMode === 'desktop' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                                borderRadius: '8px'
                            }}
                        >
                            <DesktopIcon />
                        </IconButton>
                        <IconButton 
                            onClick={() => setPreviewMode('mobile')}
                            sx={{ 
                                color: previewMode === 'mobile' ? '#C084FC' : '#64748B',
                                bgcolor: previewMode === 'mobile' ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                                borderRadius: '8px'
                            }}
                        >
                            <MobileIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Tabs 
                    value={activeTab} 
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    sx={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        '& .MuiTab-root': { color: '#94A3B8', fontWeight: 600 },
                        '& .Mui-selected': { color: '#C084FC !important' },
                        '& .MuiTabs-indicator': { backgroundColor: '#C084FC' }
                    }}
                >
                    <Tab label="Content" />
                    <Tab label="Upload Assets" />
                    <Tab label="Settings" />
                </Tabs>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                    {activeTab === 0 && (
                        <DynamicPortfolioForm 
                            data={portfolioData} 
                            onChange={handleDataChange} 
                        />
                    )}
                    {activeTab === 1 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <UploadIcon sx={{ fontSize: 48, color: '#64748B', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#fff' }}>Upload Assets</Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>Asset management coming soon.</Typography>
                        </Box>
                    )}
                    {activeTab === 2 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" sx={{ color: '#fff' }}>Settings</Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>Portfolio settings coming soon.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Draggable Resizer */}
            <Box
                onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                sx={{
                    width: '4px',
                    cursor: 'col-resize',
                    bgcolor: isDragging ? '#C084FC' : 'rgba(255,255,255,0.05)',
                    zIndex: 10,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                        bgcolor: '#C084FC',
                    }
                }}
            />

            {/* Right Pane - Live Preview */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
                {/* Preview Content */}
                <Box sx={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', overflowY: 'hidden', p: previewMode === 'mobile' ? 2 : 0, pointerEvents: isDragging ? 'none' : 'auto' }}>
                    {blobUrl && (
                        <Box sx={{ 
                            height: previewMode === 'mobile' ? '95vh' : '100%',
                            width: previewMode === 'mobile' ? 'auto' : '100%',
                            minWidth: previewMode === 'mobile' ? '400px' : 'auto',
                            aspectRatio: previewMode === 'mobile' ? '375 / 812' : 'auto',
                            maxHeight: '100%',
                            bgcolor: '#fff',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: previewMode === 'mobile' ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
                            borderRadius: previewMode === 'mobile' ? '24px' : '0',
                            overflow: 'hidden',
                            border: previewMode === 'mobile' ? '8px solid #1e293b' : 'none',
                        }}>
                            <iframe
                                ref={iframeRef}
                                src={blobUrl}
                                title="Live Preview"
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ManagePortfolioView;
