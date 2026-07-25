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
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    ListItemSecondaryAction,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    ArrowBack as ArrowBackIcon,
    Smartphone as MobileIcon,
    DesktopMac as DesktopIcon,
    Image as ImageIcon,
    InsertDriveFile as FileIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DynamicPortfolioForm from '../components/DynamicPortfolioForm';
import UploadDialogComponent from '../../../shared/components/UploadDialogComponent';
import { usePortfolioStore } from '../store/portfolioStore';
import imageCompression from 'browser-image-compression';
import { getUploadUrls, uploadFileToR2 } from '../api/StudioportfolioService';

const ManageStudioPortfolioView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState<string | null>(null);

    // Global Store State
    const { htmlContent, setHtmlContent, portfolioData, setPortfolioData, uploadedImages, addUploadedImages, removeUploadedImage } = usePortfolioStore();

    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    // State for tabs
    const [activeTab, setActiveTab] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // State for resizer
    const [sidebarWidth, setSidebarWidth] = useState(500);
    const [isDragging, setIsDragging] = useState(false);

    // State for upload
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isProcessingFiles, setIsProcessingFiles] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
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

    useEffect(() => {
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [htmlContent]);

    const handleDataChange = (newData: any) => {
        setPortfolioData(newData);
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_DATA', data: newData }, '*');
        }
    };

    const processFiles = async (files: File[]) => {
        setIsProcessingFiles(true);
        setIsUploading(false);
        setUploadProgress(0);
        try {
            const processedImages = [];
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: "image/webp",
                initialQuality: 0.6,
            };

            for (const file of files) {
                let processedFile = file;
                let compressed = false;
                if (file.type.startsWith('image/')) {
                    processedFile = await imageCompression(file, options);
                    compressed = true;
                }
                const url = URL.createObjectURL(processedFile);
                processedImages.push({
                    id: Math.random().toString(36).substring(7),
                    file: processedFile,
                    url,
                    compressed
                });
            }
            
            setIsProcessingFiles(false);
            setIsUploading(true);

            // Upload processed files
            const folder = 'portfolio-assets';
            const fileUploadDetails = processedImages.map(pi => ({
                fileName: pi.file.name,
                contentType: pi.file.type
            }));

            const urlsResponse = await getUploadUrls({ folder, files: fileUploadDetails });
            
            const totalFiles = processedImages.length;
            let currentFileIndex = 0;

            for (let i = 0; i < processedImages.length; i++) {
                const pi = processedImages[i];
                // Match URL by index since Promise.all preserves order
                const urlInfo = urlsResponse[i];
                if (urlInfo) {
                    await uploadFileToR2({ key: urlInfo.key, uploadUrl: urlInfo.uploadUrl }, pi.file, (progress) => {
                        const baseProgress = (currentFileIndex / totalFiles) * 100;
                        const fileProgress = (progress / totalFiles);
                        setUploadProgress(Math.round(baseProgress + fileProgress));
                    });
                    // Assign fileKey from server to state
                    (pi as any).fileKey = urlInfo.key;
                }
                currentFileIndex++;
            }
            
            setUploadProgress(100);
            
            addUploadedImages(processedImages as any);
        } catch (err) {
            console.error("Error compressing/uploading files:", err);
            alert("Failed to process or upload some files.");
        } finally {
            setIsProcessingFiles(false);
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
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
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ color: '#fff' }}>Assets ({uploadedImages.length})</Typography>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<UploadIcon />}
                                    onClick={() => setIsUploadDialogOpen(true)}
                                    sx={{ 
                                        color: '#C084FC', 
                                        borderColor: '#C084FC',
                                        '&:hover': { borderColor: '#A855F7', bgcolor: 'rgba(192, 132, 252, 0.1)' }
                                    }}
                                >
                                    Upload
                                </Button>
                            </Box>

                            {isProcessingFiles && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#C084FC' }}>
                                    <CircularProgress size={20} sx={{ mr: 2, color: 'inherit' }} />
                                    <Typography variant="body2">Processing files...</Typography>
                                </Box>
                            )}

                            {isUploading && (
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>Uploading to cloud...</Typography>
                                        <Typography variant="body2" sx={{ color: '#C084FC', fontWeight: 'bold' }}>{uploadProgress}%</Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={uploadProgress} 
                                        sx={{ 
                                            height: 8, 
                                            borderRadius: 4, 
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            '& .MuiLinearProgress-bar': { bgcolor: '#C084FC' }
                                        }} 
                                    />
                                </Box>
                            )}

                            {uploadedImages.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                                    <ImageIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                                    <Typography variant="body1" sx={{ color: '#94A3B8' }}>No assets uploaded yet.</Typography>
                                </Box>
                            ) : (
                                <List sx={{ width: '100%', p: 0 }}>
                                    {uploadedImages.map((img) => (
                                        <ListItem 
                                            key={img.id} 
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.03)', 
                                                borderRadius: 2, 
                                                mb: 1.5,
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'transparent', width: 48, height: 48, mr: 2, borderRadius: 1 }}>
                                                    {img.file.type.startsWith('image/') ? (
                                                        <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <FileIcon sx={{ color: '#94A3B8' }} />
                                                    )}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={img.file.name}
                                                secondary={`${(img.file.size / 1024).toFixed(2)} KB ${img.compressed ? '(Compressed)' : ''}`}
                                                primaryTypographyProps={{ color: '#fff', noWrap: true }}
                                                secondaryTypographyProps={{ color: '#94A3B8' }}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" onClick={() => removeUploadedImage(img.id)} sx={{ color: '#ef4444' }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            <UploadDialogComponent 
                                open={isUploadDialogOpen}
                                onClose={() => setIsUploadDialogOpen(false)}
                                onUpload={processFiles}
                                multiple={true}
                                accept="image/*"
                            />
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

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
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

export default ManageStudioPortfolioView;
