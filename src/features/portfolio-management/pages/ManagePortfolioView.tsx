import React, { useRef } from 'react';
import { Box, CircularProgress, Tabs, Tab } from '@mui/material';

import DynamicPortfolioForm from '../components/DynamicPortfolioForm';
import UploadTemplateStep from '../components/UploadTemplateStep';
import ManagePortfolioHeader from '../components/ManagePortfolioHeader';
import AssetsTabContent from '../components/AssetsTabContent';
import SettingsTabContent from '../components/SettingsTabContent';
import PortfolioPreview from '../components/PortfolioPreview';

import { useManagePortfolio } from '../hooks/useManagePortfolio';
import { PortfolioContext, usePortfolioContext } from '../context/portfolioGlobalContext';

const ManageStudioPortfolioView: React.FC = () => {
    const { managePortfolioController } = usePortfolioContext();

    const {
        path,
        step,
        error,
        activeTab,
        setActiveTab,
        isInitialLoading,
        sidebarWidth,
        isDragging,
        handleMouseDown,
        handleFileUpload,
        handleSelectTemplate,
        navigate } = managePortfolioController;

    if (!path) {
        return <Box sx={{ p: 4, color: '#fff' }}>Error: No path is provided.</Box>;
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
            <UploadTemplateStep
                error={error}
                onNavigateBack={() => navigate(-1)}
                onFileUpload={handleFileUpload}
                onSelectTemplate={handleSelectTemplate}
            />
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#030912', overflow: 'hidden' }}>
            {/* Sidebar */}
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
                <ManagePortfolioHeader />

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
                        <DynamicPortfolioForm />
                    )}
                    {activeTab === 1 && (
                        <AssetsTabContent />
                    )}
                    {activeTab === 2 && (
                        <SettingsTabContent />
                    )}
                </Box>
            </Box>

            {/* Splitter Resizer Bar */}
            <Box
                onMouseDown={handleMouseDown}
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

            {/* Main Live Preview Area */}
            <PortfolioPreview />
        </Box>

    );
};

function ManageStudioPortfolioViewProvider() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const managePortfolioController = useManagePortfolio(iframeRef);
    return <PortfolioContext.Provider value={{ managePortfolioController }}>
        <ManageStudioPortfolioView />
    </PortfolioContext.Provider>

}

export default ManageStudioPortfolioViewProvider;
