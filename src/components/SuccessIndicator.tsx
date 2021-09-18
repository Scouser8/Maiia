import React from 'react';
import { Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SuccessIndicator({
  showSuccessMesage,
  handleSuccessClose,
  successText,
}) {
  return (
    <Snackbar
      open={showSuccessMesage}
      autoHideDuration={6000}
      onClose={handleSuccessClose}
    >
      <Alert
        onClose={handleSuccessClose}
        severity="success"
        sx={{ width: '100%' }}
      >
        {successText}
      </Alert>
    </Snackbar>
  );
}
