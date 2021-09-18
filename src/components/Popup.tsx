import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  dialogWrapper: {
    padding: theme.spacing(1),
    position: 'absolute',
    top: theme.spacing(12),
    width: '40vw',
    [theme.breakpoints.down('sm')]: {
      width: '80vw',
    },
  },
  dialogTitle: {
    padding: '6px',
  },
  dialogContent: {
    marginTop: theme.spacing(1),
  },
  closeIcon: {
    cursor: 'pointer',
    color: '#424242',
    fontWeight: 'bold',
    '&:hover': {
      color: '#7B7B7B',
    },
  },
}));

function Popup({ title, children, openPopup, setOpenPopup }) {
  const classes = useStyles();

  return (
    <Dialog
      open={openPopup}
      maxWidth="md"
      classes={{ paper: classes.dialogWrapper }}
    >
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
            {title}
          </Typography>

          <Close
            className={classes.closeIcon}
            onClick={() => setOpenPopup(false)}
          />
        </div>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}

export default Popup;
