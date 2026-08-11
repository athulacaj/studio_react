import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Skeleton,
    alpha,
} from '@mui/material';

const UserCardSkeleton: React.FC = () => (
    <Card
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.divider, 0.08),
        }}
    >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Skeleton variant="circular" width={52} height={52} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="90%" height={18} />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
                <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rounded" width={55} height={24} sx={{ borderRadius: 2 }} />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                }}
            >
                <Skeleton variant="text" width={80} height={18} />
            </Box>
        </CardContent>
    </Card>
);

export default UserCardSkeleton;
