
import { NavLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LinkIcon from '@mui/icons-material/Link';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';export default function SideBar() {
    return (
    <div className='pl-5'>
      <Card sx={{ width: 280, height: '100vh', backgroundColor: '#2f2f2f', color: '#fff' }}>
        <CardContent>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            CS Manager
          </Typography>
          <List>
            {/* Dashboard */}
            <NavLink to="/dashboard">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </NavLink>
            
            <NavLink to="/repportal">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <LinkIcon />
                </ListItemIcon>
                <ListItemText primary="RepPortal" />
              </ListItemButton>
            </NavLink>
            {/* Inventory */}
            <NavLink to="/inventory">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <Inventory2Icon />
                </ListItemIcon>
                <ListItemText primary="Inventory" />
              </ListItemButton>
            </NavLink>

            {/* Transfers */}
            <NavLink to="/transfers">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <SyncAltIcon />
                </ListItemIcon>
                <ListItemText primary="Transfers" />
              </ListItemButton>
            </NavLink>
            <NavLink to="/supplies">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <LocalShippingIcon />
                </ListItemIcon>
                <ListItemText primary="Supplies" />
              </ListItemButton>
            </NavLink>
            {/* Notifications */}
            <NavLink to="/support">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Support" />
              </ListItemButton>
            </NavLink>

            {/* Profile */}
            <NavLink to="/profile">
              <ListItemButton>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </NavLink>
            
            
          </List>
        </CardContent>
      </Card>
    </div>
    );
    
  }