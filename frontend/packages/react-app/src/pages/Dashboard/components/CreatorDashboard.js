
import React, { useEffect, useState, useCallback } from "react";
import { Grid, Box, Typography, Button, TextField } from '@material-ui/core';
import { streamSocialToken } from '../../../utils/stream-payment'
import UpdateCreatorModal from "../../../components/ui/UpdateCreatorModal";
import DepositModal from './DepositModal'
import Highlight from "react-highlight.js";
import classes from './creatordashboard.module.css'

import { getOwnerToken, getTokenDetail } from  '../../../utils/token'

function CreatorDashboard (props) {
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalDepositIsOpen, setModalDepositIsOpen] = useState(false)
  
  const [stName, setStName] = useState('')
  const [stSymbol, setStSymbol] = useState('')

  const getRewardToken = useCallback(async () => {
    const result = await getOwnerToken(props.creator)
    if(!result) { return }
    const token = await getTokenDetail(result[1])
    setStName(token.name)
    setStSymbol(token.symbol)
  }, [props.creator, getOwnerToken, getTokenDetail])

  useEffect(() => {
    if(props.creator) {
      getRewardToken()
    }
  }, [props, getRewardToken])

  if (!(stName && stSymbol)) {
    return <div />
  }

  async function depositHandler (event) {
    setModalDepositIsOpen(true)
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
          <Box><Typography variant="h6">Payments Earned (ETHx)</Typography></Box>
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h6">Interest Earned</Typography >
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={4}>
          <Typography variant="h6">{stSymbol} Token</Typography >
          <Typography variant="h6" color="primary">0.00</Typography>
        </Grid>
        <Grid item md={12}>
          <Box className={classes.snippet}>
            <Highlight language="javascript">
              {`const rootElement = document.getElementById("root"); 
        ReactDOM.render(<App />, rootElement);`}
            </Highlight>
          </Box>
        </Grid>
        <Grid item md={8}>
          <Button variant="contained" color="primary">Copy Payment Widget</Button>
        </Grid>
      </Grid>

      <UpdateCreatorModal
        currentUser={props.creator}
        open={modalIsOpen}
        handleCancel={() => setModalIsOpen(false)}
        handleCreate={() => setModalIsOpen(false)}></UpdateCreatorModal>

      <DepositModal
        open={modalDepositIsOpen}
        stSymbol={stSymbol}
        handleCancel={() => setModalDepositIsOpen(false)}
      />
    </div>
  )
}

export default CreatorDashboard