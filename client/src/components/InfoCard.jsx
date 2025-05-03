import {
    Card,
    CardContent,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box
  } from '@mui/material';
  import GroupIcon from '@mui/icons-material/Group';
  import PersonIcon from '@mui/icons-material/Person';
  import InventoryIcon from '@mui/icons-material/Inventory';
  import LocalShippingIcon from '@mui/icons-material/LocalShipping';
  import { CustomerContext} from '../context/CustomerContext';
  import { useContext } from 'react';

const InfoCard = ({ title, type}) => {
  const { customers, reps , inventory } = useContext(CustomerContext);

  const availableAndTransferred = inventory.filter(e => e.status === 'Available' || e.status === 'Transferred');
  const inTransitItems = inventory.filter(e => e.status === 'In Transit');
  
  const value = (type === "customers") 
    ? customers.length 
    : (type === "reps" 
      ? reps.length 
      : (type === "inventory" 
        ? availableAndTransferred.length 
        : inTransitItems.length));
  
  const icon = (type === "customers") 
    ? <GroupIcon className='text-white'/> 
    : (type === "reps" 
      ? <PersonIcon className='text-white'/> 
      : (type === "inventory" 
        ? <InventoryIcon className='text-white'/> 
        : <LocalShippingIcon className='text-white'/>));

  return (
    <div className="flex flex-row justify-center gap-10">
        <Card className="w-60 rounded-lg shadow-lg overflow-hidden"> 
      <CardContent className="p-6">
        <Box className="flex items-start justify-between mb-4"> {/* Flex container, align items top, space between */}

          {/* Left: Icon with background */}
          <Box className="p-4 bg-black rounded-md mr-6">
              {icon}
          </Box>

          {/* Right: Title and Value */}
          <Box className="text-right"> 
            <Typography
              variant="body1" 
              className="text-gray-500 font-medium"
            >
              {title}
            </Typography>
            <Typography
              variant="h4" 
              component="div"
              className="font-semibold text-gray-800"
            >
              {value}
            </Typography>
          </Box>
        </Box>
        <Divider className="my-3" />
      </CardContent>
    </Card>
    </div>
  )
}

export default InfoCard