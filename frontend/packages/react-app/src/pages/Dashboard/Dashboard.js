
import React from "react";
import Web3 from 'web3'
import { Body } from '../../components'
import { Button } from '@material-ui/core';
import CreatorDashboard from './components/CreatorDashboard'
import { useState, useContext, useEffect, useCallback } from 'react';
import { isEccoCreator } from '../../utils/stream-payment'
import { getOwnerToken } from '../../utils/token'
import AppContext from '../../store/app'

function Dashboard () {
  const appContext = useContext(AppContext)

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [account, setAccount] = useState('')
  const [isCreator, setIsCreator] = useState(false)

  const getWeb3Account = useCallback(async () => {
    var web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
      await web3.eth.getAccounts().then(async (accounts) => {
        setAccount(accounts[0])
        if (accounts) {
          const b = await isEccoCreator(accounts[0])
          setIsCreator(b)
        }
      });
    }
  }, [])

  useEffect(() => {
    if (!appContext.provider) {
      getWeb3Account()
    }
  }, [appContext.provider, getWeb3Account])

  return (<div>
    {!isCreator && <Body>
      <Button variant="contained" color="primary" href="/new">
        Launch your Creator Token
      </Button>
    </Body>}

    {isCreator && <CreatorDashboard creator={account} />}
  </div>)
}

export default Dashboard;