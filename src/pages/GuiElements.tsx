
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export const IntendBox = styled(Paper)(({ theme }) => ({
  backgroundColor: '#faebd7',
  ...theme.typography.body1,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  textAlign: 'center',
  textTransform: 'none',
  fontSize:18,
  color:'#000',
  // WebkitHyphens: 'auto',
  // msHyphens: 'auto',
  // hyphens: 'auto',
  borderRadius: 20,
}));

export const RetryButton = styled(Button)(({ theme }) => ({
  ...theme.typography.subtitle2,
  fontSize:17,
  color:'#FFFC00',
  backgroundColor: '#2d0f51',
  padding: theme.spacing(1.5),
  textAlign: 'center',
  textTransform: 'none',
  width:'100%',
  borderRadius: 8,
  '&:hover': {
    backgroundColor: '#4f2ba5',
  },
  boxShadow: theme.shadows[3]
}));

export const ControlButton = styled(Button)(({ theme }) => ({
  ...theme.typography.subtitle2,
  fontSize:17,
  backgroundColor: '#faebd7',
  padding: theme.spacing(1.5),
  textAlign: 'center',
  textTransform: 'none',
  color:'#2d0f51',
  borderRadius: 20,
  '&:hover': {
    backgroundColor: '#fff',
  },
  boxShadow: theme.shadows[3]
}));

export const ControlButtonWide = styled(ControlButton)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
}));

export const YesButton = styled(ControlButton)(({ theme }) => ({
  backgroundColor: '#32CD32',
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
}));

export const NoButton = styled(ControlButton)(({ theme }) => ({
  backgroundColor: '#CCC',
  padding: theme.spacing(2),
}));

export const CancelButton = styled(NoButton)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
}));