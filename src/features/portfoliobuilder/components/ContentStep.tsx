import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { generatePortfolioContent } from '../../../config/gemini';

const ContentStep = ({ data, basicInfo, onUpdate }) => {
    const [formData, setFormData] = useState({
        bio: data.bio || '',
        aboutSection: data.aboutSection || '',
        tagline: data.tagline || basicInfo.tagline || '',
        metaDescription: data.metaDescription || '',
        achievements: data.achievements || '',
        services: data.services || ''
    });
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState({});

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onUpdate(newData);
    };

    const handleGenerateAI = async () => {
        setGenerating(true);
        setError(null);
        try {
            const content = await generatePortfolioContent({
                name: basicInfo.name || 'Photographer',
                specialty: basicInfo.photographyStyles?.join(', ') || 'Photography',
                experience: basicInfo.experience ? `${basicInfo.experience} years` : 'several years',
                achievements: formData.achievements || 'Creating stunning visual stories'
            });

            const newData = {
                ...formData,
                bio: content.bio,
                aboutSection: content.aboutSection,
                tagline: content.tagline,
                metaDescription: content.metaDescription
            };
            setFormData(newData);
            onUpdate(newData);
        } catch (err) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (field) => {
        navigator.clipboard.writeText(formData[field]);
        setCopied({ ...copied, [field]: true });
        setTimeout(() => {
            setCopied({ ...copied, [field]: false });
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Create Your Content
                </Typography>
                <Button
                    variant="contained"
                    startIcon={generating ? <CircularProgress size={20} /> : <Sparkles size={20} />}
                    onClick={handleGenerateAI}
                    disabled={generating || !basicInfo.name}
                    sx={{
                        background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                    }}
                >
                    {generating ? 'Generating...' : 'AI Content Generator'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                💡 Tip: Fill in your achievements below, then click "AI Content Generator" to create professional content for your portfolio.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Tagline
                        </Typography>
                        {formData.tagline && (
                            <Button
                                size="small"
                                startIcon={copied.tagline ? <Check size={16} /> : <Copy size={16} />}
                                onClick={() => handleCopy('tagline')}
                            >
                                {copied.tagline ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </Box>
                    <TextField
                        fullWidth
                        value={formData.tagline}
                        onChange={(e) => handleChange('tagline', e.target.value)}
                        placeholder="A catchy phrase that captures your essence"
                        variant="outlined"
                        helperText="This appears prominently on your homepage"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Short Bio
                        </Typography>
                        {formData.bio && (
                            <Button
                                size="small"
                                startIcon={copied.bio ? <Check size={16} /> : <Copy size={16} />}
                                onClick={() => handleCopy('bio')}
                            >
                                {copied.bio ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="A brief introduction about yourself (2-3 sentences)"
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            About Section
                        </Typography>
                        {formData.aboutSection && (
                            <Button
                                size="small"
                                startIcon={copied.aboutSection ? <Check size={16} /> : <Copy size={16} />}
                                onClick={() => handleCopy('aboutSection')}
                            >
                                {copied.aboutSection ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        value={formData.aboutSection}
                        onChange={(e) => handleChange('aboutSection', e.target.value)}
                        placeholder="Tell your story in detail (3-4 paragraphs)"
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Achievements & Awards
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.achievements}
                        onChange={(e) => handleChange('achievements', e.target.value)}
                        placeholder="List your notable achievements, awards, publications, or exhibitions"
                        variant="outlined"
                        helperText="This helps AI generate better content about your expertise"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Services Offered
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.services}
                        onChange={(e) => handleChange('services', e.target.value)}
                        placeholder="What photography services do you offer?"
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        SEO Meta Description
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.metaDescription}
                        onChange={(e) => handleChange('metaDescription', e.target.value)}
                        placeholder="A brief description for search engines (150-160 characters)"
                        variant="outlined"
                        helperText={`${formData.metaDescription.length}/160 characters`}
                    />
                </Grid>
            </Grid>
        </motion.div>
    );
};

export default ContentStep;
