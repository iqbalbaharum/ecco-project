import { solidity } from "ethereum-waffle";

import chai from "chai"
import { expect } from 'chai'
chai.use(solidity)

import { waffle, ethers } from "hardhat";
import { Contract } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ropstenHost = '0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2'
const goerliHost = '0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9'

const ropstenCFAV1 = '0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88'
const goerliCFAV1 = '0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8'

const ropstenEthx = '0x6fC99F5591b51583ba15A8C2572408257A1D2797'
const goerliEthx = '0x5943F705aBb6834Cad767e6E4bB258Bc48D9C947'

const ropstenfDAIx = '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A'
const goerlifDAIx = '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'

const paymentRate = 385802469135802
const rewardRate = 385802469135802

// 0x2c1929EE38950843211d1b22C31Ac18F5b23e0c0

describe('StreamPayment', () => {

    
    let wallet0: SignerWithAddress;
    let wallet1: SignerWithAddress;

    let streamPayment: Contract;
    beforeEach('deploy stream payment', async () => {
        [wallet0, wallet1] = await ethers.getSigners()
        const StreamPayment = await ethers.getContractFactory("StreamPayment");
        streamPayment = await StreamPayment.deploy(ropstenHost, ropstenCFAV1);
    })

    describe("#Create Ecco Creator", () => {

        it('Create Ecco creator success', async ()  => {
            await expect(streamPayment.createEccoCreator(wallet0.address, ropstenEthx, ropstenfDAIx, paymentRate, rewardRate))
            .to.emit(streamPayment, "EccoCreatorCreated")
            .withArgs(wallet0.address)
        })

    })


})