import { useState } from 'react';
import { Card, Typography, TextField, Button, Box } from '@mui/material';

function EditProfileForm({ initialName, onCancel, onSave }) {
    const [name, setName] = useState(initialName);
    const [avatarFile, setAvatarFile] = useState(null);
  
    return (
      <Card className="max-w-md mx-auto p-4">
        <Typography variant="h6">Edit Profile</Typography>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="my-2"
        />
        <Button variant="outlined" component="label" className="my-2">
          Upload Avatar
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={e => setAvatarFile(e.target.files[0])}
          />
        </Button>
        {avatarFile && <Typography>{avatarFile.name}</Typography>}
  
        <Box className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => onSave({ name, avatar: avatarFile })}
          >
            Save
          </Button>
        </Box>
      </Card>
    );
}

export default EditProfileForm;