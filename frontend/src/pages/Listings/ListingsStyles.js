// ListingsStyles.js
import { styled } from '@mui/material/styles';
import { Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';

export const ListingsContainer = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column-reverse', // Changed to column-reverse to show map first on mobile
  },
  height: '100vh',
  overflow: 'hidden', // Prevent double scrollbars
}));

export const ListingsSidebar = styled(Grid)(({ theme }) => ({
  height: '100%',
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  [theme.breakpoints.down('md')]: {
    height: '50vh', // Give half screen to sidebar on mobile
    flex: '0 0 auto', // Prevent shrinking
  },
}));

export const ListingsMap = styled(Grid)(({ theme }) => ({
  height: '100%',
  position: 'relative', // Needed for proper sizing
  [theme.breakpoints.down('md')]: {
    height: '50vh', // Give half screen to map on mobile
    flex: '0 0 auto', // Prevent shrinking
  },
}));

export const ListingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  position: 'relative',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.01)',
  },
}));

export const ListingMedia = styled(CardMedia)({
  height: 160,
  cursor: 'pointer',
});

export const ListingContent = styled(CardContent)({});

export const FlyToIcon = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  background: '#fff',
  zIndex: 1,
  '&:hover': {
    background: theme.palette.grey[200],
  },
}));