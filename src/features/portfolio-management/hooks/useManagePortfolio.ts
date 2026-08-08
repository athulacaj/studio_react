import React, { useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

import { useSidebarResizer } from './useSidebarResizer';
import { usePortfolioIframe } from './usePortfolioIframe';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../../auth/store/authStore';
import { createWebsite, getUploadUrls, getWebsites, getWebsiteTemplatesByType, updateWebsite, uploadFileToR2, WebsiteTemplate } from '../api/WebsiteService';
import { getBusinessByUserId } from '../../studio-management/api/businessService';




export const useManagePortfolio = (iframeRef: React.RefObject<HTMLIFrameElement | null>) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const path = searchParams.get('path');
    const type = searchParams.get('type')
    const title = searchParams.get("title") ?? ''

    // Global Store State & Setters
    const {
        htmlContent, setHtmlContent,
        portfolioData, setPortfolioData,
        uploadedImages, setUploadedImages, addUploadedImages, removeUploadedImage,
        businessData, setBusinessData,
        webSiteData, setWebsiteData,
        step, setStep,
        error, setError,
        previewMode, setPreviewMode,
        activeTab, setActiveTab,
        isInitialLoading, setIsInitialLoading,
        isPublishing, setIsPublishing,
        versions, setVersions,
        selectedVersionPath, setSelectedVersionPath,
        isUploadDialogOpen, setIsUploadDialogOpen,
        isProcessingFiles, setIsProcessingFiles,
        isUploading, setIsUploading,
        uploadProgress, setUploadProgress,
        templatesDataList, setTemplatesData, resetStep,
    } = usePortfolioStore();

    const { currentUser } = useAuthStore();

    // Custom Hooks
    const { sidebarWidth, isDragging, handleMouseDown } = useSidebarResizer(500, 300);
    const { blobUrl, handleDataChange } = usePortfolioIframe(htmlContent, iframeRef, setPortfolioData);


    useEffect(() => {
        return () => {
            resetStep();
        }
    }, [])

    // Fetch initial business details
    useEffect(() => {
        if (currentUser?.userId) {
            getBusinessByUserId(currentUser.userId).then((res) => {
                const data = res.data.filter((e) => (e.typeId = 1))[0];
                setBusinessData(data);
            });
        }
    }, [currentUser?.userId, setBusinessData]);

    // Fetch website and load portfolio data
    useEffect(() => {
        const fetchPortfolio = async (businessId: number) => {
            if (!path) return;
            const websiteData = await getWebsites({ businessId, path });
            const data = websiteData.data.filter((e: any) => e.path === path)[0];
            if (data) {
                setWebsiteData(data);
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
    }, [businessData, path]);

    const loadPortfolioFromPath = async (pathUrl: string, assetsToLoad?: any[]) => {
        try {
            setIsInitialLoading(true);
            const r2BaseUrl = import.meta.env.VITE_R2_BASEURL;
            const response = await fetch(`${r2BaseUrl}/${pathUrl}`);

            if (response.ok) {
                const htmlText = await response.text();
                setHtmlContent(htmlText);

                const match = htmlText.match(/let\s+websiteData\s*=\s*(\{[\s\S]*?\});/);
                if (match && match[1]) {
                    const parsedData = new Function('return ' + match[1])();
                    setPortfolioData(parsedData);
                }

                if (assetsToLoad && assetsToLoad.length > 0) {
                    setUploadedImages(
                        assetsToLoad.map((asset: any) => ({
                            id: asset.id,
                            url: `${r2BaseUrl}/${asset.fileKey}`,
                            compressed: asset.compressed,
                            fileKey: asset.fileKey,
                            file: new File([], asset.fileName || 'asset', { type: asset.contentType || 'image/webp' })
                        }))
                    );
                } else {
                    setUploadedImages([]);
                }

                setStep(2);
            }
        } catch (err) {
            console.error('Error fetching portfolio HTML:', err);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const createWebsiteHandler = async (urlInfo: any) => {
        if (!businessData?.id || !path) return;
        const updatedWebsiteData = await createWebsite({
            businessId: businessData.id,
            projectId: null,
            path: path,
            assets: [],
            currentPath: urlInfo?.key,
            versions: []
        });
        setWebsiteData(updatedWebsiteData.data);
    };

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
                            createWebsiteHandler({});
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

    const handleSelectTemplate = async (template: WebsiteTemplate) => {
        setError(null);
        setIsInitialLoading(true);
        try {
            const rawUrl = template.url;
            const templateFileUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
                ? rawUrl
                : `${import.meta.env.VITE_R2_BASEURL}/${rawUrl}`;

            const response = await fetch(templateFileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch template content (HTTP ${response.status})`);
            }
            const content = await response.text();
            if (content) {
                const match = content.match(/let\s+websiteData\s*=\s*(\{[\s\S]*?\});/);
                if (match && match[1]) {
                    const parsedData = new Function('return ' + match[1])();
                    setPortfolioData(parsedData);
                    setHtmlContent(content);
                    setStep(2);
                    if (!webSiteData) {
                        await createWebsiteHandler({});
                    }
                } else {
                    setError('Could not find websiteData in the selected template. Make sure it contains "let websiteData = {...};".');
                }
            }
        } catch (err: any) {
            console.error('Error loading template:', err);
            setError(err.message || 'Failed to load selected template.');
        } finally {
            setIsInitialLoading(false);
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
                fileType: 'image/webp',
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

            const folder = 'portfolio-assets';
            const fileUploadDetails = processedImages.map((pi) => ({
                fileName: pi.file.name,
                contentType: pi.file.type
            }));

            const urlsResponse = await getUploadUrls({ folder, files: fileUploadDetails });

            const totalFiles = processedImages.length;
            let currentFileIndex = 0;

            for (let i = 0; i < processedImages.length; i++) {
                const pi = processedImages[i];
                const urlInfo = urlsResponse[i];
                if (urlInfo) {
                    await uploadFileToR2({ key: urlInfo.key, uploadUrl: urlInfo.uploadUrl }, pi.file, (progress) => {
                        const baseProgress = (currentFileIndex / totalFiles) * 100;
                        const fileProgress = progress / totalFiles;
                        setUploadProgress(Math.round(baseProgress + fileProgress));
                    });
                    (pi as any).fileKey = urlInfo.key;
                }
                currentFileIndex++;
            }

            setUploadProgress(100);
            addUploadedImages(processedImages as any);

            if (currentUser) {
                const updatedImages = [...uploadedImages, ...processedImages];
                const assetsMetadata = updatedImages.map((img) => ({
                    id: img.id,
                    fileKey: (img as any).fileKey || img.fileKey,
                    compressed: img.compressed,
                    fileName: img.file?.name || 'asset',
                    contentType: img.file?.type || 'image/webp'
                }));
                const updatedWebsiteData = await updateWebsite(webSiteData!.id, {
                    assets: assetsMetadata
                });
                setWebsiteData(updatedWebsiteData.data);
            }
        } catch (err) {
            console.error('Error compressing/uploading files:', err);
            alert('Failed to process or upload some files.');
        } finally {
            setIsProcessingFiles(false);
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleRemoveAsset = async (id: string) => {
        removeUploadedImage(id);

        if (currentUser && webSiteData) {
            const updatedImages = uploadedImages.filter((img) => img.id !== id);
            const assetsMetadata = updatedImages.map((img) => ({
                id: img.id,
                fileKey: img.fileKey,
                compressed: img.compressed,
                fileName: img.file?.name || 'asset',
                contentType: img.file?.type || 'image/webp'
            }));

            const updatedWebsiteData = await updateWebsite(webSiteData.id, {
                assets: assetsMetadata
            });
            setWebsiteData(updatedWebsiteData.data);
        }
    };

    const handlePublish = async () => {
        const businessId = businessData?.id;
        if (!currentUser || !businessId || !path) {
            console.error('User or businessId or path is not defined');
            return;
        }
        setIsPublishing(true);
        try {
            const updatedHtml = htmlContent.replace(
                /let\s+websiteData\s*=\s*\{[\s\S]*?\};/,
                `let websiteData = ${JSON.stringify(portfolioData, null, 2)};`
            );

            const file = new File([updatedHtml], 'index.html', { type: 'text/html' });

            const urlsResponse = await getUploadUrls({
                folder: 'portfolios',
                files: [{ fileName: 'index.html', contentType: 'text/html' }]
            });

            const urlInfo = urlsResponse[0];
            if (urlInfo) {
                await uploadFileToR2({ key: urlInfo.key, uploadUrl: urlInfo.uploadUrl }, file);

                const assetsMetadata = uploadedImages.map((img) => ({
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
                        businessId,
                        path,
                        currentPath: urlInfo.key,
                        versions: [...webSiteData.versions, versionData]
                    });
                } else {
                    updatedWebsiteData = await createWebsite({
                        businessId,
                        projectId: null,
                        path,
                        assets: assetsMetadata,
                        currentPath: urlInfo.key,
                        r2BaseUrl: import.meta.env.VITE_R2_BASEURL,
                        versions: [versionData]
                    });
                }

                setVersions((prev) => [...prev, versionData]);
                setWebsiteData(updatedWebsiteData.data);
                setSelectedVersionPath(urlInfo.key);
                alert('Portfolio published successfully!');
            }
        } catch (err) {
            console.error('Error publishing portfolio:', err);
            alert('Failed to publish portfolio.');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleVersionChange = async (event: SelectChangeEvent<string>) => {
        const versionPath = event.target.value;
        setSelectedVersionPath(versionPath);
        await loadPortfolioFromPath(versionPath);
    };

    const handleBack = () => {
        // if (businessData == null) {
        //     setStep(1);
        // } else {
        //     navigate(-1);
        // }
        navigate(-1);

    };

    const getTemplates = async () => {
        if (type) {
            const response = await getWebsiteTemplatesByType(type);
            setTemplatesData(response);
        } else {
            setTemplatesData([])
        }
    }
    useEffect(() => {
        getTemplates();
    }, [])

    return {
        path,
        step, setStep,
        error, setError,
        previewMode, setPreviewMode,
        activeTab, setActiveTab,
        isInitialLoading,
        isPublishing,
        versions,
        selectedVersionPath,
        isUploadDialogOpen, setIsUploadDialogOpen,
        isProcessingFiles,
        isUploading,
        uploadProgress,
        htmlContent,
        portfolioData,
        uploadedImages,
        businessData,
        webSiteData,
        sidebarWidth,
        isDragging,
        handleMouseDown,
        blobUrl,
        iframeRef,
        handleDataChange,
        handleFileUpload,
        handleSelectTemplate,
        templatesDataList,
        processFiles,
        handleRemoveAsset,
        handlePublish,
        handleVersionChange,
        handleBack,
        navigate,
        title,
    };
};
