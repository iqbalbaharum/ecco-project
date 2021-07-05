import React, { useState, useCallback, useEffect, useContext } from "react";
import AppContext from './store/app'
import Web3 from 'web3'
import { Route, Switch } from 'react-router-dom';

// import { Contract } from "@ethersproject/contracts";
// import { getDefaultProvider } from "@ethersproject/providers";
// import { useQuery } from "@apollo/react-hooks";
// import { addresses, abis } from "@project/contracts";
// import GET_TRANSFERS from "./graphql/subgraph";
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Fan from './pages/Fan'
import NewTokenPage from './pages/NewToken/NewToken'
import CreateCreatorPage from './pages/CreateCreator/CreateCreator'

function App () {
  // const { loading, error, data } = useQuery(GET_TRANSFERS);

  // React.useEffect(() => {
  //   if (!loading && !error && data && data.transfers) {
  //     console.log({ transfers: data.transfers });
  //   }
  // }, [loading, error, data]);

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

  return (
    <MainLayout>
      <Switch>
        <Route path="/" exact>
          <Dashboard creator={account} />
        </Route>
        <Route path="/fan" exact>
          <Fan />
        </Route>
        <Route path="/new" exact>
          <NewTokenPage creator={account} />
        </Route>
        <Route path="/first" exact>
          <CreateCreatorPage creator={account} />
        </Route>
      </Switch>
    </MainLayout>
  );
}

export default App;
