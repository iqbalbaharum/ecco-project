import { ethers, ContractFactory  } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { abis, bytecode } from "@project/contracts";
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

function getContract (signer) {
  let signWallet
  if(!signer) {
    signWallet = new ethers.Wallet(
      `0x${process.env.REACT_APP_PRIVATE_KEY}`,
      ethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK)
    );
  } else {
    signWallet = signer
  }
  return new ethers.Contract(process.env.REACT_APP_SOCIALTOKENES_ADDRESS, abis.rewardTokenES, signWallet)
}

function getERC20Contract (signer) {
  let signWallet
  if(!signer) {
    signWallet = new ethers.Wallet(
      `0x${process.env.REACT_APP_PRIVATE_KEY}`,
      ethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK)
    );
  } else {
    signWallet = signer
  }
  return new ethers.Contract(process.env.REACT_APP_SOCIALTOKENES_ADDRESS, abis.erc20, signWallet)
}

async function generateNewToken (name, symbol, supply, creatorAddress) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner()
  const factory = new ContractFactory(abis.erc20, bytecode.token.bytecode, signer)

  const contract = await factory.deploy(
    name,
    symbol,
    parseInt(supply),
    creatorAddress
  ) 

  console.debug(`ERC20 Token generated: ${contract.address}`)
  
  generateNewSuperToken(signer, creatorAddress, contract.address.toString())
  return contract.address
}

async function generateNewSuperToken(signer, creatorAddress, erc20Address) {
  const contract = getContract(signer)

  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
  });

  await sf.initialize();
  
  const tokenInfo = await sf.contracts.TokenInfo.at(erc20Address);
  console.debug('convert to Super Token...')
  let supertoken = await contract.setUserSocialToken(creatorAddress, erc20Address)
  console.debug('complete converting to Super Token...')

  return supertoken
}

async function getOwnerToken(address) {
  const contract = getContract()
  return await contract.getOwnerToken(address)
}

async function getTokenDetail(address) {
  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
  });

  await sf.initialize();
  
  const tokenInfo = await sf.contracts.TokenInfo.at(address);
  const name = await tokenInfo.name()
  const symbol = await tokenInfo.symbol()
  return {
    name,
    symbol
  }
}

export { generateNewToken, getOwnerToken, getTokenDetail }