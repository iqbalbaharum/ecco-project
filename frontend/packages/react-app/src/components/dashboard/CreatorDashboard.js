
import React from "react";
import {Grid, Box, Typography, Button } from '@material-ui/core';
import {streamSocialToken} from '../../utils/stream-payment'

function CreatorDashboard() {
  return(
    <div>
      <Grid container spacing={1}>
        <Grid item md={12}>
          <Typography  variant="h3">Dashboard</Typography >
        </Grid>
        {/* Buttons */}
        <Grid item md={12}>
          <Box align="right">
            <Button variant="contained" color="primary" onClick={() => streamSocialToken()}>+ Deposit</Button>
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
    </div>
  )
}

export default CreatorDashboard