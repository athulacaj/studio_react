import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from '@mui/material';

const AddToAlbumDialog = ({ open, onClose, albums, onAddToAlbum }) => {
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [newAlbumName, setNewAlbumName] = useState('');

  const handleAddToAlbum = () => {
    if (selectedAlbum) {
      onAddToAlbum(selectedAlbum);
    } else if (newAlbumName) {
      onAddToAlbum(newAlbumName);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add to Album</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="select-album-label">Select Album</InputLabel>
            <Select
              labelId="select-album-label"
              value={selectedAlbum}
              label="Select Album"
              onChange={(e) => {
                setSelectedAlbum(e.target.value);
                setNewAlbumName('');
              }}
            >
              {Object.keys(albums).map((albumName) => (
                <MenuItem key={albumName} value={albumName}>
                  {albumName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Or Create New Album"
            value={newAlbumName}
            onChange={(e) => {
              setNewAlbumName(e.target.value);
              setSelectedAlbum('');
            }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddToAlbum}
          variant="contained"
          disabled={!selectedAlbum && !newAlbumName}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToAlbumDialog;
