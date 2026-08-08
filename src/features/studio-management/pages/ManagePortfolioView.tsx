import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    LinearProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
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
import { createWebsite, getUploadUrls, getWebsites, updateWebsite, uploadFileToR2, WebsitePath } from '../api/WebsiteService';
import { setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuthStore } from '../../auth/store/authStore';
import { getBusinessByUserId } from '../api/businessService';
import { useSearchParams } from "react-router-dom";

const ManageStudioPortfolioView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();

    const path = searchParams.get("path");
    const type = searchParams.get("type");

    // Global Store State
    const { htmlContent, setHtmlContent, portfolioData, setPortfolioData, uploadedImages,
        setUploadedImages, addUploadedImages, removeUploadedImage, businessData,
        setBusinessData, webSiteData, setWebsiteData } = usePortfolioStore();
    const { currentUser } = useAuthStore();

    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    const [versions, setVersions] = useState<{ path: string, publishedAt: string }[]>([]);
    const [selectedVersionPath, setSelectedVersionPath] = useState<string>('');

    // State for tabs
    const [activeTab, setActiveTab] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    function scrollToTheId(id: string) {
        // Normalize array notation (e.g. events[0]) to dot notation (events.0)
        const normalizedId = id.replace(/\[(\d+)\]/g, '.$1');
        const element = document.getElementById(normalizedId) || document.getElementById(id);

        if (element) {
            // Open any parent accordions that are closed
            let current = element.parentElement;
            let didOpenAccordion = false;

            while (current) {
                if (current.classList.contains('MuiAccordion-root') && !current.classList.contains('Mui-expanded')) {
                    const summary = current.querySelector('.MuiAccordionSummary-root') as HTMLElement;
                    if (summary) {
                        summary.click();
                        didOpenAccordion = true;
                    }
                }
                current = current.parentElement;
            }

            // Scroll to the element, adding a slight delay if we had to open an accordion
            // so the DOM has time to expand and layout correctly before calculating scroll position
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: highlight the element briefly
                const originalBg = element.style.backgroundColor;
                element.style.transition = 'background-color 0.5s ease';
                element.style.backgroundColor = 'rgba(192, 132, 252, 0.3)';
                setTimeout(() => {
                    element.style.backgroundColor = originalBg;
                }, 1500);
            }, didOpenAccordion ? 300 : 0);

        } else {
            console.warn(`Element with id "${id}" (normalized to "${normalizedId}") not found for scrolling.`);
        }
    }

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "ELEMENT_CLICKED") {
                console.log("Element clicked:", event.data);
                if (event.data.jsonPath) {
                    scrollToTheId(event.data.jsonPath);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    // State for resizer
    const [sidebarWidth, setSidebarWidth] = useState(500);
    const [isDragging, setIsDragging] = useState(false);

    // State for upload
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isProcessingFiles, setIsProcessingFiles] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);


    useEffect(() => {
        getBusinessByUserId(currentUser?.userId ?? '').then((res) => {
            const data = res.data.filter(e => e.typeId = 1)[0];
            setBusinessData(data)
        })
    }, [])

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

    const loadPortfolioFromPath = async (path: string, assetsToLoad?: any[]) => {
        try {
            setIsInitialLoading(true);
            const r2BaseUrl = import.meta.env.VITE_R2_BASEURL;
            const response = await fetch(`${r2BaseUrl}/${path}`);

            if (response.ok) {
                const htmlText = await response.text();
                setHtmlContent(htmlText);

                const match = htmlText.match(/let\s+websiteData\s*=\s*(\{[\s\S]*?\});/);
                if (match && match[1]) {

                    const parsedData = new Function('return ' + match[1])();
                    setPortfolioData(parsedData);
                }

                if (assetsToLoad && assetsToLoad.length > 0) {
                    setUploadedImages(assetsToLoad.map((asset: any) => ({
                        id: asset.id,
                        url: `${r2BaseUrl}/${asset.fileKey}`,
                        compressed: asset.compressed,
                        fileKey: asset.fileKey,
                        file: new File([], asset.fileName || "asset", { type: asset.contentType || "image/webp" })
                    })));
                } else {
                    setUploadedImages([]);
                }

                setStep(2);
            }
        } catch (error) {
            console.error("Error fetching portfolio HTML:", error);
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        const fetchPortfolio = async (businessId: number) => {
            const websiteData = await getWebsites({
                businessId: businessId,
                path: path!
            });
            const data = websiteData.data.filter((e: any) => e.path === path)[0];
            if (data) {
                setWebsiteData(data)
                if (data.currentPath) {
                    setSelectedVersionPath(data.currentPath);
                    await loadPortfolioFromPath(data.currentPath, data.assets);
                }
                setVersions(data.versions);
            }
            setIsInitialLoading(false);
        };
        if (businessData?.id) {
            fetchPortfolio(businessData.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessData]);

    async function createWebsiteHandler(urlInfo: any, versions: any = []) {
        const updatedWebsiteData = await createWebsite({
            businessId: businessData!.id,
            projectId: null,
            path: path!,
            assets: [],
            currentPath: urlInfo?.key,
            versions: []
        })
        setWebsiteData(updatedWebsiteData.data);
    }

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
                    const match = content.match(/let\s+websiteData\s*=\s*(\{[\s\S]*?\});/);
                    if (match && match[1]) {

                        const parsedData = new Function('return ' + match[1])();
                        setPortfolioData(parsedData);
                        setHtmlContent(content);
                        setStep(2);
                        if (!webSiteData) {
                            createWebsiteHandler({})
                        }
                    } else {
                        setError('Could not find websiteData in the uploaded template. Make sure the file contains "let websiteData = {...};".');
                    }
                } catch (err) {
                    console.error('Error parsing websiteData:', err);
                    setError('Failed to parse websiteData. It might contain syntax errors.');
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

    // Debounce ref to avoid hammering the iframe with postMessages on rapid changes
    const iframeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleDataChange = useCallback((newData: any) => {
        setPortfolioData(newData);
        if (iframeDebounceRef.current) clearTimeout(iframeDebounceRef.current);
        iframeDebounceRef.current = setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_DATA', data: newData }, '*');
            }
        }, 100);
    }, []);

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

            if (currentUser) {
                const updatedImages = [...uploadedImages, ...processedImages];
                const assetsMetadata = updatedImages.map(img => ({
                    id: img.id,
                    fileKey: (img as any).fileKey || img.fileKey,
                    compressed: img.compressed,
                    fileName: img.file?.name || 'asset',
                    contentType: img.file?.type || 'image/webp'
                }));
                const updatedWebsiteData = await updateWebsite(webSiteData!.id, {
                    assets: assetsMetadata
                })
                setWebsiteData(updatedWebsiteData.data)
            }
        } catch (err) {
            console.error("Error compressing/uploading files:", err);
            alert("Failed to process or upload some files.");
        } finally {
            setIsProcessingFiles(false);
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleRemoveAsset = async (id: string) => {
        removeUploadedImage(id);

        if (currentUser) {
            const updatedImages = uploadedImages.filter(img => img.id !== id);
            const assetsMetadata = updatedImages.map(img => ({
                id: img.id,
                fileKey: img.fileKey,
                compressed: img.compressed,
                fileName: img.file?.name || 'asset',
                contentType: img.file?.type || 'image/webp'
            }));

            const updatedWebsiteData = await updateWebsite(webSiteData!.id, {
                assets: assetsMetadata
            })
            setWebsiteData(updatedWebsiteData.data)
        }
    };

    const handlePublish = async (businessId: number | undefined) => {
        if (!currentUser || !businessId) {
            console.error("User or businessId or pathData is not defined");
            return;
        };
        setIsPublishing(true);
        try {
            const updatedHtml = htmlContent.replace(
                /let\s+websiteData\s*=\s*\{[\s\S]*?\};/,
                `let websiteData = ${JSON.stringify(portfolioData, null, 2)};`
            );

            const file = new File([updatedHtml], "index.html", { type: "text/html" });

            const urlsResponse = await getUploadUrls({
                folder: 'portfolios',
                files: [{ fileName: 'index.html', contentType: 'text/html' }]
            });

            const urlInfo = urlsResponse[0];
            if (urlInfo) {
                await uploadFileToR2({ key: urlInfo.key, uploadUrl: urlInfo.uploadUrl }, file);


                const assetsMetadata = uploadedImages.map(img => ({
                    id: img.id,
                    fileKey: img.fileKey,
                    compressed: img.compressed,
                    fileName: img.file?.name || 'asset',
                    contentType: img.file?.type || 'image/webp'
                }));

                const versionData = {
                    path: urlInfo.key,
                    publishedAt: new Date().toISOString()
                };

                let updatedWebsiteData;
                if (webSiteData) {
                    updatedWebsiteData = await updateWebsite(webSiteData.id, {
                        businessId: businessId,
                        path: path!,
                        currentPath: urlInfo.key,
                        versions: [...webSiteData.versions, versionData]
                    })
                    setWebsiteData(updatedWebsiteData.data);

                } else {
                    updatedWebsiteData = await createWebsite({
                        businessId: businessId,
                        projectId: null,
                        path: path!,
                        assets: assetsMetadata,
                        currentPath: urlInfo.key,
                        r2BaseUrl: import.meta.env.VITE_R2_BASEURL,
                        versions: [versionData]
                    })

                }
                setVersions(prev => [...prev, versionData]);
                setWebsiteData(updatedWebsiteData.data);

                setSelectedVersionPath(urlInfo.key);
                alert('Portfolio published successfully!');
            }
        } catch (err) {
            console.error("Error publishing portfolio:", err);
            alert('Failed to publish portfolio.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleVersionChange = async (event: any) => {
        const path = event.target.value;
        setSelectedVersionPath(path);
        await loadPortfolioFromPath(path);
    };

    if (!path) {
        return (
            <Box>
                Error no path is provided
            </Box>
        );
    }

    if (isInitialLoading) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#030912', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#C084FC' }} />
            </Box>
        );
    }

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
                            onClick={() => {
                                if (businessData == null) {
                                    setStep(1)
                                } else {
                                    navigate('/private/studio', { replace: true })
                                }
                            }}
                            sx={{ color: '#94A3B8', mr: 2 }}
                        >
                            Back
                        </Button>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            Manage Portfolio 1
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
                                                    {img.file?.type.startsWith('image/') || img.url.endsWith('.webp') ? (
                                                        <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <FileIcon sx={{ color: '#94A3B8' }} />
                                                    )}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={img.file?.name || 'Uploaded Asset'}
                                                secondary={`${img.file && img.file.size > 0 ? (img.file.size / 1024).toFixed(2) + ' KB ' : ''}${img.compressed ? '(Compressed)' : ''}`}
                                                primaryTypographyProps={{ color: '#fff', noWrap: true }}
                                                secondaryTypographyProps={{ color: '#94A3B8' }}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" onClick={() => handleRemoveAsset(img.id)} sx={{ color: '#ef4444' }}>
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Publish Card */}
                            <Paper sx={{
                                p: 4,
                                borderRadius: 4,
                                bgcolor: 'rgba(124, 58, 237, 0.05)',
                                border: '1px solid rgba(124, 58, 237, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 150,
                                    height: 150,
                                    bgcolor: 'rgba(124, 58, 237, 0.1)',
                                    borderRadius: '50%',
                                    filter: 'blur(40px)',
                                    pointerEvents: 'none'
                                }} />

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.2)', color: '#C084FC', mr: 2 }}>
                                        <UploadIcon />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>Publish Portfolio</Typography>
                                </Box>

                                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.6, maxWidth: '90%' }}>
                                    Make your portfolio live and accessible to the world. Publishing will securely save your current configuration, images, and layout, generating a new snapshot in your version history.
                                </Typography>

                                <Button
                                    variant="contained"
                                    onClick={() => handlePublish(businessData?.id)}
                                    disabled={isPublishing}
                                    startIcon={isPublishing ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 600,
                                        boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 20px rgba(124, 58, 237, 0.4)',
                                        },
                                        '&.Mui-disabled': {
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#64748B',
                                            boxShadow: 'none'
                                        }
                                    }}
                                >
                                    {isPublishing ? 'Publishing...' : 'Publish Now'}
                                </Button>
                            </Paper>

                            {/* Version History Card */}
                            {versions.length > 0 && (
                                <Paper sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(15, 26, 46, 0.6)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A3B8', mr: 2 }}>
                                            <FileIcon />
                                        </Avatar>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>Version History</Typography>
                                    </Box>

                                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.6 }}>
                                        Easily roll back to previous versions of your portfolio. Selecting a past version will instantly load its layout and configuration into the editor.
                                    </Typography>

                                    <FormControl fullWidth variant="outlined" sx={{
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s ease',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#64748B' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#C084FC' },
                                        '& .MuiSvgIcon-root': { color: '#94A3B8' }
                                    }}>
                                        <InputLabel id="version-select-label">Load Version</InputLabel>
                                        <Select
                                            labelId="version-select-label"
                                            value={selectedVersionPath}
                                            onChange={handleVersionChange}
                                            label="Load Version"
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        bgcolor: '#0f172a',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        '& .MuiMenuItem-root': {
                                                            color: '#e2e8f0',
                                                            '&:hover': { bgcolor: 'rgba(192,132,252,0.1)' },
                                                            '&.Mui-selected': { bgcolor: 'rgba(192,132,252,0.2)', color: '#C084FC' },
                                                            '&.Mui-selected:hover': { bgcolor: 'rgba(192,132,252,0.3)' }
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            {versions.map((v, index) => {
                                                const d = new Date(v.publishedAt);
                                                const day = String(d.getDate()).padStart(2, '0');
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const year = String(d.getFullYear()).slice(-2);

                                                return (
                                                    <MenuItem key={v.path} value={v.path} sx={{ py: 1.5 }}>
                                                        {`${index + 1} - ${day}/${month}/${year}`}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Paper>
                            )}
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
