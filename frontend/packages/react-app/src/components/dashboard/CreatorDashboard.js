
import React, { useEffect, useState } from "react";
import { Grid, Box, Typography, Button, TextField } from '@material-ui/core';
import { streamSocialToken } from '../../utils/stream-payment'
import UpdateCreatorModal from "../ui/UpdateCreatorModal";
import { getOwnerToken } from  '../../utils/token'

function CreatorDashboard (props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  async function depositHandler (event) {
    streamSocialToken(
      props.creator,
      ''
    )
  }

  async function updateHandler (event) {
    setModalIsOpen(true)
  }
  
  useEffect(async () => {
    console.log(await getOwnerToken(props.creator))
  }, [getOwnerToken])

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item md={12}>
          <Typography variant="h3">Dashboard</Typography >
        </Grid>
        {/* Buttons */}
        <Grid item md={12}>
          <Box align="right">
            <Button variant="contained" color="primary" onClick={() => updateHandler()}>UpdateCreator</Button>
            <Button variant="contained" color="primary" onClick={() => depositHandler()}>+ Deposit</Button>
          </Box>
        </Grid>
        {/* statistic */}
        <Grid item md={4}>
          <Box><Typography variant="h6">Payments Earned</Typography></Box>
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h6">Interest Earned</Typography >
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h6">Creator Token</Typography >
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={12}>
          <TextField
            id="outlined-textarea"
            label="Multiline Placeholder"
            placeholder="Placeholder"
            multiline
            variant="filled"
          />
        </Grid>
        <Grid item md={12}>
          <Button variant="contained" color="primary" onClick={() => updateHandler()}>Copy Payment Widget</Button>
        </Grid>
      </Grid>

      <UpdateCreatorModal
        currentUser={props.creator}
        open={modalIsOpen}
        handleCancel={() => setModalIsOpen(false)}
        handleCreate={() => setModalIsOpen(false)}></UpdateCreatorModal>
    </div>
  )
}

export default CreatorDashboard