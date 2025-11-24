import React from 'react';
import { IconButton } from '@mui/material';

const NavigationButton = ({ onClick, icon: Icon, position = 'left' }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                position: 'absolute',
                [position]: 24,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                zIndex: 10,
                width: 48,
                height: 48
            }}
        >
            <Icon fontSize="small" />
        </IconButton>
    );
};

export default NavigationButton;
