
import React from "react";
import Web3 from 'web3'
import { Body } from '../components'
import { Button } from '@material-ui/core';
import NewCreatorModal from '../components/ui/NewCreatorModal'
import CreatorDashboard from '../components/dashboard/CreatorDashboard'
import { useState, useEffect } from 'react';

function Dashboard () {

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [account, setAccount] = useState('')
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    if (!account) {
      getAccountsUsingWeb3()
    }
  }, [getAccountsUsingWeb3, account]);

  async function getAccountsUsingWeb3 () {
    var web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
      web3.eth.getAccounts().then((account) => {
        setAccount(account)
      });
    }
  }

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

    {!isCreator && <CreatorDashboard />}
  </div>)
}

export default Dashboard;