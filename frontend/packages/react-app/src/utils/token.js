import { ethers, ContractFactory  } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { abis, bytecode } from "@project/contracts";
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

function getContract (signer) {
  let wallet
  
  if(!signer) {
    wallet = new ethers.Wallet(
      `0x${process.env.REACT_APP_PRIVATE_KEY}`,
      ethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK)
    );
  } else {
    wallet = new ethers.providers.Web3Provider(window.ethereum).getSigner()
  }

  return new ethers.Contract(process.env.REACT_APP_SOCIALTOKENES_ADDRESS, abis.rewardTokenES, wallet)
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
  
  console.log(contract.address)
  generateNewSuperToken(contract.address)

  return contract.address
}

async function generateNewSuperToken(erc20Address) {
  const contract = getContract()
  let supertoken = await contract.setUserSocialToken(erc20Address)

  console.log(await getOwnerToken())
  return getOwnerToken()
}

async function getOwnerToken(address) {
  const contract = getContract()
  return await contract.getOwnerToken(address)
}

export { generateNewToken, getOwnerToken }