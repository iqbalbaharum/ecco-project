import React, { useState, useCallback, useEffect, useContext } from "react";
import Web3 from 'web3'
import { Button } from '@material-ui/core'
import { streamPayment, stopAllStream } from '../utils/stream-payment'
import AppContext from '../store/app'

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
      <Button variant="contained" color="primary" onClick={() => streamPaymentHandler()}>Payment</Button>
      <Button variant="contained" color="primary" onClick={() => stopPaymentHandler()}>Stop Payment</Button>
    </div>
  )
}

export default FanPage