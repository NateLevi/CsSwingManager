import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Breadcrumbs,
  Link as MUILink,
  Paper,
  MenuItem,
  MenuList
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAGES = [
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Rep Portal', path: '/repportal' },
  { title: 'Inventory', path: '/inventory' },
  { title: 'Transfers', path: '/transfers' },
  { title: 'Support', path: '/support' },
  { title: 'Profile', path: '/profile' },
  { title: 'Supplies', path: '/supplies' },
];

const fuse = new Fuse(PAGES, {
  keys: ['title'],
  threshold: 0.3,
});

export default function NavBar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
    } else {
      const matches = fuse.search(query).map(r => r.item);
      setResults(matches);
    }
  }, [query]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <Box sx={{ px: 5, pt: 5, position: 'relative', zIndex: 1100 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#f5f7f8',
          color: '#000',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          px: 2,
          width: 'calc(100% - 40px)',
          left: '20px',
          right: '20px'
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ height: 40, marginRight: 8 }}
            />
          </Box>
          
          {/* Breadcrumb */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mr: 2 }}>
            <MUILink component={Link} to="/dashboard" underline="hover" color="inherit">
              Dashboard
            </MUILink>
            <Typography color="text.primary">
              {{
                '/dashboard': 'Home',
                '/profile': 'Profile',
                '/inventory': 'Inventory',
                '/transfers': 'Transfers',
                '/support': 'Support',
                '/supplies': 'Supplies',
                '/repportal': 'Rep Portal',
              }[location.pathname] || 'Unknown'}
            </Typography>
          </Breadcrumbs>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Search Field */}
          <Box sx={{ position: 'relative', mr: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={query}
              onChange={e => setQuery(e.target.value)}
              sx={{ width: 200 }}
            />
            {results.length > 0 && (
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  top: '40px',
                  width: 200,
                  zIndex: 1200
                }}
              >
                <MenuList>
                  {results.map(page => (
                    <MenuItem
                      key={page.path}
                      onClick={() => {
                        navigate(page.path);
                        setQuery('');
                        setResults([]);
                      }}
                    >
                      {page.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </Paper>
            )}
          </Box>

          {/* Avatar & Dropdown */}
          <Box ref={dropdownRef} sx={{ position: 'relative' }}>
            <Button variant="text" onClick={() => setShowDropdown(prev => !prev)} sx={{ color: '#000' }}>
              <Avatar />
            </Button>
            {showDropdown && (
              <Paper
                elevation={3}
                sx={{ position: 'absolute', right: 0, mt: 1, width: 160, zIndex: 1200 }}
              >
                <MenuList>
                  <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </MenuList>
              </Paper>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
