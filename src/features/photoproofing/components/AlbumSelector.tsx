import React from 'react';
import { FormControl, Select, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { AlbumCategory } from '../types';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';

interface AlbumSelectorProps {
    onAlbumChange: (event: any) => void;
    [key: string]: any;
    hideAll?: boolean;
}

const AlbumSelector = ({ onAlbumChange, hideAll = false, ...rest }: AlbumSelectorProps) => {
    const { selectedAlbum, categories } = usePhotoProofingStore();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <FormControl {...rest} size="small" variant="standard" sx={{ minWidth: isMobile ? 80 : 200 }}>
            <Select
                value={selectedAlbum}
                onChange={(e) => onAlbumChange(e)}
                disableUnderline
                sx={{
                    color: "white",
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiSelect-select': { paddingBottom: '4px', paddingTop: '4px' }
                }}
            >
                {!hideAll && <MenuItem value="all">All Photos</MenuItem>}
                {Object.keys(categories).map((albumName) => (
                    <MenuItem key={albumName} value={albumName}>
                        {categories[albumName].name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default AlbumSelector;
