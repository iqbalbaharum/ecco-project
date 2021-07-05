import React, { useRef } from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@material-ui/core'

function DepositModal(props) {

  const upgradeAmount = useRef()

  function createHandler() {
    
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="Deposit Dialog"
    >
      <DialogTitle id="form-dialog-title">Deposit {props.stSymbol}</DialogTitle>
      <DialogContent>
        <form autoComplete="off">
          <TextField
            autoFocus
            label="Deposit Amount"
            type="text"
            fullWidth
            helperText="Entered amount of token that will be deposited into the superapp"
            variant="outlined"
            inputRef={upgradeAmount}
          />
        </form>
        <DialogActions>
          <Button onClick={props.handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={createHandler} color="primary">
            Deposit ({props.stSymbol})
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default DepositModal