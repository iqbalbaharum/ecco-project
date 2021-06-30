import { ethers } from 'hardhat';
import { solidity } from "ethereum-waffle";
import chai from "chai";
import { Contract } from '@ethersproject/contracts';

chai.use(solidity)
const { expect } = chai

const SuperfluidSDK = require("@superfluid-finance/js-sdk");

describe("StreamPayment", function() {

  let superApp: Contract;
  let sf: any;

  // deploy contract
  beforeEach(async() => {
    const contractFactory = await ethers.getContractFactory("StreamPayment");
    const contract = await contractFactory.deploy(
      '0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2',
      '0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88',
      '0x6fC99F5591b51583ba15A8C2572408257A1D2797',
      '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A',
      '0xC1FB382bE621F5248a08f569A4Db0f1e460324CE'
    )

    superApp = await contract.deployed()

    sf = new SuperfluidSDK.Framework({
      ethers: ethers.provider
    });
    await sf.initialize()

    // start stream
    const fan = sf.user({
      address: '0x094Fe716ed543cF339e69Ec7c607F89350DA5f5d',
      token: '0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7' // fDai
    });
  
    await fan.flow({
      recipient: contract.address,
      flowRate: '385802469135802'
    });
  
    // display details
    const details = await fan.details();
    console.log(details);

    expect(superApp.address).to.properAddress;
  })
});
