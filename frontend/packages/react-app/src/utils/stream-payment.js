import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { payment } from '../../../contracts/src/abis'
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

const SUPERAPP_ROPSTEN = process.env.STREAM_PAYMENT_ROPSTEN

function getContract (provider) {
  return new ethers.Contract(SUPERAPP_ROPSTEN, payment, provider)
}

/**
 * Start payment to creator
 * @param {*} signerAddress 
 * @param {*} paymentTokenAddress 
 * @param {*} apiKey 
 */
async function streamPayment (
  signerAddress,
  paymentTokenAddress,
  apiKey
) {
  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["ETHx"],
  });

  await sf.initialize();
  const abicoder = new ethers.utils.AbiCoder();

  await sf.cfa.createFlow({
    superToken: paymentTokenAddress,
    sender: signerAddress,
    receiver: getContract(new Web3Provider(window.ethereum)).address,
    flowRate: 1e8,
    userData: abicoder.encode(
      ["uint256", "address"],
      [1, apiKey]
    )
  })
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

export { streamPayment, streamSocialToken, cancelPaymentStream, cancelSocialStream }