import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Button, Paper } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { usePortfolioStore } from '../store/portfolioStore';

const OgGraphTabContent: React.FC = () => {
    const { htmlContent, setHtmlContent, ogData, setOgData } = usePortfolioStore();

    useEffect(() => {
        if (!htmlContent) return;
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        const getMetaContent = (property: string) => {
            const el = doc.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
            return el ? el.content : '';
        };

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
        </Box>
    );
};

export default OgGraphTabContent;
