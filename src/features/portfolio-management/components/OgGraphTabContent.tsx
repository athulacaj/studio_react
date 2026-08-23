import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Typography, Button, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, List,
    ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText
} from '@mui/material';
import { Save as SaveIcon, Image as ImageIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { usePortfolioStore } from '../store/portfolioStore';

const OgGraphTabContent: React.FC = () => {
    const { htmlContent, setHtmlContent, ogData, setOgData, uploadedImages } = usePortfolioStore();
    const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
    const [webpageTitle, setWebpageTitle] = useState('');

    useEffect(() => {
        if (!htmlContent) return;
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        const getMetaContent = (property: string) => {
            const el = doc.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
            return el ? el.content : '';
        };

        const titleEl = doc.querySelector('title');
        setWebpageTitle(titleEl ? titleEl.textContent || '' : '');

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOgData({
            title: getMetaContent('og:title'),
            description: getMetaContent('og:description'),
            image: getMetaContent('og:image'),
            url: getMetaContent('og:url'),
        });
    }, [htmlContent]);

    const handleChange = (field: keyof typeof ogData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setOgData({ ...ogData, [field]: e.target.value });
    };

    const handleSave = () => {
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        
        const setMetaContent = (property: string, content: string) => {
            let el = doc.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
            if (!el) {
                el = doc.createElement('meta');
                el.setAttribute('property', property);
                doc.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        let titleEl = doc.querySelector('title');
        if (!titleEl) {
            titleEl = doc.createElement('title');
            doc.head.appendChild(titleEl);
        }
        titleEl.textContent = webpageTitle;

        setMetaContent('og:title', ogData.title);
        setMetaContent('og:description', ogData.description);
        setMetaContent('og:image', ogData.image);
        setMetaContent('og:url', ogData.url);

        const doctype = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : '<!DOCTYPE html>';
        setHtmlContent(doctype + '\n' + doc.documentElement.outerHTML);
        alert('OG Graph details updated successfully. They will be saved when you publish.');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'rgba(15, 26, 46, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Open Graph Settings</Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                    These details will be shown when your portfolio is shared on social media platforms like Facebook, Twitter, LinkedIn, etc.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Webpage Title"
                        value={webpageTitle}
                        onChange={(e) => setWebpageTitle(e.target.value)}
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { color: '#fff' } }}
                        InputLabelProps={{ sx: { color: '#94A3B8' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                            }
                        }}
                    />
                    <TextField
                        label="OG Title"
                        value={ogData.title}
                        onChange={handleChange('title')}
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { color: '#fff' } }}
                        InputLabelProps={{ sx: { color: '#94A3B8' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                            }
                        }}
                    />
                    <TextField
                        label="OG Description"
                        value={ogData.description}
                        onChange={handleChange('description')}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        InputProps={{ sx: { color: '#fff' } }}
                        InputLabelProps={{ sx: { color: '#94A3B8' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            label="OG Image URL"
                            value={ogData.image}
                            onChange={handleChange('image')}
                            fullWidth
                            variant="outlined"
                            InputProps={{ sx: { color: '#fff' } }}
                            InputLabelProps={{ sx: { color: '#94A3B8' } }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                                }
                            }}
                        />
                        <IconButton
                            onClick={() => setIsAssetDialogOpen(true)}
                            sx={{
                                color: '#C084FC',
                                bgcolor: 'rgba(192, 132, 252, 0.1)',
                                '&:hover': { bgcolor: 'rgba(192, 132, 252, 0.2)' },
                            }}
                            title="Choose Asset"
                        >
                            <ImageIcon />
                        </IconButton>
                    </Box>
                    <TextField
                        label="OG URL"
                        value={ogData.url}
                        onChange={handleChange('url')}
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { color: '#fff' } }}
                        InputLabelProps={{ sx: { color: '#94A3B8' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                '&.Mui-focused fieldset': { borderColor: '#C084FC', borderWidth: '1px' }
                            }
                        }}
                    />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        startIcon={<SaveIcon />}
                        sx={{
                            bgcolor: '#C084FC',
                            '&:hover': { bgcolor: '#A855F7' }
                        }}
                    >
                        Save Details
                    </Button>
                </Box>
            </Paper>

            <Dialog
                open={isAssetDialogOpen}
                onClose={() => setIsAssetDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Select an Asset</DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {uploadedImages.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography sx={{ color: '#94A3B8' }}>No assets uploaded yet.</Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {uploadedImages.map((img) => (
                                <ListItem key={img.id} disablePadding sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ListItemButton onClick={() => {
                                        const finalUrl = img.fileKey
                                            ? `${import.meta.env.VITE_R2_BASEURL}/${img.fileKey}`
                                            : img.url;
                                        setOgData({ ...ogData, image: finalUrl });
                                        setIsAssetDialogOpen(false);
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'transparent', borderRadius: 1 }}>
                                                {img.file?.type.startsWith('image/') || img.url.endsWith('.webp') || img.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                                    <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FileIcon sx={{ color: '#94A3B8' }} />
                                                )}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={img.file?.name || img.fileKey || 'Asset'}
                                            secondary={img.file && img.file.size > 0 ? (img.file.size / 1024).toFixed(2) + ' KB' : ''}
                                            primaryTypographyProps={{ color: '#fff', noWrap: true }}
                                            secondaryTypographyProps={{ color: '#94A3B8' }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', p: 2 }}>
                    <Button onClick={() => setIsAssetDialogOpen(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OgGraphTabContent;
