// src/pages/ProfilePage.jsx
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Fetches user profile from your backend API
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/salesreps/me`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setProfile(res.data);
      setName(res.data.name || '');
      setAvatarPreview(res.data.avatar_url || '');
      setAvatarFile(null);
    } catch (err) {
      console.error('Failed to load profile:', err.message || 'Unknown error');
      setError('Failed to load profile. Please try again later.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
          setAvatarFile(file);
          const previewUrl = URL.createObjectURL(file);
          setAvatarPreview(previewUrl);
          setError('');
      } else {
          setAvatarFile(null);
          setError("Please select a valid image file (PNG, JPG, GIF).");
      }
  };

  // Handles saving changes
  const handleSave = async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError('');
    const previousPreviewUrl = avatarPreview;
    const wasObjectURL = previousPreviewUrl?.startsWith('blob:');

    try {
      const updateData = {
          name: name,
      };

      // Check if name actually changed
      const needsDBUpdate = updateData.name !== profile.name;

      if (needsDBUpdate) {
          const idToken = await user.getIdToken();
          const res = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/salesreps/me`,
            updateData,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );

          setProfile(res.data);
          setAvatarPreview(res.data.avatar_url || '');
          setName(res.data.name || '');
      } else {
         console.log("No changes detected for DB update.");
      }

      setEditing(false);
      if (wasObjectURL) {
          URL.revokeObjectURL(previousPreviewUrl);
      }

    } catch (err) {
      console.error('Failed to save profile:', err.message || 'Unknown error');
      setError(`Failed to save profile: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handles cancelling the edit process
  const handleCancel = () => {
      setEditing(false);
      setError('');
      if (profile) {
          setName(profile.name || '');
          const dbAvatarUrl = profile.avatar_url || ''; 
          if (avatarPreview && avatarPreview.startsWith('blob:') && avatarPreview !== dbAvatarUrl) {
              URL.revokeObjectURL(avatarPreview);
          }
          setAvatarPreview(dbAvatarUrl);
      } else {
          // Fallback if profile is somehow null
          setName('');
          setAvatarPreview('');
      }
      setAvatarFile(null); // Clear selected file
  };

  // --- Render Logic ---

  // Initial loading state
  if (loading && !profile && !editing) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  // Handle profile load error or no user
  if (!profile && !editing) {
      return <Alert severity={error ? "error" : "info"} sx={{ m: 4 }}>{error || 'Please log in to view your profile.'}</Alert>;
  }

  // --- Edit Mode UI ---
  if (editing) {
    return (
      <Box className="p-4 md:p-6">
        <Card sx={{ maxWidth: 600, mx: 'auto', boxShadow: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5" component="div" sx={{ textAlign: 'center', mb: 2 }}>
                Edit Profile
            </Typography>
            {/* Display errors */}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>{error}</Alert>}
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                 <Avatar
                   src={avatarPreview || '/default-avatar.png'} // *** REPLACE WITH YOUR DEFAULT AVATAR PATH ***
                   alt="Avatar preview"
                   sx={{ width: 120, height: 120, mb: 1, border: '2px solid lightgray' }}
                 />
                 <Button variant="contained" component="label" disabled={loading}>
                   {avatarFile ? 'Change Avatar' : 'Upload New Avatar'}
                   <input type="file" hidden accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} />
                 </Button>
                 {avatarFile && <Typography variant="caption" sx={{ mt: -1 }}>{avatarFile.name}</Typography>}
            </Box>
            {/* Name Field */}
            <TextField
                fullWidth
                label="Display Name"
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
            />
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 2 }}>
              <Button onClick={handleCancel} disabled={loading} variant="outlined" color="secondary">
                  Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // --- View Mode UI ---
  if (!profile) {
      return <Alert severity="warning" sx={{ m: 4 }}>Profile data is currently unavailable.</Alert>;
  }
  return (
    <Box className="p-4 md:p-6">
       {/* Display fetch errors if any */}
       {error && !editing && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        {/* Use ProfileHeader component */}
        <ProfileHeader
          name={profile.name || 'No Name Set'}
          avatarUrl={profile.avatar_url || '/default-avatar.png'} // *** REPLACE WITH YOUR DEFAULT AVATAR ***
          actionButton={{
            label: 'Edit Profile',
            onClick: () => {
                setName(profile.name || '');
                setAvatarPreview(profile.avatar_url || '');
                setAvatarFile(null);
                setError('');
                setEditing(true);
            }
          }}
        />
        {/* Display other profile info */}
        <Card sx={{ mt: 3, p: 2 }}>
             <Typography variant="body1">Status: {profile.status || 'N/A'}</Typography>
             <Typography variant="body1">Total Customers Helped: {profile.total_customers ?? 0}</Typography>
        </Card>
      </Box>
    </Box>
  );
}
