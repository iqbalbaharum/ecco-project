
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, TextField, DialogActions } from '@material-ui/core'
import { updateCreator } from '../../utils/stream-payment'

function UpdateCreatorModal (props) {

  const data = {
    creatorAddress: useRef(),
    paymentTokenAddress: useRef(),
    rewardTokenAddress: useRef(),
    paymentRate: useRef(),
    rewardRate: useRef()
  }

  async function createHandler (event) {
    event.preventDefault()
    await updateCreator(
      data.creatorAddress.current.value,
      data.paymentTokenAddress.current.value,
      data.rewardTokenAddress.current.value,
      data.paymentRate.current.value,
      data.rewardRate.current.value
    )
  }
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="New Creator Dialog"
    >
      <DialogTitle id="form-dialog-title">Update Creator</DialogTitle>
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
            inputRef={data.creatorAddress}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Accepted Payment Address"
            type="text"
            fullWidth
            variant="outlined"
            defaultValue="0x6fC99F5591b51583ba15A8C2572408257A1D2797"
            inputRef={data.paymentTokenAddress}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="ERC20 Social Token Address"
            type="text"
            fullWidth
            variant="outlined"
            defaultValue="0xBF6201a6c48B56d8577eDD079b84716BB4918E8A"
            inputRef={data.rewardTokenAddress}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Payment Rate"
            type="text"
            variant="outlined"
            defaultValue="0.00000008"
            inputRef={data.paymentRate}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Social Token Rate"
            type="text"
            variant="outlined"
            defaultValue="0.00000008"
            inputRef={data.rewardRate}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={createHandler} color="primary">
          Update Creator
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateCreatorModal