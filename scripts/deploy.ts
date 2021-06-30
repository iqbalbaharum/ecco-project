
import { ethers } from 'hardhat'
import fs from 'fs'
import path from 'path'

const abi = JSON.parse(
  fs
    .readFileSync(
      path.resolve(
        __dirname,
        "../artifacts/contracts/StreamPayment.sol/StreamPayment.json"
      )
    )
    .toString()
).abi;

const main = async () => {
  const contractFactory = await ethers.getContractFactory("StreamPayment");
  const contract = await contractFactory.deploy(
    '0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2',
    '0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88',
    '0x6fC99F5591b51583ba15A8C2572408257A1D2797',
    '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A',
    '0xC1FB382bE621F5248a08f569A4Db0f1e460324CE'
  )
  
  console.log("Contract deployed to:", contract.address);
}

main();