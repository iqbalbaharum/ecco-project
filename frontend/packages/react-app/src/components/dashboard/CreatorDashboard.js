
import React, { useState } from "react";
import { Grid, Box, Typography, Button } from '@material-ui/core';
import { streamSocialToken } from '../../utils/stream-payment'
import UpdateCreatorModal from "../ui/UpdateCreatorModal";

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
          <Box><Typography variant="h6">Stream Balance</Typography></Box>
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h6">NFT Balance</Typography >
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h6">DeFi Balance</Typography >
          <Typography variant="h6" color="primary">0.00</Typography>
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