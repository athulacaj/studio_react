import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';

const AlbumSelector = ({ selectedAlbum, onAlbumChange, albums, isMobile }) => {
    return (
        <FormControl size="small" variant="standard" sx={{ minWidth: isMobile ? 80 : 120 }}>
            <Select
                value={selectedAlbum}
                onChange={(e) => onAlbumChange(e.target.value)}
                disableUnderline
                sx={{
                    color: "white",
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiSelect-select': { paddingBottom: '4px', paddingTop: '4px' }
                }}
            >
                {Object.keys(albums).map((albumName) => (
                    <MenuItem key={albumName} value={albumName}>
                        {albumName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default AlbumSelector;
