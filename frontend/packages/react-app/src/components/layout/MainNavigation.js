
import React from "react";
import { Header } from '..'
import { Button, Box } from '@material-ui/core'
import useWeb3Modal from "../../hooks/useWeb3Modal";

function WalletButton ({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Box padding={3}>
      <Button variant="contained" color="primary" href="/stream">
        + Create Stream
      </Button>
      <Button
        variant="contained" color="primary"
        onClick={() => {
          if (!provider) {
            loadWeb3Modal();
          } else {
            logoutOfWeb3Modal();
          }
        }}
      >
        {!provider ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
    </Box>
  );
}

function MainNavigationLayout () {

  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  return (
    <Header>
      <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
    </Header>
  )
}

export default MainNavigationLayout