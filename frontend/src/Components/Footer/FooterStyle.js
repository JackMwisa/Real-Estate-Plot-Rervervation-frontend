// FooterStyle.js
import { styled } from '@mui/material/styles';
import { Box, Link } from '@mui/material';

export const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#0a2540' : '#f5f5f5',
  color: theme.palette.mode === 'dark' ? '#fff' : '#333',
  marginTop: theme.spacing(8),
  paddingTop: theme.spacing(5),
  paddingBottom: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#2e3b4e' : '#ddd'}`,
}));

export const FooterLink = styled(Link)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: 500,
  marginRight: theme.spacing(3),
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#2e7d32',
    textDecoration: 'underline',
  },
}));
