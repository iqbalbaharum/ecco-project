import { useCallback, useEffect, useState, useContext } from "react";
import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import AppContext from '../store/app'
import { setIsCreator } from '../utils/stream-payment'

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const INFURA_ID = process.env.REACT_APP_INFURA_KEY;

const NETWORK_NAME = process.env.REACT_APP_NETWORK;

function useWeb3Modal (config = {}) {
  const appContext = useContext(AppContext)

  const [autoLoaded, setAutoLoaded] = useState(false);
  const [provider, setProvider] = useState(null);
  const { autoLoad = true, infuraId = INFURA_ID, NETWORK = NETWORK_NAME } = config;

  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const web3Modal = new Web3Modal({
    network: NETWORK,
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId,
        },
      },
    },
  });

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    setProvider(new Web3Provider(newProvider));
    appContext.setWalletProvider(new Web3Provider(newProvider))
  }, [appContext, web3Modal]);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      appContext.clearWallet()
      window.location.reload();
    },
    [appContext, web3Modal],
  );

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (autoLoad && !autoLoaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  }, [autoLoad, autoLoaded, loadWeb3Modal, setAutoLoaded, web3Modal.cachedProvider]);

  return [provider, loadWeb3Modal, logoutOfWeb3Modal];
}

export default useWeb3Modal;
