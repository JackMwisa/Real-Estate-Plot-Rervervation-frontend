import { styled } from '@mui/material/styles';
import { Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';

export const ListingsContainer = styled(Grid)(({ theme }) => ({
  height: '100vh',
  width: '100%',
  margin: 0,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: 'auto',
    minHeight: '100vh',
  },
}));

export const ListingsSidebar = styled(Grid)(({ theme }) => ({
  height: '100vh',
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  [theme.breakpoints.down('md')]: {
    height: 'auto',
    maxHeight: '50vh',
    order: 2,
  },
}));

export const ListingsMap = styled(Grid)(({ theme }) => ({
  height: '100vh',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    height: '50vh',
    order: 1,
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
  objectFit: 'cover',
});

export const ListingContent = styled(CardContent)({
  padding: '16px',
});

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