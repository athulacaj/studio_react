import React from 'react';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Avatar,
    Typography,
    Chip,
    alpha,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    Shield as ShieldIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { UserListItem } from '../types';

interface UserCardProps {
    user: UserListItem;
    onSelect: (uid: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
    const formattedDate = user.createdAt?.toDate
        ? user.createdAt.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : user.createdAt instanceof Date
            ? user.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : 'Unknown';

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.[0]?.toUpperCase() || '?';

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: 'blur(12px)',
                '&:hover': {
                    transform: 'translateY(-6px) scale(1.01)',
                    boxShadow: (theme) =>
                        `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}, 0 8px 16px ${alpha(theme.palette.common.black, 0.25)}`,
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                    '& .view-indicator': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    },
                    '& .gradient-accent': {
                        opacity: 1,
                    },
                    '& .user-avatar': {
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.4)',
                    },
                },
            }}
        >
            {/* Gradient accent line at top */}
            <Box
                className="gradient-accent"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                }}
            />

            <CardActionArea
                onClick={() => onSelect(user.uid)}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 0,
                }}
            >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Avatar + Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                        <Avatar
                            className="user-avatar"
                            src={user.photoURL || undefined}
                            sx={{
                                width: 52,
                                height: 52,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                transition: 'box-shadow 0.3s ease',
                                border: '2px solid',
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                noWrap
                                sx={{ lineHeight: 1.3 }}
                            >
                                {user.name || 'Unnamed User'}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <EmailIcon sx={{ fontSize: 12 }} />
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 0.75, mb: 2, flexWrap: 'wrap' }}>
                        {user.isAdmin && (
                            <Chip
                                icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                                label="Admin"
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    fontSize: '0.7rem',
                                    height: 24,
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                    color: '#a78bfa',
                                    fontWeight: 600,
                                }}
                                variant="outlined"
                            />
                        )}
                        <Chip
                            icon={<PersonIcon sx={{ fontSize: '14px !important' }} />}
                            label="User"
                            size="small"
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                fontSize: '0.7rem',
                                height: 24,
                                borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                            }}
                        />
                    </Box>

                    {/* Footer: Date + View */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 1.5,
                            borderTop: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.divider, 0.08),
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <CalendarIcon sx={{ fontSize: 12 }} />
                            {formattedDate}
                        </Typography>
                        <Box
                            className="view-indicator"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                opacity: 0,
                                transform: 'translateX(-8px)',
                                transition: 'all 0.3s ease',
                                color: 'primary.main',
                            }}
                        >
                            <Typography variant="caption" fontWeight={600}>
                                View Dashboard
                            </Typography>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default UserCard;
