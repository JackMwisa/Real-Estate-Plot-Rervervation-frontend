import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';

export const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha('#ffffff', 0.1)
    : alpha('#1b5e20', 0.1),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha('#ffffff', 0.2)
      : alpha('#1b5e20', 0.2),
  },
  marginLeft: theme.spacing(1),
  width: '100%',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

export const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.85rem',
  },
}));
