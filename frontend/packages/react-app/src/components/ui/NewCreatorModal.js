
import React from 'react'
import {Dialog, DialogContent, DialogTitle, Button, TextField, DialogActions} from '@material-ui/core'

function NewCreatorModal(props) {

  return (
  <Dialog
    open={props.open}
    onClose={props.onClose}
    aria-labelledby="New Creator Dialog"
  >
    <DialogTitle id="form-dialog-title">New Creator</DialogTitle>
    <DialogContent>
      <form autoComplete="off">
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Creator Address"
          type="text"
          fullWidth
          defaultValue={props.currentUser}
          helperText="To change this address, please reconnect to correct address"
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="ERC20 Social Token Address"
          type="text"
          fullWidth
          variant="outlined"
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Payment Rate"
          type="text" variant="outlined"
        />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Social Token Rate"
          type="text"
          variant="outlined"
        />
      </form>
    </DialogContent>
    <DialogActions>
      <Button onClick={props.handleCancel} color="primary">
        Cancel
      </Button>
      <Button onClick={props.handleCreate} color="primary">
        Create Creator
      </Button>
    </DialogActions>
  </Dialog>
  )
}

export default NewCreatorModal