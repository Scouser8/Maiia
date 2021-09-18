import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

export default function DeleteConfirmationDialog({
  openDeleteDialog,
  setOpenDeleteDialog,
  confirmationMessage,
  handleAction,
}) {
  return (
    <Dialog
      open={openDeleteDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Delete Confirmation'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {confirmationMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAction} color="primary">
          Yes, delete
        </Button>
        <Button
          onClick={() => setOpenDeleteDialog(false)}
          color="primary"
          autoFocus
        >
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
}
