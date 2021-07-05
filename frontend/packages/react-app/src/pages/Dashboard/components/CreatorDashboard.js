
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
  const [indexTab, setIndexTab] = useState(1)

  const getRewardToken = useCallback(async () => {
    const result = await getOwnerToken(props.creator)
    console.log(result)
    if(result) { 
      const token = await getTokenDetail(result[1])
      setStName(token.name)
      setStSymbol(token.symbol)
    }
    
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

  async function updateTabHandler(index) {
    setIndexTab(index)
  }

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item md={12}>
          <Box padding={3} className={classes.header}>
            <Typography variant="h4">Dashboard</Typography >
          </Box>
        </Grid>
        <Grid item md={12}>
          <Box align="center">
            <Button variant="contained" color="primary" size="large" disableElevation onClick={() => updateTabHandler(1)}>
              <Typography variant="h6">Overview</Typography>
            </Button>
            <Button variant="contained" color="secondary" size="large" disableElevation onClick={() => updateTabHandler(2)}>
              <Typography variant="h6">(Stream A)</Typography>
            </Button>
            <Button variant="contained" color="success" size="large" disableElevation onClick={() => updateTabHandler(2)}>
              <Typography variant="h6">(Stream B)</Typography>
            </Button>
            <Button variant="contained" color="warning" size="large" disableElevation onClick={() => updateTabHandler(2)}>
              <Typography variant="h6">(Stream C)</Typography>
            </Button>
            <Button variant="contained" color="warning" size="large" disableElevation onClick={() => updateTabHandler(2)}>
              <Typography variant="h6">(Stream D)</Typography>
            </Button>
          </Box>
        </Grid>
        {/* Buttons */}
        {/* <Grid item md={12}>
          <Box align="right">
            <Button variant="contained" color="primary" onClick={() => updateHandler()}>UpdateCreator</Button>
            <Button variant="contained" color="primary" onClick={() => depositHandler()}>+ Deposit</Button>
          </Box>
        </Grid> */}
        {/* statistic */}
        <Grid item md={12}>
          <Box padding={5} align="center">
            <Grid container spacing={1}>
              <Grid item md={4}>
                <Box><Typography variant="h6">Payments Earned (ETHx)</Typography></Box>
                <Typography variant="h3" color="primary">$ 4664.96  USD</Typography>
                <Typography variant="h6" color="secondary">1.98 ETHx</Typography>
              </Grid>
              <Grid item md={4}>
                <Typography variant="h6">+ Interest Earned</Typography >
                <Typography variant="h3" color="primary" className={classes.price}>$ 200.00 USD</Typography>
                <Typography variant="h6" color="secondary">0.085 ETHx</Typography>
              </Grid>
              <Grid item md={4}>
                <Typography variant="h6">{stSymbol} Token</Typography >
                <Typography variant="h3" color="primary">550 {stSymbol}</Typography>
                <Typography variant="h6" color="secondary">Distributed</Typography>
              </Grid>
            </Grid>
          </Box>
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