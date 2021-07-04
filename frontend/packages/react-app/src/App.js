import React from "react";
import { Route, Switch } from 'react-router-dom';

// import { Contract } from "@ethersproject/contracts";
// import { getDefaultProvider } from "@ethersproject/providers";
// import { useQuery } from "@apollo/react-hooks";
// import { addresses, abis } from "@project/contracts";
// import GET_TRANSFERS from "./graphql/subgraph";
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'

function App () {
  // const { loading, error, data } = useQuery(GET_TRANSFERS);

  // React.useEffect(() => {
  //   if (!loading && !error && data && data.transfers) {
  //     console.log({ transfers: data.transfers });
  //   }
  // }, [loading, error, data]);

  return (
    <MainLayout>
      <Switch>
        <Route path="/" exact>
          <Dashboard />
        </Route>
      </Switch>
    </MainLayout>
  );
}

export default App;
