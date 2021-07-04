
import { ethers } from 'hardhat'

const ropstenHost = '0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2'
const ropstenCFAV1 = '0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88'

const main = async () => {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  
  const StreamPayment = await ethers.getContractFactory("StreamPayment");
  const streamPayment = await StreamPayment.deploy(ropstenHost, ropstenCFAV1);
  
  console.log("Contract deployed to:", streamPayment.address);
}

main();