import React from 'react'
import { createContext, useState } from 'react'

const AppContext = createContext({
  currentWallet: '',
  provider: null,
  isCreator: false,
  setCurrentWallet: (address) => { },
  setWalletProvider: (provider) => { },
  clearWallet: () => { },
  setCreatorFlag: (flag) => { },
})

export function AppContextProvider (props) {
  const [address, setAddress] = useState('')
  const [provider, setProvider] = useState('')
  const [isCreator, setIsCreator] = useState(false)

  function setCurrentWallet (address) {
    setAddress(address)
  }

  function setWalletProvider (provider) {
    setProvider(provider)
  }

  function setCreatorFlag (flag) {
    setIsCreator(flag)
  }

  function clearWallet () {
    setAddress('')
    setProvider('')
    setIsCreator(false)
  }

  const context = {
    currentWallet: address,
    provider: provider,
    isCreator: isCreator,
    // method
    setCurrentWallet: setCurrentWallet,
    setWalletProvider: setWalletProvider,
    clearWallet: clearWallet,
    setCreatorFlag: setCreatorFlag,
  };

  return (
    <AppContext.Provider value={context}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContext;
