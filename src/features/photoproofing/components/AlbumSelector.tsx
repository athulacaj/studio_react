import React, { useEffect, useState } from 'react';
import { Box, ClickAwayListener, FormControl, Select, MenuItem, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AlbumCategory } from '../types';
import { usePhotoProofingStore } from '../store/usePhotoProofingStore';
import { useToastStore } from '../../../shared/hooks/useToastStore';

interface AlbumSelectorProps {
    [key: string]: any;
    hideAll?: boolean;
}

const AlbumSelector = ({ hideAll = false, ...rest }: AlbumSelectorProps) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const { toAddWhichAlbum, setToAddWhichAlbum, categories } = usePhotoProofingStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const showToast = useToastStore((state) => state.showToast);

    useEffect(() => {
        const local = localStorage?.getItem('toAddWhichAlbum')
        if (local && Object.keys(categories).includes(local)) {
            setToAddWhichAlbum(local);
        } else if (Object.keys(categories).length > 0 && !toAddWhichAlbum) {
            setToAddWhichAlbum(Object.keys(categories)[0]);
        }
    }, [categories])

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FormControl {...rest} size="small" variant="standard" sx={{ minWidth: isMobile ? 80 : 200 }}>
                <Select
                    value={toAddWhichAlbum}
                    onChange={(e) => {
                        showToast(
                            `Image will be added to category '${categories[e.target.value as string].name}'`,
                            "success"
                        );
                        setToAddWhichAlbum(e.target.value as string);
                    }}
                    disableUnderline
                    sx={{
                        color: "white",
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiSelect-select': { paddingBottom: '4px', paddingTop: '4px' }
                    }}
                >
                    {Object.keys(categories).map((albumName) => (
                        <MenuItem key={albumName} value={albumName}>
                            {categories[albumName].name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
                <Tooltip
                    title="Photos you add options from the image be added to this album"
                    arrow
                    placement="top"
                    open={tooltipOpen}
                    onClose={() => setTooltipOpen(false)}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                >
                    <InfoOutlinedIcon
                        onClick={() => setTooltipOpen((prev) => !prev)}
                        sx={{
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            color: tooltipOpen ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                            cursor: 'pointer',
                            '&:hover': { color: 'rgba(255,255,255,0.9)' },
                            transition: 'color 0.2s ease',
                        }}
                    />
                </Tooltip>
            </ClickAwayListener>
        </Box>
    );
};

export default AlbumSelector;
