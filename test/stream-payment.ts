import { solidity } from "ethereum-waffle";

import chai from "chai"
import { expect } from 'chai'
chai.use(solidity)

import { waffle, ethers } from "hardhat";
import { Contract } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ropstenHost = '0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2'
const ropstenCFAV1 = '0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88'
const ropstenEthx = '0x6fC99F5591b51583ba15A8C2572408257A1D2797'
const ropstenfDAIx = '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A'
const paymentRate = 385802469135802
const rewardRate = 385802469135802

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