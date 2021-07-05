import React, { useState, useCallback, useEffect, useContext } from "react";
import Web3 from 'web3'
import { Button, Box, Typography, Grid } from '@material-ui/core'
import { streamPayment, stopAllStream } from '../utils/stream-payment'
import AppContext from '../store/app'
import ReactPlayer from 'react-player/youtube'

function FanPage (props) {
  const appContext = useContext(AppContext)

  const [account, setAccount] = useState('')

  const getWeb3Account = useCallback(async () => {
    var web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
      await web3.eth.getAccounts().then(async (accounts) => {
        setAccount(accounts[0])
      });
    }
  }, [])

  useEffect(() => {
    if (!appContext.provider) {
      getWeb3Account()
    }
  }, [appContext.provider, getWeb3Account])

  function streamPaymentHandler () {
    streamPayment(
      account, // fanAddress
      process.env.REACT_APP_CREATOR_ADDRESS // creatorAddress
    )
  }

  function stopPaymentHandler () {
    stopAllStream(process.env.REACT_APP_CREATOR_ADDRESS)
  }

  return (
    <div>
      <Grid container spacing={3}>
        
        <Grid item md={12}>
          <Box align="center">
            Pay: Stream rate: 0.3 USD / minute - RECEIVE: fan reward 2 $ARTSTREAM/minute
          </Box>
        </Grid>
        <Grid item md={12}>
          <Box align="center">
            <ReactPlayer url='https://www.youtube.com/watch?v=ysz5S6PUM-U' />
          </Box>
        </Grid>
        <Grid item md={12}>
          <Box align="center">
            <Grid container>
              <Grid item md={6}>
                <Box>
                  <Button variant="contained" color="primary" onClick={() => stopPaymentHandler()}>Stop Payment</Button>
                </Box>
              </Grid>
              <Grid item md={6}>
                <Box align="center">
                  <Button variant="contained" color="primary" onClick={() => streamPaymentHandler()}>Payment</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

    </div>
  )
}

export default FanPage