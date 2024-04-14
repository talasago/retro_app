import type { FC } from 'react';
import { Alert as MuiAlart } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { alertSlice } from 'stores/alert';
import type { AlertState } from 'stores/alert';
import type { RootState, AppDispatch } from 'stores/store';
import Snackbar from '@mui/material/Snackbar';

const Alert: FC = () => {
  const alert: AlertState = useSelector((state: RootState) => state.alert);
  const dispatch = useDispatch<AppDispatch>();
  const { resetAlert } = alertSlice.actions;

  const handleClose = () => {
    dispatch(resetAlert());
  };

  return (
    <>
      <Snackbar open={alert.open} autoHideDuration={5000} onClose={handleClose}>
        <MuiAlart
          onClose={handleClose}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </MuiAlart>
      </Snackbar>
    </>
  );
};

export default Alert;
