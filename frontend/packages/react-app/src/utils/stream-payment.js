import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { abis } from "@project/contracts";
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

const SUPERAPP_ADDRESS = process.env.REACT_APP_SUPERAPP_ADDRESS

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
  
  return new ethers.Contract(SUPERAPP_ADDRESS, abis.payment, wallet)
}

async function isEccoCreator (signerAddress) {
  const contract = getContract()
  return await contract.isEccoCreator(signerAddress)
}

async function getFlowRate (creatorAddress) {
  const contract = getContract()
  return await contract.getPaymentRate(creatorAddress)
}

async function getPaymentTokenAddress (creatorAddress) {
  const contract = getContract()
  let address = await contract.getPaymentTokenAddress(creatorAddress)
  return address
}

async function createCreator (creatorAddress, paymentTokenAddress, rewardTokenAddress, paymentRate, rewardRate) {
  const contract = getContract('signer')
  await contract.createEccoCreator(
    creatorAddress,
    paymentTokenAddress,
    rewardTokenAddress,
    parseFloat(paymentRate) * 1e18,
    parseFloat(rewardRate) * 1e18,
  )

  return isEccoCreator(creatorAddress)
}

async function updateCreator (creatorAddress, paymentTokenAddress, rewardTokenAddress, paymentRate, rewardRate) {
  const contract = getContract()
  console.log(creatorAddress,
    paymentTokenAddress,
    rewardTokenAddress,
    parseFloat(paymentRate) * 1e18,
    parseFloat(rewardRate) * 1e18
  )
  await contract.updateEccoCreator(
    creatorAddress,
    paymentTokenAddress,
    rewardTokenAddress,
    parseFloat(paymentRate) * 1e18,
    parseFloat(rewardRate) * 1e18,
  )
}

/**
 * Start payment to creator
 * @param {*} signerAddress 
 * @param {*} paymentTokenAddress 
 * @param {*} apiKey 
 */
async function streamPayment (
  fanAddress,
  creatorAddress
) {

  const superTokenAddress = await getPaymentTokenAddress(creatorAddress)
  console.log(superTokenAddress)

  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
  });

  await sf.initialize();

  const fanSf = sf.user({
    address: fanAddress,
    token: superTokenAddress
  });

  const abicoder = new ethers.utils.AbiCoder();
  let flow = await getFlowRate(creatorAddress)

  await fanSf.flow({
    recipient: SUPERAPP_ADDRESS,
    flowRate: flow,
    userData: abicoder.encode(
      ["uint256", "address"],
      [1, creatorAddress]
    )
  });
}

async function stopAllStream (creatorAddress) {
  const contract = getContract()
  return await contract.stopPaymentToEccoCreator(creatorAddress)
}

/**
 * Creator stream social token to SuperApp
 * @param {*} creatorAddress creator address
 * @param {*} socialTokenAddress SuperToken Address
 */
async function streamSocialToken (
  creatorAddress,
  socialTokenAddress,
) {
  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["ETHx"],
  });

  await sf.initialize();
  const abicoder = new ethers.utils.AbiCoder();

  await sf.cfa.createFlow({
    superToken: socialTokenAddress,
    sender: creatorAddress,
    flowRate: 1e8,
    userData: abicoder.encode(
      ["uint256", "address"],
      [0, ""]
    )
  })
}

/**
 * Cancel Fan payment stream
 * @param {*} signerAddress Fan address
 */
async function cancelPaymentStream (paymentTokenAddress, signerAddress) {
  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["ETHx"],
  });

  await sf.initialize()
  const abicoder = new ethers.utils.AbiCoder();

  await sf.cfa.deleteFlow({
    superToken: paymentTokenAddress,
    sender: signerAddress,
    receiver: getContract(new Web3Provider(window.ethereum)).address,
    userData: abicoder.encode(
      ["uint256"],
      [1]
    ),
  });
}

/**
 * Cancel creator streaming social token to superApp
 * @param {*} signerAddress 
 * @param {*} socialTokenAddress 
 */
async function cancelSocialStream (signerAddress, socialTokenAddress) {
  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["ETHx"],
  });

  await sf.initialize()
  const abicoder = new ethers.utils.AbiCoder();

  await sf.cfa.deleteFlow({
    superToken: socialTokenAddress,
    sender: signerAddress,
    receiver: getContract(new Web3Provider(window.ethereum)).address,
    userData: abicoder.encode(
      ["uint256"],
      [0]
    ),
  });
}

export {
  streamPayment,
  streamSocialToken,
  cancelPaymentStream,
  cancelSocialStream,
  isEccoCreator,
  createCreator,
  updateCreator,
  getPaymentTokenAddress,
  stopAllStream
}