
import React from "react";
import Web3 from 'web3'
import { Body } from '../components'
import { Button } from '@material-ui/core';
import NewCreatorModal from '../components/ui/NewCreatorModal'
import CreatorDashboard from '../components/dashboard/CreatorDashboard'
import { useState, useContext, useEffect, useCallback } from 'react';
import { isEccoCreator } from '../utils/stream-payment'
import AppContext from '../store/app'

function Dashboard () {
  const appContext = useContext(AppContext)

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [account, setAccount] = useState('')
  const [isCreator, setIsCreator] = useState(false)

  const getWeb3Account = useCallback(async () => {
    var web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
      await web3.eth.getAccounts().then((accounts) => {
        setAccount(accounts)
        if (accounts) { setIsCreator(isEccoCreator(accounts[0] ?? false)) }
      });
    }
  }, [])

  useEffect(() => {
    if (!appContext.provider) {
      getWeb3Account()
    }
  }, [appContext.provider, getWeb3Account])

  function onCreateCreatorHandler () {
    setModalIsOpen(true);
  }

  return (<div>
    {isCreator && <Body>
      <Button variant="contained" color="primary" onClick={onCreateCreatorHandler}>
        Create A Creator Account
      </Button>

      <NewCreatorModal currentUser={account} open={modalIsOpen} handleCancel={() => setModalIsOpen(false)} handleCreate={() => setModalIsOpen(false)}></NewCreatorModal>
    </Body>}

    {isCreator && <CreatorDashboard />}
  </div>)
}

export default Dashboard;