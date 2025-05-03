
import React from 'react';
import { Card, CardContent, Avatar, Typography, Switch, Box, Button } from '@mui/material';

export default function ProfileHeader({
  avatarUrl,
  name, 
  actionButton
}) {
  return (
    <Card className="w-full rounded-2xl shadow p-4" sx={{ width: '100%' }}>
      <CardContent className="flex items-center justify-between">
        {/* Left: Avatar + Text */}
        <Box className="flex items-center">
          <Avatar
            src={avatarUrl} 
            alt={name}
            className="w-32 h-32 mr-4"
            sx={{ width: 92, height: 92 }}
          />
          <div>
            <Typography variant="h4" className="font-bold">
              {name}
            </Typography>
            <Typography variant="subtitle1" className="text-gray-500">
              Sales Rep (Store A)
            </Typography>
            <Typography variant="subtitle2" className="text-gray-500">
              Rep since: 2024
            </Typography>
            
          </div>
        </Box>
        
        {/* Right: Action button */}
        <Box className="flex items-center">
          {actionButton && (
            <Button 
              variant="contained" 
              onClick={actionButton.onClick}
              sx={{ 
                backgroundColor: 'black', 
                '&:hover': { 
                  backgroundColor: '#333' 
                } 
              }}
            >
              {actionButton.label}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
