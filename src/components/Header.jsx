import React from 'react';
import { AppBar, Toolbar, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Header = ({ albums, selectedAlbum, onAlbumChange }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gen Photo Proofing
        </Typography>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="album-select-label">Album</InputLabel>
          <Select
            labelId="album-select-label"
            id="album-select"
            value={selectedAlbum}
            label="Album"
            onChange={onAlbumChange}
          >
            <MenuItem value="all">All Photos</MenuItem>
            {Object.keys(albums).map((albumName) => (
              <MenuItem key={albumName} value={albumName}>
                {albumName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
