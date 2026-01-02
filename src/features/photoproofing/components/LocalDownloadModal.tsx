import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Box,
    Paper,
    LinearProgress,
    Alert
} from '@mui/material';
import { FolderOpen, Folder, ArrowForward, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { usePhotoProofingcontext } from '../context/PhotoProofingContext';
import { ImageObj } from '../types';
import { useDownloadImages } from '../hooks/useDownloadImages';

interface LocalDownloadModalProps {
    open: boolean;
    onClose: () => void;
    images: ImageObj[];
    albumName: string;
}

const steps = ['Select Folders', 'Copying Files'];

const LocalDownloadModal: React.FC<LocalDownloadModalProps> = ({ open, onClose, images, albumName }) => {
    const [activeStep, setActiveStep] = React.useState(0);
    const {
        sourceDirectoryHandle,
        setSourceDirectoryHandle,
        destinationDirectoryHandle,
        setDestinationDirectoryHandle
    } = usePhotoProofingcontext();

    const {
        downloading,
        progress,
        currentFileName,
        startLocalCopy,
        error
    } = useDownloadImages();

    // Reset step when opening
    useEffect(() => {
        if (open) {
            setActiveStep(0);
        }
    }, [open]);

    const handleSelectSource = async () => {
        try {
            // @ts-ignore
            const handle = await window.showDirectoryPicker();
            if (handle) {
                setSourceDirectoryHandle(handle);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error selecting source:", error);
                alert("Failed to select source folder.");
            }
        }
    };

    const handleSelectDestination = async () => {
        try {
            // @ts-ignore
            const handle = await window.showDirectoryPicker();
            if (handle) {
                setDestinationDirectoryHandle(handle);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error selecting destination:", error);
                alert("Failed to select destination folder.");
            }
        }
    };

    const handleStartCopy = async () => {
        if (!sourceDirectoryHandle || !destinationDirectoryHandle) return;

        setActiveStep(1);
        try {
            await startLocalCopy(images, albumName);
            // Stay on step 1 (or move to a completion step if desired, but 
            // current UI design implies finishing within this view or closing)
        } catch (e) {
            console.error("Copy process failed", e);
            // Optional: handle error state here
        }
    };

    const isReadyToCopy = !!sourceDirectoryHandle && !!destinationDirectoryHandle;

    return (
        <Dialog open={open} onClose={!downloading ? onClose : undefined} maxWidth="md" fullWidth>
            <DialogTitle>Local File Copy</DialogTitle>
            <DialogContent dividers>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                            Select the source folder containing existing images and the destination folder where you want to copy them.
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                                <FolderOpen color="primary" />
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Source Folder</Typography>
                                    <Typography variant="body1" noWrap title={sourceDirectoryHandle?.name}>
                                        {sourceDirectoryHandle ? sourceDirectoryHandle.name : 'Not selected'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button variant="outlined" onClick={handleSelectSource}>
                                Select Source
                            </Button>
                        </Paper>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ArrowForward color="action" />
                        </Box>

                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                                <Folder color="secondary" />
                                <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Destination Folder</Typography>
                                    <Typography variant="body1" noWrap title={destinationDirectoryHandle?.name}>
                                        {destinationDirectoryHandle ? destinationDirectoryHandle.name : 'Not selected'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button variant="outlined" onClick={handleSelectDestination}>
                                Select Destination
                            </Button>
                        </Paper>

                        <Alert severity="info">
                            This process copies files directly from disk to disk. Ensure you have read access to source and write access to destination.
                        </Alert>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {downloading ? (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Copying...</Typography>
                                    <Typography variant="body2">{progress}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Current file: {currentFileName}
                                </Typography>
                            </>
                        ) : progress === 100 ? (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" gutterBottom>Copy Complete!</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    All {images.length} files have been successfully copied.
                                </Typography>
                            </Box>
                        ) : error ? (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" color="error" gutterBottom>Copy Failed</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {error}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography>Initializing...</Typography>
                        )}
                    </Box>
                )}

            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                {activeStep === 0 ? (
                    <>
                        <Button onClick={onClose} color="inherit">Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleStartCopy}
                            disabled={!isReadyToCopy}
                        >
                            Start Copy
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={onClose}
                        disabled={downloading}
                        variant={!downloading ? "contained" : "text"}
                    >
                        {downloading ? 'Cancel' : 'Close'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default LocalDownloadModal;
