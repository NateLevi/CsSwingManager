// src/pages/SupportPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Typography,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';

const SUBJECT_OPTIONS = [
  { value: 'bug',      label: 'Bug Report' },
  { value: 'question', label: 'Question' },
  { value: 'feature',  label: 'Feature Request' },
  { value: 'other',    label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
];

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [subscribe, setSubscribe] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    // TODO: hook up to /api/support
    setSnackbarOpen(true);
    setSubject('');
    setPriority('medium');
    setMessage('');

  };

  return (
    <Box className="p-6">
      <Card sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
        <CardHeader
          title="Support & Feedback"
          subheader="Let us know how we can improve"
          sx={{ bgcolor: '#f5f5f5', color: '#333' }}
        />
        <CardContent component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            select
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            variant="outlined"
            sx={{ bgcolor: '#fafafa' }}
          >
            {SUBJECT_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: '#fafafa' }}
          >
            {PRIORITY_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Your Message"
            multiline
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            variant="outlined"
            sx={{ bgcolor: '#fafafa' }}
          />

          <TextField
            label="Attach Screenshot (optional)"
            type="file"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            sx={{ bgcolor: '#fafafa' }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={subscribe}
                onChange={e => setSubscribe(e.target.checked)}
                sx={{ color: '#333' }}
              />
            }
            label="Email me updates on this ticket"
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#333' }
            }}
            disabled={!subject || !message}
          >
            Submit Ticket
          </Button>

          <Typography variant="body2" sx={{ color: '#555', mt: 2 }}>
            Or email us directly at{' '}
            <a href="mailto:support@cellularsales.com" style={{ color: '#000' }}>
              support@cellularsales.com
            </a>
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Thanks! Your ticket has been logged.
        </Alert>
      </Snackbar>
    </Box>
  );
}
