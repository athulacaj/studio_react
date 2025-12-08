import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';

const LikeAnimation = ({ show }) => {
    if (!show) return null;

    return (
        <FavoriteIcon
            sx={{
                fontSize: '5rem',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
                position: 'absolute',
                zIndex: 5,
                top: '50%',
                left: '50%',
                color: 'primary',
                transform: 'translate(-50%, -50%) scale(0)',
                animation: 'like-grow 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards',
                '@keyframes like-grow': {
                    '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
                    '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                },
            }}
        />
    );
};

export default LikeAnimation;
