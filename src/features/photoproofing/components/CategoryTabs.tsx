import React, { useState } from 'react';
import { Tabs, Tab, Box, useMediaQuery, useTheme } from '@mui/material';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import { AlbumCategory } from '../types';

interface CategoryTabsProps {
    handleAlbumChange?: (category: AlbumCategory) => void;
}

const CategoryTabs = ({ handleAlbumChange }: CategoryTabsProps) => {
    const { categories: categories1 } = usePhotoProofingStore();
    const categories: Record<string, AlbumCategory> = {
        "all": { name: "All Photos", images: [], id: "all" },
        ...categories1
    };
    const categoryKeys = Object.keys(categories);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [activeTab, setActiveTab] = useState<string>(categoryKeys[0] ?? '');

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
        handleAlbumChange?.(categories[newValue]);
    };

    if (categoryKeys.length === 0) return null;

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: 'rgba(255,255,255,0.04)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                overflow: 'hidden',
            }}
        >
            <Tabs
                value={activeTab}
                onChange={handleChange}
                variant={isMobile ? 'scrollable' : 'scrollable'}
                scrollButtons={isMobile ? 'auto' : false}
                allowScrollButtonsMobile
                TabIndicatorProps={{
                    style: {
                        background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                    },
                }}
                sx={{
                    minHeight: isMobile ? 40 : 48,
                    '& .MuiTab-root': {
                        color: 'rgba(255,255,255,0.45)',
                        fontFamily: 'inherit',
                        fontSize: isMobile ? '0.72rem' : '0.85rem',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        textTransform: 'none',
                        minHeight: isMobile ? 40 : 48,
                        minWidth: isMobile ? 80 : 100,
                        px: isMobile ? 1.5 : 2.5,
                        transition: 'color 0.2s ease',
                        '&:hover': {
                            color: 'rgba(255,255,255,0.85)',
                        },
                    },
                    '& .Mui-selected': {
                        color: '#c4b5fd !important',
                        fontWeight: 600,
                    },
                    '& .MuiTabs-scrollButtons': {
                        color: 'rgba(255,255,255,0.5)',
                        '&.Mui-disabled': { opacity: 0.2 },
                    },
                }}
            >

                {categoryKeys.map((key) => (
                    <Tab
                        key={key}
                        label={categories[key].name}
                        value={key}
                        disableRipple={false}
                    />
                ))}
            </Tabs>
        </Box>
    );
};

export default CategoryTabs;
